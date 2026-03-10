import {
  pgTable,
  bigserial,
  varchar,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const dictFields = pgTable("dict_fields", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  fieldKey: varchar("field_key", { length: 32 }).unique().notNull(),
  fieldName: varchar("field_name", { length: 64 }).notNull(),
  fieldType: varchar("field_type", { length: 20 }).notNull(),
  required: integer("required").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const dictItems = pgTable(
  "dict_items",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    fieldKey: varchar("field_key", { length: 32 }).notNull(),
    code: varchar("code", { length: 64 }),
    label: varchar("label", { length: 128 }).notNull(),
    sortOrder: integer("sort_order").default(0),
    status: varchar("status", { length: 20 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    index("dict_items_field_status").on(t.fieldKey, t.status),
    index("dict_items_field_sort").on(t.fieldKey, t.sortOrder),
  ]
);
