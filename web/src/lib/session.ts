import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { memberRights } from "../../drizzle/schema";
import { and, eq, gt } from "drizzle-orm";

const SESSION_COOKIE = "session";

/** 从 cookie 读取当前用户 ID（占位：cookie 存 userId，正式接入 JWT 后替换） */
export async function getUserId(): Promise<number | null> {
  const store = await cookies();
  const v = store.get(SESSION_COOKIE)?.value;
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

/** 校验是否为校招会员：当前用户存在且存在未过期的 campus 权益 */
export async function isCampusMember(): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;
  const rows = await db
    .select()
    .from(memberRights)
    .where(
      and(
        eq(memberRights.userId, userId),
        eq(memberRights.memberType, "campus"),
        eq(memberRights.status, "active"),
        gt(memberRights.expireAt, new Date())
      )
    )
    .limit(1);
  return rows.length > 0;
}

/** 校验是否为事业编会员 */
export async function isCivilMember(): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;
  const rows = await db
    .select()
    .from(memberRights)
    .where(
      and(
        eq(memberRights.userId, userId),
        eq(memberRights.memberType, "civil"),
        eq(memberRights.status, "active"),
        gt(memberRights.expireAt, new Date())
      )
    )
    .limit(1);
  return rows.length > 0;
}

export async function getSession(): Promise<{
  userId: number | null;
  isCampusMember: boolean;
  isCivilMember: boolean;
}> {
  const userId = await getUserId();
  const [isCampus, isCivil] =
    userId
      ? await Promise.all([isCampusMember(), isCivilMember()])
      : [false, false];
  return { userId, isCampusMember: isCampus, isCivilMember: isCivil };
}
