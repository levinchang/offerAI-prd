import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { syncTasks } from "../../../../../../../drizzle/schema";
import { eq } from "drizzle-orm";

/** 任务详情 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const taskId = Number(id);
  if (!Number.isInteger(taskId)) return fail(ErrorCodes.BAD_REQUEST, "无效的 id");
  const [row] = await db.select().from(syncTasks).where(eq(syncTasks.id, taskId)).limit(1);
  if (!row) return fail(ErrorCodes.NOT_FOUND, "任务不存在");
  return ok(row);
}
