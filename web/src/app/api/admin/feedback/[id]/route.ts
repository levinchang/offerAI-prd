import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { feedback } from "../../../../../../../drizzle/schema";
import { eq } from "drizzle-orm";

/** 更新反馈状态（如已处理） */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const feedbackId = Number(id);
  if (!Number.isInteger(feedbackId)) return fail(ErrorCodes.BAD_REQUEST, "无效的 id");
  const body = await req.json().catch(() => ({}));
  const status = body.status?.trim();
  if (!status) return fail(ErrorCodes.BAD_REQUEST, "缺少 status");
  await db.update(feedback).set({ status, updatedAt: new Date() }).where(eq(feedback.id, feedbackId));
  return ok({ ok: true });
}
