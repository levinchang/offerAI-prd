import {
  pgTable,
  bigserial,
  bigint,
  varchar,
  text,
  decimal,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const docs = pgTable(
  "docs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    industry: varchar("industry", { length: 64 }),
    jobType: varchar("job_type", { length: 128 }),
    companyTags: varchar("company_tags", { length: 256 }),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    previewPages: integer("preview_pages").default(3).notNull(),
    fileKey: varchar("file_key", { length: 256 }),
    sourceDocUrl: varchar("source_doc_url", { length: 512 }),
    saleCount: integer("sale_count").default(0).notNull(),
    status: varchar("status", { length: 20 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    index("docs_status").on(t.status),
    index("docs_industry").on(t.industry),
    index("docs_updated_at").on(t.updatedAt),
  ]
);

export const userDocAccess = pgTable(
  "user_doc_access",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    docId: bigint("doc_id", { mode: "number" }).notNull(),
    orderId: bigint("order_id", { mode: "number" }),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    uniqueIndex("user_doc_access_user_doc").on(t.userId, t.docId),
    index("user_doc_access_user").on(t.userId),
  ]
);
