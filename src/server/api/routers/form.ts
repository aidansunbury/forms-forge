import { z } from "zod";

import { createTRPCRouter, orgScopedProcedure } from "@/server/api/trpc";
import { withOrgId, AddFieldSchema, RemoveFieldSchema } from "@/lib/validators";

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
  removeField: orgScopedProcedure("admin")
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
});
