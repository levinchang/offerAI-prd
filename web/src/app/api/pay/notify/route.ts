import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { db } from "@/lib/db";
import { orders, skus, memberRights, userDocAccess } from "../../../../../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * 支付回调占位：body.order_no 或 body.orderNo，将订单置为已支付并发放会员权益。
 * 正式接入时需校验第三方签名并仅允许支付方调用。
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const orderNo = (body.order_no ?? body.orderNo) as string | undefined;
  if (!orderNo?.trim()) return fail(ErrorCodes.BAD_REQUEST, "缺少 order_no");

  const [order] = await db.select().from(orders).where(eq(orders.orderNo, orderNo.trim())).limit(1);
  if (!order) return fail(ErrorCodes.NOT_FOUND, "订单不存在");
  if (order.orderStatus === "paid") return ok({ ok: true, message: "已处理" });

  const now = new Date();
  await db
    .update(orders)
    .set({ orderStatus: "paid", paidAt: now })
    .where(eq(orders.id, order.id));

  const skuId = order.skuId;
  if (order.productType === "doc" && order.docId != null) {
    const [existing] = await db
      .select()
      .from(userDocAccess)
      .where(and(eq(userDocAccess.userId, order.userId), eq(userDocAccess.docId, order.docId)))
      .limit(1);
    if (!existing) {
      await db.insert(userDocAccess).values({
        userId: order.userId,
        docId: order.docId,
        orderId: order.id,
        unlockedAt: now,
      });
    }
  } else if (skuId != null) {
    const [sku] = await db.select().from(skus).where(eq(skus.id, skuId)).limit(1);
    if (sku) {
      const startAt = now;
      const expireAt = new Date(now.getTime() + sku.durationDays * 24 * 60 * 60 * 1000);
      const memberType = sku.type === "civil" ? "civil" : "campus";
      await db.insert(memberRights).values({
        userId: order.userId,
        orderId: order.id,
        memberType,
        startAt,
        expireAt,
        status: "active",
        createdAt: now,
      });
    }
  }
  return ok({ ok: true });
}
