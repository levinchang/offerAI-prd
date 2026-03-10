import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { userGroups } from "../../../../../../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/** PATCH：更新分组名称 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const groupId = Number(id);
  if (!Number.isInteger(groupId)) return fail(ErrorCodes.BAD_REQUEST, "无效的 id");
  const body = await req.json().catch(() => ({}));
  const { name } = body as { name?: string };
  if (!name?.trim()) return fail(ErrorCodes.BAD_REQUEST, "缺少 name");
  const [row] = await db
    .select()
    .from(userGroups)
    .where(and(eq(userGroups.id, groupId), eq(userGroups.userId, userId)))
    .limit(1);
  if (!row) return fail(ErrorCodes.NOT_FOUND, "分组不存在");
  await db
    .update(userGroups)
    .set({ name: name.trim(), updatedAt: new Date() })
    .where(eq(userGroups.id, groupId));
  return ok({ ok: true });
}

/** DELETE：删除分组 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const groupId = Number(id);
  if (!Number.isInteger(groupId)) return fail(ErrorCodes.BAD_REQUEST, "无效的 id");
  const [row] = await db
    .select()
    .from(userGroups)
    .where(and(eq(userGroups.id, groupId), eq(userGroups.userId, userId)))
    .limit(1);
  if (!row) return fail(ErrorCodes.NOT_FOUND, "分组不存在");
  await db.delete(userGroups).where(eq(userGroups.id, groupId));
  return ok({ ok: true });
}
