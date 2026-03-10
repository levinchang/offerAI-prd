import {
  pgTable,
  bigserial,
  bigint,
  varchar,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const favorites = pgTable(
  "favorites",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    targetType: varchar("target_type", { length: 20 }).notNull(),
    targetId: bigint("target_id", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    uniqueIndex("favorites_user_target").on(t.userId, t.targetType, t.targetId),
    index("favorites_user").on(t.userId),
  ]
);

export const applyRecords = pgTable(
  "apply_records",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    sourceType: varchar("source_type", { length: 20 }).notNull(),
    campusJobId: bigint("campus_job_id", { mode: "number" }),
    civilPostId: bigint("civil_post_id", { mode: "number" }),
    companyName: varchar("company_name", { length: 128 }),
    jobTitle: varchar("job_title", { length: 128 }),
    stage: varchar("stage", { length: 32 }).notNull(),
    resumeId: bigint("resume_id", { mode: "number" }),
    groupId: bigint("group_id", { mode: "number" }),
    remark: varchar("remark", { length: 500 }),
    appliedAt: timestamp("applied_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    index("apply_records_user").on(t.userId),
    index("apply_records_user_stage").on(t.userId, t.stage),
    index("apply_records_campus_job").on(t.campusJobId),
    index("apply_records_group").on(t.groupId),
  ]
);

export const userGroups = pgTable(
  "user_groups",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    name: varchar("name", { length: 64 }).notNull(),
    sortOrder: bigint("sort_order", { mode: "number" }).default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("user_groups_user").on(t.userId)]
);

export const resumes = pgTable(
  "resumes",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    fileUrl: varchar("file_url", { length: 512 }),
    fileSize: bigint("file_size", { mode: "number" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("resumes_user").on(t.userId)]
);
