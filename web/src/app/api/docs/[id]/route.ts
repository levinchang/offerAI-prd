import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { docs, userDocAccess } from "../../../../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/** C 端：资料详情，已购用户无限制 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const docId = Number(id);
  if (!Number.isInteger(docId)) return fail(ErrorCodes.BAD_REQUEST, "无效的 id");

  const [row] = await db.select().from(docs).where(and(eq(docs.id, docId), eq(docs.status, "published"))).limit(1);
  if (!row) return fail(ErrorCodes.NOT_FOUND, "资料不存在或已下架");

  const userId = await getUserId();
  let hasAccess = false;
  if (userId) {
    const [access] = await db
      .select()
      .from(userDocAccess)
      .where(and(eq(userDocAccess.userId, userId), eq(userDocAccess.docId, docId)))
      .limit(1);
    hasAccess = !!access;
  }

  return ok({
    ...row,
    hasAccess,
  });
}
