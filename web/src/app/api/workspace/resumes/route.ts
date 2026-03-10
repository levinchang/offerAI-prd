import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { resumes } from "../../../../../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

/** GET：当前用户的简历列表 */
export async function GET() {
  const userId = await getUserId();
  if (!userId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const rows = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(desc(resumes.createdAt));
  return ok({ list: rows });
}

/** POST：新增简历（名称 + 文件 URL 占位，正式接入 OSS 后替换为上传） */
export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const body = await req.json().catch(() => ({}));
  const { name, file_url: fileUrl } = body as { name?: string; file_url?: string };
  if (!name?.trim()) return fail(ErrorCodes.BAD_REQUEST, "缺少 name");
  const now = new Date();
  const [inserted] = await db
    .insert(resumes)
    .values({
      userId,
      name: name.trim(),
      fileUrl: fileUrl ?? null,
      createdAt: now,
    })
    .returning({ id: resumes.id });
  return ok({ id: inserted!.id });
}
