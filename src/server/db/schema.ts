import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
  json,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";
import crypto from "crypto";

export type FieldOptions = {
  options: {
    positionIndex: number;
    label: string;
  }[];
};

export const defaultFieldOptions: FieldOptions = {
  options: [],
};

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `${name}`);

// Function to generate a prefixed UUID
const generatePrefixedUUID = (prefix: string) => {
  const uuid = crypto.randomUUID();
  return `${prefix}_${uuid}`;
};

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  organizations: many(userOrganizations),
  formResponses: many(formResponse),
}));

export const organizations = createTable(
  "organization",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => generatePrefixedUUID("organization")),
    organizationName: varchar("organization_name", { length: 255 }).notNull(),
    organizationSlug: varchar("organization_slug", { length: 255 })
      .notNull()
      .unique(),
  },
  (organizations) => ({
    organizationSlugIdx: index("organization_organization_slug_idx").on(
      organizations.organizationSlug,
    ),
  }),
);

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(userOrganizations),
  forms: many(form),
}));

// Many to many relationship between users and organizations
// Join table for many-to-many relationship between users and organizations
// Each user has a role in the organization

export const roleEnum = pgEnum("role_enum", ["admin", "reviewer", "member"]);

export const userOrganizations = createTable(
  "user_organizations",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    organizationId: varchar("organization_id")
      .notNull()
      .references(() => organizations.id),
    role: varchar("role", { length: 255 }),
  },
  (userOrganizations) => ({
    compoundKey: primaryKey({
      columns: [userOrganizations.userId, userOrganizations.organizationId],
    }),
    userIdIdx: index("user_organizations_user_id_idx").on(
      userOrganizations.userId,
    ),
    organizationIdIdx: index("user_organizations_organization_id_idx").on(
      userOrganizations.organizationId,
    ),
  }),
);

export const userOrganizationsRelations = relations(
  userOrganizations,
  ({ one }) => ({
    user: one(users, {
      fields: [userOrganizations.userId],
      references: [users.id],
    }),
    organization: one(organizations, {
      fields: [userOrganizations.organizationId],
      references: [organizations.id],
    }),
  }),
);

//* Form Fields

export const form = createTable(
  "form",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => generatePrefixedUUID("form")),
    formName: varchar("form_name").notNull(),
    formDescription: varchar("form_description"),
    formOptions: json("form_options"),
    boardId: varchar("board_id", { length: 255 })
      .notNull()
      .references(() => boards.id),
    organizationId: varchar("organization_id")
      .notNull()
      .references(() => organizations.id),
  },
  (form) => {
    return {
      organizationIdIdx: index("form_organization_id_idx").on(
        form.organizationId,
      ),
    };
  },
);

export const formRelations = relations(form, ({ many, one }) => ({
  formFields: many(formFields),
  formResponses: many(formResponse),
  organization: one(organizations, {
    fields: [form.organizationId],
    references: [organizations.id],
  }),
  board: one(boards),
  sections: many(formSections),
}));

export const formSections = createTable("form_sections", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => generatePrefixedUUID("section")),
  formId: varchar("form_id", { length: 255 })
    .notNull()
    .references(() => form.id),
  sectionName: varchar("section_name").notNull(),
  sectionDescription: varchar("section_description"),
  positionIndex: integer("section_index").notNull(), // Order of the section in the form just use numbers with lots of space between them
});

export const formSectionsRelations = relations(
  formSections,
  ({ one, many }) => ({
    form: one(form, { fields: [formSections.formId], references: [form.id] }),
    fields: many(formFields),
  }),
);

export const fieldTypeEnum = pgEnum("field_type_enum", [
  "text",
  "multipleChoice",
]);

export const formFields = createTable("form_fields", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => generatePrefixedUUID("field")),
  formId: varchar("form_id", { length: 255 })
    .notNull()
    .references(() => form.id),
  sectionId: varchar("section_id", { length: 255 })
    .notNull()
    .references(() => formSections.id),
  positionIndex: integer("position_index").notNull(), // Order of the field in the section
  fieldName: varchar("field_name").notNull(),
  fieldDescription: varchar("field_description"),
  fieldType: fieldTypeEnum("field_type").notNull(),
  fieldOptions: json("field_options")
    .$type<FieldOptions>()
    .notNull()
    .default(defaultFieldOptions),
  required: boolean("required").notNull().default(false),
});

export const formFieldsRelations = relations(formFields, ({ one }) => ({
  form: one(form, { fields: [formFields.formId], references: [form.id] }),
  section: one(formSections, {
    fields: [formFields.sectionId],
    references: [formSections.id],
  }),
}));

export const formStatusEnum = pgEnum("form_status_enum", [
  "started",
  "completed",
  "submitted",
]);

//* This is the key entity for the application system
export const formResponse = createTable("form_responses", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => generatePrefixedUUID("response")),
  // userId: varchar("user_id", { length: 255 }).notNull(), // todo create relation
  formId: varchar("form_id")
    .notNull()
    .references(() => form.id),
  columnId: varchar("column_id", { length: 255 })
    .notNull()
    .references(() => columns.id),
  positionIndex: integer("position_index").notNull(), // Order of the response in the column
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  status: formStatusEnum("status").notNull(),
});

export const formResponseRelations = relations(formResponse, ({ one }) => ({
  form: one(form, { fields: [formResponse.formId], references: [form.id] }),
  user: one(users),
  column: one(columns),
}));

export const formFieldResponse = createTable("form_field_responses", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => generatePrefixedUUID("field_response  ")),
  formResponseId: varchar("form_response_id", { length: 255 })
    .notNull()
    .references(() => formResponse.id),
  formFieldId: varchar("form_field_id", { length: 255 })
    .notNull()
    .references(() => formFields.id),
  response: text("response"),
});

export const formFieldResponseRelations = relations(
  formFieldResponse,
  ({ one }) => ({
    formResponse: one(formResponse, {
      fields: [formFieldResponse.formResponseId],
      references: [formResponse.id],
    }),
    formField: one(formFields, {
      fields: [formFieldResponse.formFieldId],
      references: [formFields.id],
    }),
  }),
);

//* Boards for organizing forms after the form is submitted

// Each form has a board to keep track of the form responses
export const boards = createTable("board", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => generatePrefixedUUID("board")),

  // boardName: varchar("board_name", { length: 255 }).notNull(),
  // createdAt: timestamp("created_at", { withTimezone: true })
  //   .default(sql`CURRENT_TIMESTAMP`)
  //   .notNull(),
});

// Relationships
export const boardsRelations = relations(boards, ({ many, one }) => ({
  columns: many(columns),
  form: one(form),
}));

// Columns table
export const columns = createTable(
  "column",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => generatePrefixedUUID("column")),
    columnName: varchar("column_name", { length: 255 }).notNull(),
    boardId: varchar("board_id", { length: 255 })
      .notNull()
      .references(() => boards.id),
    positionIndex: integer("position_index").notNull(), // Used to order the columns on the board
    // createdAt: timestamp("created_at", { withTimezone: true })
    //   .default(sql`CURRENT_TIMESTAMP`)
    //   .notNull(),
  },
  (column) => ({
    boardIdIdx: index("column_board_id_idx").on(column.boardId),
  }),
);

export const columnsRelations = relations(columns, ({ one, many }) => ({
  board: one(boards, {
    fields: [columns.boardId],
    references: [boards.id],
  }),
  formResponses: many(formResponse),
}));

//* NextAuth tables

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);
