import {
  pgTable,
  bigserial,
  bigint,
  varchar,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const jobFilterGroups = pgTable(
  "job_filter_groups",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    name: varchar("name", { length: 64 }).notNull(),
    filtersJson: text("filters_json").notNull(),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("job_filter_groups_user").on(t.userId)]
);
