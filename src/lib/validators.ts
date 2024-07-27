import { definition } from "./../server/api/root";
import { min } from "drizzle-orm";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { create } from "domain";
import { formFields } from "@/server/db/schema";

export const withOrgId = z.object({
  orgId: z.string(),
});

// Field options validators
export const textFieldOptions = z.object({
  minLength: z.number().min(0),
  maxLength: z.number().min(1),
});

export const selectOption = z.object({
  positionIndex: z.number().min(0),
  label: z.string(),
});

export const multiSelectFieldOptions = z.object({
  multiSelect: z.boolean(), // Can you select more than one option
  options: z.array(selectOption),
});

// Universal data type stored in the fieldOptions field of the database
// Includes options for all possible fields
export const fieldOptions = z.object({
  options: z.array(selectOption),
});

export type FieldOptions = z.infer<typeof fieldOptions>;

export const defaultFieldOptions: FieldOptions = {
  options: [],
};

export const AddFieldSchema = createInsertSchema(formFields)
  .omit({
    id: true,
  })
  .strict();

export const RemoveFieldSchema = z.object({
  fieldId: z.string(),
});
