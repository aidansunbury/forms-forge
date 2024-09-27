import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { fieldOptions, formFields } from "@/server/db/schema";
import { FieldOptionsValidator } from "@/server/db/schema.types";

export const createFormFieldValidator = createInsertSchema(formFields)
    .omit({
        id: true,
        isGoogleField: true,
        googleItemId: true,
        googleQuestionId: true,

        // These should be created automatically
        positionIndex: true,
        positionSubIndex: true,

        // All augmentation fields can't be required
        required: true,
    })
    .extend({
        fieldOptions: FieldOptionsValidator,
    });
