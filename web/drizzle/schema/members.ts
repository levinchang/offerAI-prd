import {
  pgTable,
  bigserial,
  bigint,
  varchar,
  decimal,
  integer,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";

export const skus = pgTable("skus", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  skuCode: varchar("sku_code", { length: 32 }).unique().notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  durationDays: integer("duration_days").notNull(),
  listPrice: decimal("list_price", { precision: 10, scale: 2 }).notNull(),
  promoPrice: decimal("promo_price", { precision: 10, scale: 2 }),
  showInFront: boolean("show_in_front").default(true),
  status: varchar("status", { length: 20 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const orders = pgTable(
  "orders",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    orderNo: varchar("order_no", { length: 32 }).unique().notNull(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    productType: varchar("product_type", { length: 20 }).notNull(),
    productId: bigint("product_id", { mode: "number" }).notNull(),
    skuId: bigint("sku_id", { mode: "number" }),
    docId: bigint("doc_id", { mode: "number" }),
    userCouponId: bigint("user_coupon_id", { mode: "number" }),
    originalAmount: decimal("original_amount", { precision: 10, scale: 2 }).notNull(),
    payAmount: decimal("pay_amount", { precision: 10, scale: 2 }).notNull(),
    payChannel: varchar("pay_channel", { length: 20 }),
    orderStatus: varchar("order_status", { length: 20 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (t) => [
    index("orders_user_created").on(t.userId, t.createdAt),
    index("orders_status").on(t.orderStatus),
  ]
);

export const memberRights = pgTable(
  "member_rights",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    orderId: bigint("order_id", { mode: "number" }),
    memberType: varchar("member_type", { length: 20 }).notNull(),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    expireAt: timestamp("expire_at", { withTimezone: true }).notNull(),
    status: varchar("status", { length: 20 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    index("member_rights_user_type_status").on(t.userId, t.memberType, t.status),
    index("member_rights_expire_at").on(t.expireAt),
  ]
);
