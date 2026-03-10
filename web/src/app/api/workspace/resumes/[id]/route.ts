import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { resumes } from "../../../../../../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/** DELETE：删除简历 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const resumeId = Number(id);
  if (!Number.isInteger(resumeId)) return fail(ErrorCodes.BAD_REQUEST, "无效的 id");
  const [row] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)))
    .limit(1);
  if (!row) return fail(ErrorCodes.NOT_FOUND, "简历不存在");
  await db.delete(resumes).where(eq(resumes.id, resumeId));
  return ok({ ok: true });
}
