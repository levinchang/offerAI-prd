import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE = "admin_session";

/** 从 cookie 读取当前管理员 ID；未登录返回 null */
export async function getAdminId(): Promise<number | null> {
  const store = await cookies();
  const v = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

/** 登录成功后设置 admin session cookie（由 POST /api/admin/login 调用） */
export async function setAdminSession(adminId: number): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, String(adminId), {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 天
  });
}

/** 登出：清除 cookie */
export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
}
