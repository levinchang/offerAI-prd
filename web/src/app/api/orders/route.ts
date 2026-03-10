import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { orders, skus, docs } from "../../../../drizzle/schema";
import { eq, and, count, desc } from "drizzle-orm";

function generateOrderNo(): string {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `O${t}${r}`;
}

/** 订单列表（当前用户，需登录）；若传 order_no 则返回该单条订单（供支付结果页用） */
export async function GET(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const orderNoParam = req.nextUrl.searchParams.get("order_no");
  if (orderNoParam) {
    const [row] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.userId, userId), eq(orders.orderNo, orderNoParam)))
      .limit(1);
    return ok(row ? { order: row } : { order: null });
  }
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get("pageSize")) || 20));
  const [list, countRes] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(orders).where(eq(orders.userId, userId)),
  ]);
  return ok({ list, total: Number(countRes[0]?.total ?? 0), page, pageSize });
}

/** 创建订单（套餐/资料）：body.sku_id 或 body.doc_id，需登录 */
export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const body = await req.json().catch(() => ({}));
  const { sku_id: skuId, doc_id: docId } = body as { sku_id?: number; doc_id?: number };

  if (skuId != null) {
    const [sku] = await db.select().from(skus).where(eq(skus.id, Number(skuId))).limit(1);
    if (!sku) return fail(ErrorCodes.BAD_REQUEST, "SKU 不存在");
    if (sku.status !== "active") return fail(ErrorCodes.BAD_REQUEST, "该商品已下架");
    const amount = sku.promoPrice != null ? Number(sku.promoPrice) : Number(sku.listPrice);
    const orderNo = generateOrderNo();
    const now = new Date();
    const productType = sku.type === "campus" ? "campus" : sku.type === "civil" ? "civil" : "campus";
    const [inserted] = await db
      .insert(orders)
      .values({
        orderNo,
        userId,
        productType,
        productId: sku.id,
        skuId: sku.id,
        originalAmount: sku.listPrice,
        payAmount: String(amount),
        orderStatus: "pending",
        createdAt: now,
      })
      .returning({ id: orders.id, orderNo: orders.orderNo });
    return ok({ id: inserted!.id, order_no: inserted!.orderNo, orderStatus: "pending" });
  }

  if (docId != null) {
    const [doc] = await db.select().from(docs).where(eq(docs.id, Number(docId))).limit(1);
    if (!doc) return fail(ErrorCodes.BAD_REQUEST, "资料不存在");
    if (doc.status !== "published") return fail(ErrorCodes.BAD_REQUEST, "该资料已下架");
    const amount = Number(doc.price);
    const orderNo = generateOrderNo();
    const now = new Date();
    const [inserted] = await db
      .insert(orders)
      .values({
        orderNo,
        userId,
        productType: "doc",
        productId: doc.id,
        docId: doc.id,
        originalAmount: doc.price,
        payAmount: String(amount),
        orderStatus: "pending",
        createdAt: now,
      })
      .returning({ id: orders.id, orderNo: orders.orderNo });
    return ok({ id: inserted!.id, order_no: inserted!.orderNo, orderStatus: "pending" });
  }

  return fail(ErrorCodes.BAD_REQUEST, "缺少 sku_id 或 doc_id");
}
