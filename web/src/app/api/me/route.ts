import { getUserId } from "@/lib/session";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { db } from "@/lib/db";
import { users, memberRights, orders, userDocAccess, docs } from "../../../../drizzle/schema";
import { eq, and, gt, desc } from "drizzle-orm";

/** 个人中心数据：用户信息、校招/事业编到期、订单入口 */
export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return ok({ needLogin: true });
  }

  try {
    const [userRow] = await db
      .select({
        id: users.id,
        nickname: users.nickname,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const rights = await db
      .select({
        memberType: memberRights.memberType,
        expireAt: memberRights.expireAt,
      })
      .from(memberRights)
      .where(
        and(
          eq(memberRights.userId, userId),
          eq(memberRights.status, "active"),
          gt(memberRights.expireAt, new Date())
        )
      );

    let campusExpireAt: string | null = null;
    let civilExpireAt: string | null = null;
    for (const r of rights) {
      const at = r.expireAt ? new Date(r.expireAt).toISOString().slice(0, 10) : null;
      if (!at) continue;
      if (r.memberType === "campus" && (!campusExpireAt || at > campusExpireAt))
        campusExpireAt = at;
      if (r.memberType === "civil" && (!civilExpireAt || at > civilExpireAt))
        civilExpireAt = at;
    }

    const [orderList, purchasedDocs] = await Promise.all([
      db
        .select({
          id: orders.id,
          orderNo: orders.orderNo,
          productType: orders.productType,
          orderStatus: orders.orderStatus,
          payAmount: orders.payAmount,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt))
        .limit(20),
      db
        .select({ docId: userDocAccess.docId, title: docs.title })
        .from(userDocAccess)
        .innerJoin(docs, eq(docs.id, userDocAccess.docId))
        .where(eq(userDocAccess.userId, userId)),
    ]);

    return ok({
      needLogin: false,
      user: userRow
        ? {
            id: userRow.id,
            nickname: userRow.nickname ?? "用户",
            avatarUrl: userRow.avatarUrl ?? null,
          }
        : { id: userId, nickname: "用户", avatarUrl: null },
      campusExpireAt,
      civilExpireAt,
      orders: orderList.map((o) => ({
        id: o.id,
        orderNo: o.orderNo,
        productType: o.productType,
        orderStatus: o.orderStatus,
        payAmount: o.payAmount,
        createdAt: o.createdAt,
      })),
      purchasedDocs: purchasedDocs.map((d) => ({ docId: d.docId, title: d.title })),
    });
  } catch (e) {
    return fail(ErrorCodes.INTERNAL, (e as Error).message);
  }
}
