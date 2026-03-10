import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { applyRecords } from "../../../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const STAGES = [
  "暂无",
  "待投递",
  "已投递",
  "待笔试",
  "已笔试",
  "一面",
  "二面",
  "三面",
  "已offer",
  "未通过",
];

/** GET：当前用户的投递记录，可选 stage、campus_job_id、group_id 筛选；返回完整字段供工作台看板使用 */
export async function GET(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const stage = req.nextUrl.searchParams.get("stage");
  const campusJobId = req.nextUrl.searchParams.get("campus_job_id");
  const groupId = req.nextUrl.searchParams.get("group_id");
  const conditions = [eq(applyRecords.userId, userId)];
  if (stage) conditions.push(eq(applyRecords.stage, stage));
  if (campusJobId)
    conditions.push(eq(applyRecords.campusJobId, Number(campusJobId)));
  if (groupId) conditions.push(eq(applyRecords.groupId, Number(groupId)));
  const rows = await db
    .select()
    .from(applyRecords)
    .where(and(...conditions));
  return ok({
    list: rows.map((r) => ({
      id: r.id,
      sourceType: r.sourceType,
      campusJobId: r.campusJobId,
      civilPostId: r.civilPostId,
      companyName: r.companyName,
      jobTitle: r.jobTitle,
      stage: r.stage,
      groupId: r.groupId,
      remark: r.remark,
      appliedAt: r.appliedAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
  });
}

/** POST：创建或更新某岗位的投递记录（标记进度）。支持 campus 与 civil */
export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const body = await req.json().catch(() => ({}));
  const {
    campus_job_id: campusJobId,
    civil_post_id: civilPostId,
    source_type: sourceType = "campus",
    stage,
    job_title: jobTitle,
    company_name: companyName,
  } = body as {
    campus_job_id?: number;
    civil_post_id?: number;
    source_type?: string;
    stage?: string;
    job_title?: string;
    company_name?: string;
  };
  const isCivil = sourceType === "civil";
  const isManual = sourceType === "manual";
  if (!stage) return fail(ErrorCodes.BAD_REQUEST, "缺少 stage");
  if (!STAGES.includes(stage))
    return fail(ErrorCodes.BAD_REQUEST, "无效的 stage");
  if (isManual) {
    const now = new Date();
    const [inserted] = await db
      .insert(applyRecords)
      .values({
        userId,
        sourceType: "manual",
        companyName: companyName ?? null,
        jobTitle: jobTitle ?? null,
        stage,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: applyRecords.id });
    return ok({ id: inserted!.id, updated: false });
  }
  if (isCivil) {
    if (!civilPostId) return fail(ErrorCodes.BAD_REQUEST, "缺少 civil_post_id");
    const now = new Date();
    const existing = await db
      .select()
      .from(applyRecords)
      .where(
        and(
          eq(applyRecords.userId, userId),
          eq(applyRecords.civilPostId, civilPostId),
          eq(applyRecords.sourceType, "civil")
        )
      )
      .limit(1);
    if (existing.length > 0) {
      await db
        .update(applyRecords)
        .set({
          stage,
          jobTitle: jobTitle ?? existing[0]!.jobTitle,
          updatedAt: now,
          appliedAt: stage === "已投递" ? now : existing[0]!.appliedAt,
        })
        .where(eq(applyRecords.id, existing[0]!.id));
      return ok({ id: existing[0]!.id, updated: true });
    }
    const [inserted] = await db
      .insert(applyRecords)
      .values({
        userId,
        sourceType: "civil",
        civilPostId,
        stage,
        jobTitle: jobTitle ?? null,
        appliedAt: stage === "已投递" ? now : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: applyRecords.id });
    return ok({ id: inserted!.id, updated: false });
  }
  if (!campusJobId)
    return fail(ErrorCodes.BAD_REQUEST, "缺少 campus_job_id 或 civil_post_id");
  const now = new Date();
  const existing = await db
    .select()
    .from(applyRecords)
    .where(
      and(
        eq(applyRecords.userId, userId),
        eq(applyRecords.campusJobId, campusJobId),
        eq(applyRecords.sourceType, "campus")
      )
    )
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(applyRecords)
      .set({
        stage,
        jobTitle: jobTitle ?? existing[0]!.jobTitle,
        updatedAt: now,
        appliedAt: stage === "已投递" ? now : existing[0]!.appliedAt,
      })
      .where(eq(applyRecords.id, existing[0]!.id));
    return ok({ id: existing[0]!.id, updated: true });
  }
  const [inserted] = await db
    .insert(applyRecords)
    .values({
      userId,
      sourceType: "campus",
      campusJobId,
      stage,
      jobTitle: jobTitle ?? null,
      appliedAt: stage === "已投递" ? now : null,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: applyRecords.id });
  return ok({ id: inserted!.id, updated: false });
}

/** PATCH：更新备注或阶段 */
export async function PATCH(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const body = await req.json().catch(() => ({}));
  const { id, remark, stage, group_id: groupId } = body as {
    id?: number;
    remark?: string;
    stage?: string;
    group_id?: number | null;
  };
  if (!id) return fail(ErrorCodes.BAD_REQUEST, "缺少 id");
  const [row] = await db
    .select()
    .from(applyRecords)
    .where(
      and(eq(applyRecords.id, id), eq(applyRecords.userId, userId))
    )
    .limit(1);
  if (!row) return fail(ErrorCodes.NOT_FOUND, "记录不存在");
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (remark !== undefined) updates.remark = remark;
  if (stage !== undefined) {
    if (!STAGES.includes(stage)) return fail(ErrorCodes.BAD_REQUEST, "无效的 stage");
    updates.stage = stage;
  }
  if (groupId !== undefined) updates.groupId = groupId;
  await db.update(applyRecords).set(updates).where(eq(applyRecords.id, id));
  return ok({ ok: true });
}

/** DELETE：删除投递记录 */
export async function DELETE(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return fail(ErrorCodes.BAD_REQUEST, "缺少 id");
  const recordId = Number(id);
  const [row] = await db
    .select()
    .from(applyRecords)
    .where(
      and(eq(applyRecords.id, recordId), eq(applyRecords.userId, userId))
    )
    .limit(1);
  if (!row) return fail(ErrorCodes.NOT_FOUND, "记录不存在");
  await db.delete(applyRecords).where(eq(applyRecords.id, recordId));
  return ok({ ok: true });
}
