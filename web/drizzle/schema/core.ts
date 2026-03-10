import {
  pgTable,
  bigserial,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    openid: varchar("openid", { length: 64 }).unique(),
    unionid: varchar("unionid", { length: 64 }),
    phone: varchar("phone", { length: 20 }).unique(),
    nickname: varchar("nickname", { length: 64 }),
    avatarUrl: varchar("avatar_url", { length: 512 }),
    role: varchar("role", { length: 20 }).default("user"),
    utmSource: varchar("utm_source", { length: 64 }),
    utmCampaign: varchar("utm_campaign", { length: 64 }),
    utmContent: varchar("utm_content", { length: 128 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("users_created_at").on(t.createdAt)]
);

export const admins = pgTable("admins", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  username: varchar("username", { length: 64 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 64 }),
  role: varchar("role", { length: 32 }),
  status: varchar("status", { length: 20 }).default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
