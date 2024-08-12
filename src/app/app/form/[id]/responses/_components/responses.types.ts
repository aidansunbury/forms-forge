import type {
	formFieldResponse,
	formResponse,
	formFields,
} from "@/server/db/schema";
import type { InferSelectModel } from "drizzle-orm";

export type FieldResponsesWithFormField = InferSelectModel<
	typeof formFieldResponse
> & {
	formField: InferSelectModel<typeof formFields>;
};

export type FormResponseWithFieldResponses = InferSelectModel<
	typeof formResponse
> & {
	formFieldResponses: FieldResponsesWithFormField[];
};

export type BlockSize = "small" | "medium" | "large";
