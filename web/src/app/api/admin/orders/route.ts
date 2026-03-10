import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { orders, users } from "../../../../../../drizzle/schema";
import { desc, eq, count } from "drizzle-orm";

/** 后台订单列表：分页、按状态筛选 */
export async function GET(req: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 20));
  const orderStatus = searchParams.get("orderStatus")?.trim();

  const where = orderStatus ? eq(orders.orderStatus, orderStatus) : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select({
        id: orders.id,
        orderNo: orders.orderNo,
        userId: orders.userId,
        productType: orders.productType,
        productId: orders.productId,
        payAmount: orders.payAmount,
        orderStatus: orders.orderStatus,
        createdAt: orders.createdAt,
        paidAt: orders.paidAt,
        nickname: users.nickname,
      })
      .from(orders)
      .leftJoin(users, eq(users.id, orders.userId))
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    where ? db.select({ total: count() }).from(orders).where(where) : db.select({ total: count() }).from(orders),
  ]);
  const total = Number(countResult[0]?.total ?? 0);
  return ok({ list: rows, total, page, pageSize });
}
