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
  type FieldOptions,
} from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

import { google } from "googleapis";
import { env } from "@/env";

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
  throw new Error("Unknown question type");
}

export const formRouter = createTRPCRouter({
  create: orgScopedProcedure("admin")
    .input(withOrgId)
    .mutation(async ({ input, ctx }) => {
      try {
        const formTransaction = await db.transaction(async (trx) => {
          const [newBoard] = await trx.insert(boards).values({}).returning();

          if (!newBoard) {
            throw new Error("Failed to create new board");
          }

          const [newForm] = await trx
            .insert(form)
            .values({
              organizationId: input.orgId,
              boardId: newBoard.id,
              formName: "New Form",
            })
            .returning();

          if (!newForm) {
            throw new Error("Failed to create new form");
          }
          // Create parent section
          const [newParentSection] = await trx
            .insert(formSections)
            .values({
              formId: newForm.id,
              sectionName: "Parent Section",
              positionIndex: 0, // Always first
            })
            .returning();

          if (!newParentSection) {
            throw new Error("Failed to create parent section");
          }

          // Create a default field

          const [newField] = await trx
            .insert(formFields)
            .values({
              formId: newForm.id,
              sectionId: newParentSection.id,
              fieldName: "New Field",
              fieldType: "text",
              positionIndex: 0,
            })
            .returning();

          return newForm;
        });

        return formTransaction;
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create form",
        });
      }
    }),

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
  // Just create / update a form field for now
  addField: orgScopedProcedure("admin")
    .input(withOrgId.merge(AddFieldSchema))
    .mutation(async ({ input }) => {
      try {
        // Todo ensure that json is in correct format
        const newField = await db.insert(formFields).values(input).returning();
        return newField;
      } catch (error) {
        console.log(error);
        return error;
      }
    }),
  removeField: protectedProcedure
    .input(RemoveFieldSchema)
    .mutation(async ({ input }) => {
      try {
        const deletedField = await db
          .delete(formFields)
          .where(eq(formFields.id, input.fieldId))
          .returning();
        return deletedField;
      } catch (error) {
        console.log(error);
        return error;
      }
    }),

  updateForm: protectedProcedure
    .input(formUpdateSchema.array())
    .mutation(async ({ input }) => {
      try {
        const updates = [];
        for (const update of input) {
          if (update.type === "field") {
            console.log(update);

            const { id, ...data } = update.data;

            const result = await db
              .update(formFields)
              .set(data)
              .where(eq(formFields.id, update.data.id as string))
              .returning();
            updates.push(result);
          } else if (update.type === "form") {
            const { id, ...data } = update.data;
            updates.push(
              await db
                .update(form)
                .set(data)
                .where(eq(form.id, id as string))
                .returning(),
            );
          } else if (update.type === "new") {
            updates.push(
              await db.insert(formFields).values(update.data).returning(),
            );
          } else if (update.type === "delete") {
            console.log(update);
            updates.push(
              await db
                .delete(formFields)
                .where(eq(formFields.id, update.data.id))
                .returning(),
            );
          }
        }
        return updates;
      } catch (error) {
        console.log(error);
        return error;
      }
    }),

  syncForm: protectedProcedure
    .input(
      z.object({
        formId: z.string(),
      }),
    )
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

      // Fetch the form from google
      const forms = await google.forms({ version: "v1", auth: client });
      const formResponse = await forms.forms.get({ formId: input.formId });
      if (!formResponse.data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      // Sync the form with the database

      // 1. Check if the form exists in the database
      const existingForm = await db.query.form.findFirst({
        where: (form) => eq(form.googleFormId, input.formId),
        with: {
          formFields: true,
          formResponses: true,
        },
      });

      let formId = "";
      const fieldIdSet = new Set<string>(); // Set of existing field ids
      const responseIdSet = new Set<string>(); // Set of existing response ids

      if (!existingForm) {
        // Create a new form
        const [newForm] = await db
          .insert(form)
          .values({
            googleFormId: input.formId,
            formName: formResponse.data.info?.documentTitle ?? "Untitled Form",
            formDescription: formResponse.data.info?.description ?? "",
            ownerId: ctx.session.user.id,
          })
          .returning();

        if (!newForm) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create form",
          });
        }
        formId = newForm.id;
      } else {
        formId = existingForm.id;
        for (const field of existingForm.formFields ?? []) {
          console.log("Form already has field: " + field.googleItemId);
          fieldIdSet.add(field.googleItemId ?? "");
        }

        for (const response of existingForm.formResponses ?? []) {
          console.log(
            "Form already has response: " + response.googleResponseId,
          );
          responseIdSet.add(response.googleResponseId ?? "");
        }

        // Update form name and description
        await db
          .update(form)
          .set({
            formName: formResponse.data.info?.documentTitle ?? "Untitled Form",
            formDescription: formResponse.data.info?.description ?? "",
          })
          .where(eq(form.id, formId));
      }

      // 2. Sync the form fields
      // we need to be able to handle deletes anyways so just fetch all the fields
      for (const field of formResponse.data.items ?? []) {
        if (!field.questionItem || !field.questionItem.question) {
          console.log("Skipping non question item");
          continue;
        }
        const question = field.questionItem.question;
        const { type: questionType, options } =
          getQuestionTypeAndData(question);

        if (fieldIdSet.has(field.itemId ?? "")) {
          // Todo Update the field
          console.log(`Updating field google id: ${field.itemId}`);
          continue;
        }

        console.log("Creating new field with google id: " + field.itemId);
        // Create a new field
        const [newField] = await db
          .insert(formFields)
          .values({
            googleItemId: field.itemId,
            fieldName: field.title ?? "Untitled Field",
            fieldType: questionType,
            fieldOptions: getQuestionOptions(questionType, options),
            formId,
          })
          .returning();
      }

      // 3. Sync the form responses
      const formResponses = await forms.forms.responses.list({
        formId: input.formId,
      });

      if (!formResponses.data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch form responses",
        });
      }

      // Sync the responses
      for (const response of formResponses.data.responses ?? []) {
        // Check if the response exists
        if (responseIdSet.has(response.responseId ?? "")) {
          console.log("Skipping existing response");
          continue;
        }

        // Create a new response
        const [newResponse] = await db
          .insert(formResponseDBSchema)
          .values({
            googleResponseId: response.responseId,
            formId,
            respondentEmail: response.respondentEmail,
          })
          .returning();

        // Sync the answers
      }

      return formResponse;
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
