import { create } from "domain";
import { z } from "zod";

import {
  createTRPCRouter,
  orgScopedProcedure,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  withOrgId,
  AddFieldSchema,
  RemoveFieldSchema,
  formUpdateSchema,
} from "@/lib/validators";

import { db } from "@/server/db";
import { eq, asc } from "drizzle-orm";
import {
  form,
  boards,
  formFields,
  formResponse as formResponseDBSchema,
  formFieldResponse,
  type FieldOptions,
} from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

import { google } from "googleapis";
import { env } from "@/env";

import { logger } from "../utils/logger";

type SimplifiedType =
  | "text"
  | "multipleChoice"
  | "scale"
  | "date"
  | "time"
  | "fileUpload";

type TypeAndOptions = {
  type: SimplifiedType;
  options: any;
};

function getQuestionTypeAndData(question: object): TypeAndOptions {
  if ("choiceQuestion" in question) {
    return { type: "multipleChoice", options: question.choiceQuestion };
  } else if ("textQuestion" in question) {
    return { type: "text", options: question.textQuestion };
  } else if ("scaleQuestion" in question) {
    return { type: "scale", options: question.scaleQuestion };
  } else if ("dateQuestion" in question) {
    return { type: "date", options: question.dateQuestion };
  } else if ("timeQuestion" in question) {
    return { type: "time", options: question.timeQuestion };
  } else if ("fileUploadQuestion" in question) {
    return { type: "fileUpload", options: question.fileUploadQuestion };
  }

  // This line ensures exhaustiveness checking
  throw new Error("Unknown question type");
}

function getQuestionOptions(type: SimplifiedType, data: any): FieldOptions {
  if (type === "text") {
    console.log(data);
    return {
      optionType: "text",
      paragraph: data.paragraph ?? false,
    };
  }
  if (type === "multipleChoice") {
    return {
      optionType: "multipleChoice",
      type: data.type,
      options: data.options.map((option: any) => option.value),
    };
  }
  if (type === "fileUpload") {
    return {
      optionType: "fileUpload",
    };
  }

  throw new Error("Unknown question type");
}

export const formRouter = createTRPCRouter({
  // Returns a form with all fields properly ordered
  getFormWithFields: orgScopedProcedure("member")
    .input(withOrgId.extend({ formId: z.string() }))
    .query(async ({ input }) => {
      const formWithFields = await db.query.form.findFirst({
        where: eq(form.id, input.formId),
        with: {
          sections: {
            orderBy: asc(formSections.positionIndex),
            with: {
              fields: {
                orderBy: asc(formFields.positionIndex),
              },
            },
          },
        },
      });
      if (!formWithFields) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Form with id ${input.formId} not found`,
        });
      }
      return formWithFields;
    }),

  syncForm: protectedProcedure
    .input(
      z.object({
        formId: z.string(),
        initialSync: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // 1. Fetch form from google
      const client = new google.auth.OAuth2({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      });

      let formOwner;
      let responseAfterTimestamp = new Date(0).toISOString();

      if (input.initialSync) {
        formOwner = await ctx.db.query.users.findFirst({
          where: (user) => eq(user.id, ctx.session.user.id),
        });
        if (!formOwner) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `User with id ${ctx.session.user.id} not found`,
          });
        }
      } else {
        const form = await db.query.form.findFirst({
          where: (form) => eq(form.googleFormId, input.formId),
          with: {
            owner: true,
          },
        });
        if (!form || !form.owner) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Form with id ${input.formId} not found or has no owner`,
          });
        }

        responseAfterTimestamp = form.lastSyncedTimestamp.toISOString();
        formOwner = form.owner;
      }
      client.setCredentials({
        access_token: formOwner.googleAccessToken,
        refresh_token: formOwner.googleRefreshToken,
      });

      const forms = google.forms({ version: "v1", auth: client });

      logger.debug(`Getting responses after ${responseAfterTimestamp}`);

      const formResponsesPromise = forms.forms.responses.list({
        formId: input.formId,
        filter: `timestamp >= ${responseAfterTimestamp}`,
      });

      const formResponseFromGoogle = await forms.forms.get({
        formId: input.formId,
      });
      if (!formResponseFromGoogle.data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Form with google id ${input.formId} not found`,
        });
      }

      // 2. Update the form information
      const [updatedForm] = await db
        .insert(form)
        .values({
          googleFormId: input.formId,
          formName: formResponseFromGoogle.data.info?.title ?? "Untitled Form",
          formDriveName:
            formResponseFromGoogle.data.info?.documentTitle ?? "Untitled Form",
          formDescription: formResponseFromGoogle.data.info?.description ?? "",
          ownerId: formOwner.id,
          lastSyncedTimestamp: new Date(),
        })
        .onConflictDoUpdate({
          target: form.googleFormId,
          set: {
            formName:
              formResponseFromGoogle.data.info?.documentTitle ??
              "Untitled Form",
            formDriveName:
              formResponseFromGoogle.data.info?.title ?? "Untitled Form",
            formDescription:
              formResponseFromGoogle.data.info?.description ?? "",
            lastSyncedTimestamp: new Date(),
          },
        })
        .returning();

      if (!updatedForm) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update form",
        });
      }

      const formId = updatedForm.id;

      // 3. Sync the form fields
      // we need to be able to handle deletes anyways so just fetch all the fields
      const fieldWrites: Promise<any>[] = [];

      for (const [index, field] of (
        formResponseFromGoogle.data.items ?? []
      ).entries()) {
        if (!field.questionItem || !field.questionItem.question) {
          logger.debug("Skipping non question field");
          continue;
        }
        const question = field.questionItem.question;
        const { type: questionType, options } =
          getQuestionTypeAndData(question);

        logger.debug(`Processing field ${field.itemId} on form ${formId}`);
        // Create a new field
        const fieldData = {
          googleItemId: field.itemId,
          fieldName: field.title ?? "Untitled Field",
          fieldType: questionType,
          fieldOptions: getQuestionOptions(questionType, options),
          formId,
          positionIndex: index,
        };

        const newField = db
          .insert(formFields)
          .values(fieldData)
          .onConflictDoUpdate({
            target: formFields.googleItemId,
            set: fieldData,
          })
          .returning();

        fieldWrites.push(newField);
      }

      const updatedFields = await Promise.all(fieldWrites);
      logger.debug(`Updated ${updatedFields.length} fields`);

      // 4. Sync the form responses
      const formResponses = await formResponsesPromise;

      if (!formResponses.data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch form responses",
        });
      }

      const responses = formResponses.data.responses ?? [];

      logger.debug(
        `Fetched ${responses.length} responses submitted after ${responseAfterTimestamp}`,
      );

      const responsePromises = responses.map(async (response) => {
        const updateData = {
          googleResponseId: response.responseId,
          formId,
          respondentEmail: response.respondentEmail,
        };

        const [createdResponse] = await db
          .insert(formResponseDBSchema)
          .values(updateData)
          .onConflictDoUpdate({
            target: [
              formResponseDBSchema.googleResponseId,
              formResponseDBSchema.formId,
            ],
            set: updateData,
          })
          .returning();

        if (!createdResponse) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to create response with google id ${response.responseId} for form ${formId}`,
          });
        }
        logger.debug(`Created/Updated response ${createdResponse.id}`);

        if (!response.answers) {
          return;
        }

        // Sync the answers in a given response
        const answerPromises = Object.entries(response.answers).map(
          async ([questionId, responseData]) => {
            if (!responseData.textAnswers?.answers) {
              logger.debug("Skipping non text answer");
              return;
            }

            const data = {
              response: responseData.textAnswers.answers.reduce(
                (acc, answer) => {
                  return acc + answer.value;
                },
                "",
              ),
              formResponseId: createdResponse.id,
              googleQuestionId: questionId,
            };

            const [createdFieldResponse] = await db
              .insert(formFieldResponse)
              .values(data)
              .onConflictDoUpdate({
                target: [
                  formFieldResponse.googleQuestionId,
                  formFieldResponse.formResponseId,
                ],
                set: data,
              })
              .returning();

            if (!createdFieldResponse) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Failed to create field response for form response ${createdResponse.id}`,
              });
            }

            return createdFieldResponse;
          },
        );

        // Await all the answer updates concurrently for this response
        const result = await Promise.all(answerPromises);
        logger.debug(
          `Updated ${result.length} answers for response ${createdResponse.id}`,
        );
      });

      // Await all the response updates concurrently
      const result = await Promise.all(responsePromises);
      logger.debug(`Updated ${result.length} responses for form ${formId}`);

      return formResponseFromGoogle;
    }),
  getFile: protectedProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ ctx, input }) => {
      const client = new google.auth.OAuth2({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      });

      // Todo this eventually needs to be the existing owner
      const userToken = await ctx.db.query.users.findFirst({
        where: (user) => eq(user.id, ctx.session.user.id),
      });

      console.log(userToken);

      if (!userToken) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }

      client.setCredentials({
        access_token: userToken.googleAccessToken,
        refresh_token: userToken.googleRefreshToken,
      });

      // 1s22lrekgOnAYoUzgT84oo-qn1WakVT20

      // folder: 1LY2gfwPV1PmXdg9DYNDFiii6b02GpKXZZHS1WhYYR8eWJnMx6y7izgFVr4h5MsT4XCn-UrDQ

      // Fetch the file from google
      const drive = google.drive({ version: "v3", auth: client });
      const fileResponse = await drive.files.get({ fileId: input.fileId });

      const listResponse = await drive.files.list({
        q: `'${input.fileId}' in parents`,
      });

      if (!fileResponse.data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }
      return {
        fileResponse: fileResponse.data,
        listResponse: listResponse.data,
      };
    }),
});
