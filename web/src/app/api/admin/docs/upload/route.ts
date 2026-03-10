import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";

const MAX_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPE = "application/pdf";

/** 后台：上传 PDF，单文件 ≤20MB，返回 file_key（OSS 占位时返回占位 key） */
export async function POST(req: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");

  const formData = await req.formData().catch(() => null);
  if (!formData) return fail(ErrorCodes.BAD_REQUEST, "请上传文件");

  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) return fail(ErrorCodes.BAD_REQUEST, "请选择 PDF 文件");

  if (file.type !== ALLOWED_TYPE)
    return fail(ErrorCodes.BAD_REQUEST, "请上传 PDF 文件，且不超过 20MB");
  if (file.size > MAX_SIZE)
    return fail(ErrorCodes.BAD_REQUEST, "请上传 PDF 文件，且不超过 20MB");

  // 占位：不落盘 OSS，返回假 file_key；接入 OSS 后改为上传并返回真实 key
  const key = `docs/placeholder/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  return ok({ file_key: key });
}
