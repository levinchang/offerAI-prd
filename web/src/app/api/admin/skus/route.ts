import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { skus } from "../../../../../../drizzle/schema";
import { eq, desc, and, count } from "drizzle-orm";

/** 后台：SKU 列表，分页、按类型/状态筛选 */
export async function GET(req: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 20));
  const type = searchParams.get("type")?.trim();
  const status = searchParams.get("status")?.trim();

  const conditions = [];
  if (type) conditions.push(eq(skus.type, type));
  if (status) conditions.push(eq(skus.status, status));
  const where = conditions.length ? and(...conditions) : undefined;

  try {
    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(skus)
        .where(where)
        .orderBy(desc(skus.updatedAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      where ? db.select({ total: count() }).from(skus).where(where) : db.select({ total: count() }).from(skus),
    ]);
    return ok({ list: rows, total: Number(countResult[0]?.total ?? 0), page, pageSize });
  } catch (e) {
    return fail(ErrorCodes.INTERNAL, (e as Error).message);
  }
}

/** 后台：新增 SKU */
export async function POST(req: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const body = await req.json().catch(() => ({}));
  const {
    sku_code: skuCode,
    name,
    type,
    duration_days: durationDays,
    list_price: listPrice,
    promo_price: promoPrice,
    show_in_front: showInFront = true,
    status = "inactive",
  } = body as {
    sku_code?: string;
    name?: string;
    type?: string;
    duration_days?: number;
    list_price?: string | number;
    promo_price?: string | number;
    show_in_front?: boolean;
    status?: string;
  };
  if (!skuCode?.trim() || !name?.trim() || !type) return fail(ErrorCodes.BAD_REQUEST, "缺少 sku_code / name / type");
  if (durationDays == null || durationDays < 1) return fail(ErrorCodes.BAD_REQUEST, "duration_days 必填且 ≥1");
  const list = Number(listPrice);
  if (Number.isNaN(list) || list < 0) return fail(ErrorCodes.BAD_REQUEST, "list_price 无效");
  const promo = promoPrice != null ? Number(promoPrice) : null;
  if (promo != null && (Number.isNaN(promo) || promo < 0 || promo > list))
    return fail(ErrorCodes.BAD_REQUEST, "promo_price 无效");

  const now = new Date();
  try {
    const [inserted] = await db
      .insert(skus)
      .values({
        skuCode: skuCode.trim(),
        name: name.trim(),
        type,
        durationDays,
        listPrice: String(list),
        promoPrice: promo != null ? String(promo) : null,
        showInFront: !!showInFront,
        status: status === "active" ? "active" : "inactive",
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: skus.id });
    return ok({ id: inserted!.id });
  } catch (e) {
    return fail(ErrorCodes.INTERNAL, (e as Error).message);
  }
}
