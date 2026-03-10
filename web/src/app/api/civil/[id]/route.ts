import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { civilPosts } from "../../../../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const PUBLISHED = "published";
const ACTIVE = "active";

/** 事业编公告详情，会员才返回 originalUrl */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId) || postId < 1)
    return fail(ErrorCodes.BAD_REQUEST, "无效的 id");

  const { isCivilMember } = await getSession();

  const [row] = await db
    .select()
    .from(civilPosts)
    .where(
      and(
        eq(civilPosts.id, postId),
        eq(civilPosts.publishStatus, PUBLISHED),
        eq(civilPosts.lifecycle, ACTIVE)
      )
    )
    .limit(1);

  if (!row)
    return fail(ErrorCodes.NOT_FOUND, "公告不存在或已下架");

  const data = {
    ...row,
    originalUrl: isCivilMember ? row.originalUrl : null,
  };
  return ok(data);
}
