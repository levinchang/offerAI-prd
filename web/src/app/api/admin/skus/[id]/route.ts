import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { skus } from "../../../../../drizzle/schema";
import { eq } from "drizzle-orm";

/** 后台：获取单条 SKU */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const skuId = Number(id);
  if (!Number.isInteger(skuId)) return fail(ErrorCodes.BAD_REQUEST, "无效的 id");
  const [row] = await db.select().from(skus).where(eq(skus.id, skuId)).limit(1);
  if (!row) return fail(ErrorCodes.NOT_FOUND, "记录不存在");
  return ok(row);
}

/** 后台：更新 SKU */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const skuId = Number(id);
  if (!Number.isInteger(skuId)) return fail(ErrorCodes.BAD_REQUEST, "无效的 id");
  const [row] = await db.select().from(skus).where(eq(skus.id, skuId)).limit(1);
  if (!row) return fail(ErrorCodes.NOT_FOUND, "记录不存在");

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  const allow = ["name", "type", "durationDays", "listPrice", "promoPrice", "showInFront", "status"];
  for (const key of allow) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  if (body.duration_days !== undefined) updates.durationDays = body.duration_days;
  if (body.list_price !== undefined) updates.listPrice = String(body.list_price);
  if (body.promo_price !== undefined) updates.promoPrice = body.promo_price == null ? null : String(body.promo_price);
  if (body.show_in_front !== undefined) updates.showInFront = !!body.show_in_front;
  if (body.status !== undefined) updates.status = body.status === "active" ? "active" : "inactive";

  await db.update(skus).set(updates).where(eq(skus.id, skuId));
  return ok({ ok: true });
}
