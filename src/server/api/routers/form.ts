import { z } from "zod";

import {
  createTRPCRouter,
  orgScopedProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import {
  withOrgId,
  AddFieldSchema,
  RemoveFieldSchema,
  formUpdateSchema,
} from "@/lib/validators";

import { db } from "@/server/db";
import { eq, asc } from "drizzle-orm";
import { form, boards, formSections, formFields } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

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
});
