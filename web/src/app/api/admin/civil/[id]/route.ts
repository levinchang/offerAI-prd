import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { civilPosts } from "../../../../../../../drizzle/schema";
import { eq } from "drizzle-orm";

/** 后台获取单条事业编 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId) || postId < 1)
    return fail(ErrorCodes.BAD_REQUEST, "无效的 id");
  const [row] = await db
    .select()
    .from(civilPosts)
    .where(eq(civilPosts.id, postId))
    .limit(1);
  if (!row) return fail(ErrorCodes.NOT_FOUND, "记录不存在");
  return ok(row);
}

/** 后台更新事业编：publishStatus、lifecycle 或全字段 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId) || postId < 1)
    return fail(ErrorCodes.BAD_REQUEST, "无效的 id");
  const body = await req.json().catch(() => ({}));
  const [row] = await db
    .select()
    .from(civilPosts)
    .where(eq(civilPosts.id, postId))
    .limit(1);
  if (!row) return fail(ErrorCodes.NOT_FOUND, "记录不存在");

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  const allow = [
    "title", "province", "region", "postType", "detail",
    "applyStartDate", "applyEndDate", "recruitCount", "positionCount",
    "educationRequirement", "ageRequirement", "positionsText", "originalUrl",
    "publishStatus", "lifecycle", "manualLock",
  ];
  for (const key of allow) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  await db.update(civilPosts).set(updates).where(eq(civilPosts.id, postId));
  return ok({ ok: true });
}

/** 后台删除事业编（物理删除） */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId) || postId < 1)
    return fail(ErrorCodes.BAD_REQUEST, "无效的 id");
  await db.delete(civilPosts).where(eq(civilPosts.id, postId));
  return ok({ ok: true });
}
