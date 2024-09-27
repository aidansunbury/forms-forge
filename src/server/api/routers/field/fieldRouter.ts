import { z } from "zod";

import {
    createTRPCRouter,
    orgScopedProcedure,
    protectedProcedure,
    publicProcedure,
} from "@/server/api/trpc";

import { db } from "@/server/db";
import {
    form,
    formFieldResponse,
    formFields,
    formResponse as formResponseDBSchema,
} from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import type { InferInsertModel } from "drizzle-orm";

import { logger } from "../../utils/logger";

import { createFormFieldValidator } from "./fieldValidators";

// Question group items are the "checkbox grid" type of question

export const fieldRouter = createTRPCRouter({
    // Procedure for creating a field on a form
    createField: protectedProcedure
        .input(createFormFieldValidator)
        .mutation(async ({ input }) => {
            logger.debug(`Creating field of type ${input.fieldType}`);

            const newField = await db.transaction(async (trx) => {
                const newForm: InferInsertModel<typeof formFields> = {
                    ...input,
                    isGoogleField: false,
                    fieldOptions: {
                        optionType: "text",
                        paragraph: false,
                    },
                    required: false,
                };

                const [insertedFields] = await trx
                    .insert(formFields)
                    .values(newForm)
                    .returning();

                return insertedFields;
            });

            return newField;
        }),
});
