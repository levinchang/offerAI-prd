import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { syncTasks, feishuSyncConfigs } from "../../../../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { runSyncTask } from "@/lib/feishu-sync";

/** 手动同步：创建任务并执行（data_type: campus | civil | all） */
export async function POST(req: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const body = await req.json().catch(() => ({}));
  const dataType = body.data_type ?? body.dataType ?? "all";
  if (dataType !== "campus" && dataType !== "civil" && dataType !== "all")
    return fail(ErrorCodes.BAD_REQUEST, "data_type 须为 campus / civil / all");

  const now = new Date();
  const types: ("campus" | "civil")[] = dataType === "all" ? ["campus", "civil"] : [dataType];

  let taskId: number | null = null;
  for (const dt of types) {
    const [config] = await db.select().from(feishuSyncConfigs).where(eq(feishuSyncConfigs.dataType, dt)).limit(1);
    const [inserted] = await db
      .insert(syncTasks)
      .values({
        configId: config?.id ?? null,
        dataType: dt,
        triggerType: "manual",
        status: "running",
        operatorId: adminId,
        startedAt: now,
        createdAt: now,
      })
      .returning({ id: syncTasks.id });
    if (inserted) {
      if (taskId === null) taskId = inserted.id;
      await runSyncTask(inserted.id);
    }
  }
  return ok({ task_id: taskId, message: "已创建同步任务，请到任务列表查看" });
}
