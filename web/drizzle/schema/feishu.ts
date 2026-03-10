import {
  pgTable,
  bigserial,
  bigint,
  integer,
  varchar,
  text,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";

export const feishuSyncConfigs = pgTable(
  "feishu_sync_configs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    dataType: varchar("data_type", { length: 20 }).notNull(),
    appId: varchar("app_id", { length: 64 }),
    appSecret: varchar("app_secret", { length: 128 }),
    appToken: varchar("app_token", { length: 256 }),
    tableId: varchar("table_id", { length: 100 }),
    viewId: varchar("view_id", { length: 100 }),
    fieldMapping: text("field_mapping"),
    syncIntervalMinutes: integer("sync_interval_minutes").default(60).notNull(),
    autoSyncEnabled: boolean("auto_sync_enabled").default(true).notNull(),
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("feishu_sync_configs_data_type").on(t.dataType)]
);

export const syncTasks = pgTable(
  "sync_tasks",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    configId: bigint("config_id", { mode: "number" }),
    dataType: varchar("data_type", { length: 20 }).notNull(),
    triggerType: varchar("trigger_type", { length: 20 }).notNull(),
    status: varchar("status", { length: 20 }).notNull(),
    insertCount: integer("insert_count").default(0).notNull(),
    updateCount: integer("update_count").default(0).notNull(),
    skipCount: integer("skip_count").default(0).notNull(),
    failCount: integer("fail_count").default(0).notNull(),
    failReason: varchar("fail_reason", { length: 2000 }),
    operatorId: bigint("operator_id", { mode: "number" }),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    index("sync_tasks_data_type").on(t.dataType),
    index("sync_tasks_status").on(t.status),
    index("sync_tasks_started_at").on(t.startedAt),
  ]
);
