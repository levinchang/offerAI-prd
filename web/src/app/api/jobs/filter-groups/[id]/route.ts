import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { jobFilterGroups } from "../../../../../../drizzle/schema";
import { eq, and } from "drizzle-orm";

type FilterGroupPayload = {
  keyword?: string;
  recruitType?: string[];
  industry?: string[];
  city?: string[];
  companyType?: string[];
};

/** GET：获取单个分组（用于切换时应用条件） */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const groupId = Number(id);
  if (!groupId) return fail(ErrorCodes.BAD_REQUEST, "无效分组 ID");
  const [row] = await db
    .select()
    .from(jobFilterGroups)
    .where(
      and(
        eq(jobFilterGroups.id, groupId),
        eq(jobFilterGroups.userId, userId)
      )
    )
    .limit(1);
  if (!row) return fail(ErrorCodes.NOT_FOUND, "分组不存在");
  const filters = JSON.parse(row.filtersJson || "{}") as FilterGroupPayload;
  return ok({ id: row.id, name: row.name, filters });
}

/** PATCH：更新分组名称或条件 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const groupId = Number(id);
  if (!groupId) return fail(ErrorCodes.BAD_REQUEST, "无效分组 ID");
  const body = await req.json().catch(() => ({}));
  const { name, filters } = body as { name?: string; filters?: FilterGroupPayload };
  const [row] = await db
    .select()
    .from(jobFilterGroups)
    .where(
      and(
        eq(jobFilterGroups.id, groupId),
        eq(jobFilterGroups.userId, userId)
      )
    )
    .limit(1);
  if (!row) return fail(ErrorCodes.NOT_FOUND, "分组不存在");
  const updates: { name?: string; filtersJson?: string; updatedAt: Date } = {
    updatedAt: new Date(),
  };
  if (name !== undefined) updates.name = name.trim();
  if (filters !== undefined) updates.filtersJson = JSON.stringify(filters);
  await db
    .update(jobFilterGroups)
    .set(updates)
    .where(eq(jobFilterGroups.id, groupId));
  return ok({ ok: true });
}

/** DELETE：删除分组 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const groupId = Number(id);
  if (!groupId) return fail(ErrorCodes.BAD_REQUEST, "无效分组 ID");
  await db
    .delete(jobFilterGroups)
    .where(
      and(
        eq(jobFilterGroups.id, groupId),
        eq(jobFilterGroups.userId, userId)
      )
    );
  return ok({ ok: true });
}
