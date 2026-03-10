import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { dictItems } from "../../../../../../../../../drizzle/schema";
import { eq } from "drizzle-orm";

/** 后台更新/删除枚举项 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId)) return fail(ErrorCodes.BAD_REQUEST, "无效的 id");
  const body = await req.json().catch(() => ({}));
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (body.label !== undefined) updates.label = body.label;
  if (body.code !== undefined) updates.code = body.code;
  if (body.sort_order !== undefined) updates.sortOrder = body.sort_order;
  if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;
  if (body.status !== undefined) updates.status = body.status === "inactive" ? "inactive" : "active";
  await db.update(dictItems).set(updates).where(eq(dictItems.id, itemId));
  return ok({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId)) return fail(ErrorCodes.BAD_REQUEST, "无效的 id");
  await db.delete(dictItems).where(eq(dictItems.id, itemId));
  return ok({ ok: true });
}
