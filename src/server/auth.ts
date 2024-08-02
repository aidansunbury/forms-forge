import { google } from "googleapis";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import Google from "next-auth/providers/google";

import { env } from "@/env";
import { db } from "@/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
  userOrganizations,
  organizations,
} from "@/server/db/schema";

import { eq } from "drizzle-orm";

type OrgRelation = {
  userId: string;
  organizationId: string;
  organization: {
    organizationName: string;
    organizationSlug: string;
  };
  role: string;
};

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      googleAccessToken: string;
      organizations: OrgRelation[];
    } & DefaultSession["user"];
  }

  interface User {
    googleAccessToken: string;
    organizations: OrgRelation[];
  }
}

// Used to include the user's organization roles in the session object.
export function CustomAdapter(
  client: any, //PgDatabase<QueryResultHKT, any>,
  schema?: any, //DefaultPostgresSchema
): Adapter {
  const originalAdapter = DrizzleAdapter(client, schema);

  const customAdapter = {
    ...originalAdapter,
    async getSessionAndUser(sessionToken: string) {
      const test2 = await db.query.sessions.findFirst({
        where: (sessions, { eq }) => eq(sessions.sessionToken, sessionToken),
        with: {
          user: {
            columns: {
              googleRefreshToken: false,
            },
            with: {
              organizations: {
                with: {
                  organization: true,
                },
              },
            },
          },
        },
      });

      if (!test2) {
        return null;
      }

      const formatted = {
        session: {
          sessionToken: test2.sessionToken,
          expires: test2.expires,
          userId: test2.userId,
        },
        user: test2.user,
      };

      console.log("formatted", formatted);

      return formatted;
    },
  };

  return customAdapter as any;
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => {
      // console.log("session", session);
      // console.log("user", user);
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          googleAccessToken: user.googleAccessToken,
          organizations: user.organizations,
        },
      };
    },
    signIn: async ({ account, profile, user, credentials, email }) => {
      console.log("account", account);
      // refresh 1//0fEoWA4OO3ZoiCgYIARAAGA8SNwF-L9IrvyQ9KI1kQlxgRe9Jrr8PmOom4uyhsXM1-m8A_VieyuLs8Y9GMOHLCEbkFHT7YPR4X7s
      // access token ya29.a0AXooCgvsIGOIIT1xRj7vM7KvLRoaO25f383B_9GDOxbi7gLstg-KfWkWU2CGUTio-8y-9llV0jaymqLbKxwS4tKn78Wg05SlWx0ZlYgKFJ0YOvI8VtRnU6Fj9eKESQBIPL5sMESz99ZqEjNuL-Jx6JWp11REalIhsHbOaCgYKARESARESFQHGX2Mitw3fRzDtfELnJ9uzLTjHjg0171
      // console.log("profile", profile);
      console.log("user", user);

      // google access tokens expire every hour

      // Store tokens in db
      await db
        .update(users)
        .set({
          googleAccessToken: account?.access_token,
          googleRefreshToken: account?.refresh_token,
        })
        .where(eq(users.id, user.id))
        .returning();

      return true;
    },
  },
  adapter: CustomAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    userOrganizations,
    verificationTokensTable: verificationTokens,
  }) as Adapter,
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: [
            "openid email profile",
            "https://www.googleapis.com/auth/drive.file", // Add the Drive scope
          ].join(" "),
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
