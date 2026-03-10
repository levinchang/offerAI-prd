import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { syncTasks, feishuSyncConfigs } from "../../../../../../../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { runSyncTask } from "@/lib/feishu-sync";

/** 重试失败任务：按原 data_type 创建新任务并执行 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const taskId = Number(id);
  if (!Number.isInteger(taskId)) return fail(ErrorCodes.BAD_REQUEST, "无效的 id");
  const [oldTask] = await db.select().from(syncTasks).where(eq(syncTasks.id, taskId)).limit(1);
  if (!oldTask) return fail(ErrorCodes.NOT_FOUND, "任务不存在");
  if (oldTask.status !== "failed") return fail(ErrorCodes.BAD_REQUEST, "仅可重试失败任务");

  const [config] = await db.select().from(feishuSyncConfigs).where(eq(feishuSyncConfigs.dataType, oldTask.dataType)).limit(1);
  const now = new Date();
  const [inserted] = await db
    .insert(syncTasks)
    .values({
      configId: config?.id ?? null,
      dataType: oldTask.dataType,
      triggerType: "manual",
      status: "running",
      operatorId: adminId,
      startedAt: now,
      createdAt: now,
    })
    .returning({ id: syncTasks.id });
  if (!inserted) return fail(ErrorCodes.INTERNAL, "创建任务失败");
  await runSyncTask(inserted.id);
  return ok({ task_id: inserted.id, message: "已创建重试任务" });
}
