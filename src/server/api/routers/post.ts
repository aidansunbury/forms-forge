import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  orgScopedProcedure,
} from "@/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getSecretMessage: protectedProcedure.query(({ ctx }) => {
    return "hi there" + JSON.stringify(ctx.session);
  }),

  orgScoped: orgScopedProcedure("admin")
    .input(z.object({ orgId: z.string() }))
    .query(({ input }) => {
      return {
        orgId: input.orgId,
      };
    }),
});
