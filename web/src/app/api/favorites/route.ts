import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { favorites as favoritesTable } from "../../../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/** GET：当前用户收藏的校招/事业编 ID 列表，用于列表页标注 */
export async function GET(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const targetType = req.nextUrl.searchParams.get("target_type") ?? "campus";
  const rows = await db
    .select({ targetId: favoritesTable.targetId })
    .from(favoritesTable)
    .where(
      and(
        eq(favoritesTable.userId, userId),
        eq(favoritesTable.targetType, targetType)
      )
    );
  return ok({ ids: rows.map((r) => Number(r.targetId)) });
}

/** POST：添加收藏 */
export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const body = await req.json().catch(() => ({}));
  const { target_type: targetType, target_id: targetId } = body as {
    target_type?: string;
    target_id?: number;
  };
  if (!targetType || targetId == null)
    return fail(ErrorCodes.BAD_REQUEST, "缺少 target_type 或 target_id");
  try {
    await db
      .insert(favoritesTable)
      .values({
        userId,
        targetType,
        targetId: Number(targetId),
        createdAt: new Date(),
      })
      .onConflictDoNothing({
        target: [
          favoritesTable.userId,
          favoritesTable.targetType,
          favoritesTable.targetId,
        ],
      });
    return ok({ ok: true });
  } catch (e) {
    return fail(ErrorCodes.INTERNAL, (e as Error).message);
  }
}

/** DELETE：取消收藏 */
export async function DELETE(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const targetType = req.nextUrl.searchParams.get("target_type") ?? "campus";
  const targetId = req.nextUrl.searchParams.get("target_id");
  if (!targetId) return fail(ErrorCodes.BAD_REQUEST, "缺少 target_id");
  await db
    .delete(favoritesTable)
    .where(
      and(
        eq(favoritesTable.userId, userId),
        eq(favoritesTable.targetType, targetType),
        eq(favoritesTable.targetId, Number(targetId))
      )
    );
  return ok({ ok: true });
}
