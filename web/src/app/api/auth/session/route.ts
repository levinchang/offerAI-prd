import { getSession } from "@/lib/session";
import { ok } from "@/lib/api-response";

/** 获取当前登录态与校招/事业编会员态，供前端使用 */
export async function GET() {
  const session = await getSession();
  return ok({
    userId: session.userId,
    isCampusMember: session.isCampusMember,
    isCivilMember: session.isCivilMember,
  });
}
