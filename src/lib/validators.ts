import { form, formFields } from "@/server/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const withOrgId = z.object({
    orgId: z.string(),
});
