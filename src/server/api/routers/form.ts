import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

import { db } from "@/server/db";
import { organizations } from "@/server/db/schema";

export const orgForm = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ organizationName: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const newOrg = await db
          .insert(organizations)
          .values({
            organizationName: input.organizationName,
          })
          .returning();

        return newOrg;
      } catch (error) {
        console.log(error);
        return error;
      }
    }),
});
