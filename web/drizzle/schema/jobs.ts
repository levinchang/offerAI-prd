import {
  pgTable,
  bigserial,
  integer,
  varchar,
  text,
  date,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";

export const campusJobs = pgTable(
  "campus_jobs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    sourceKey: varchar("source_key", { length: 128 }).unique().notNull(),
    sourceLabel: varchar("source_label", { length: 32 }),
    companyName: varchar("company_name", { length: 128 }),
    companyType: varchar("company_type", { length: 32 }),
    recruitType: varchar("recruit_type", { length: 32 }),
    city: varchar("city", { length: 64 }),
    jobTitle: varchar("job_title", { length: 128 }),
    industry: varchar("industry", { length: 64 }),
    sourceName: varchar("source_name", { length: 128 }),
    applyStartDate: date("apply_start_date"),
    applyEndDate: date("apply_end_date"),
    graduateRequirement: varchar("graduate_requirement", { length: 256 }),
    applyUrl: varchar("apply_url", { length: 512 }),
    originalUrl: varchar("original_url", { length: 512 }),
    publishStatus: varchar("publish_status", { length: 20 }).notNull(),
    lifecycle: varchar("lifecycle", { length: 20 }).notNull(),
    manualLock: boolean("manual_lock").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    index("campus_jobs_publish_lifecycle").on(t.publishStatus, t.lifecycle),
    index("campus_jobs_updated_at").on(t.updatedAt),
    index("campus_jobs_industry").on(t.industry),
  ]
);

export const civilPosts = pgTable(
  "civil_posts",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    sourceKey: varchar("source_key", { length: 128 }).unique().notNull(),
    sourceLabel: varchar("source_label", { length: 32 }),
    title: varchar("title", { length: 256 }),
    province: varchar("province", { length: 32 }),
    region: varchar("region", { length: 64 }),
    postType: varchar("post_type", { length: 32 }),
    detail: text("detail"),
    applyStartDate: date("apply_start_date"),
    applyEndDate: date("apply_end_date"),
    recruitCount: integer("recruit_count"),
    positionCount: integer("position_count"),
    educationRequirement: varchar("education_requirement", { length: 128 }),
    ageRequirement: varchar("age_requirement", { length: 64 }),
    positionsText: varchar("positions_text", { length: 512 }),
    originalUrl: varchar("original_url", { length: 512 }),
    publishStatus: varchar("publish_status", { length: 20 }).notNull(),
    lifecycle: varchar("lifecycle", { length: 20 }).notNull(),
    manualLock: boolean("manual_lock").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    index("civil_posts_publish_lifecycle").on(t.publishStatus, t.lifecycle),
    index("civil_posts_updated_at").on(t.updatedAt),
  ]
);
