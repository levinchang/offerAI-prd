import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { docs, userDocAccess } from "../../../../../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { oss } from "@/lib/oss";

/** C 端：预览前 N 页 / 全文 URL。未购返回 preview_pages + previewUrl（前 N 页）；已购返回 fullUrl。无 OSS 时为占位 URL。 */
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

  const previewPages = row.previewPages ?? 3;
  let previewUrl: string | null = null;
  let fullUrl: string | null = null;
  if (row.fileKey) {
    const url = await oss.getDownloadUrl(row.fileKey, row.title ?? undefined);
    fullUrl = url ?? null;
    previewUrl = fullUrl; // 占位实现不区分前 N 页，统一用同一 URL
  }
  return ok({
    previewPages: hasAccess ? null : previewPages,
    hasAccess,
    fileKey: hasAccess ? row.fileKey : null,
    previewUrl: hasAccess ? null : previewUrl,
    fullUrl: hasAccess ? fullUrl : null,
    message: hasAccess ? "已购，可阅读全文" : `仅可预览前 ${previewPages} 页`,
  });
}
