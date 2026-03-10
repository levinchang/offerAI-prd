import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { userGroups } from "../../../../../../drizzle/schema";
import { eq, asc } from "drizzle-orm";

/** GET：当前用户的分组列表 */
export async function GET() {
  const userId = await getUserId();
  if (!userId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const rows = await db
    .select()
    .from(userGroups)
    .where(eq(userGroups.userId, userId))
    .orderBy(asc(userGroups.sortOrder), asc(userGroups.id));
  return ok({ list: rows });
}

/** POST：新建分组 */
export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const body = await req.json().catch(() => ({}));
  const { name } = body as { name?: string };
  if (!name?.trim()) return fail(ErrorCodes.BAD_REQUEST, "缺少 name");
  const now = new Date();
  const [inserted] = await db
    .insert(userGroups)
    .values({
      userId,
      name: name.trim(),
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: userGroups.id });
  return ok({ id: inserted!.id });
}
