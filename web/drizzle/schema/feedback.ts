import {
  pgTable,
  bigserial,
  bigint,
  varchar,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const feedback = pgTable(
  "feedback",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    type: varchar("type", { length: 32 }),
    content: text("content"),
    status: varchar("status", { length: 20 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("feedback_status").on(t.status), index("feedback_created_at").on(t.createdAt)]
);
