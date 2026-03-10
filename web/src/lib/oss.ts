/**
 * 阿里云 OSS 封装预留。
 * 用途：面试资料 PDF、用户上传简历；上传/下载通过后端签名 URL 或代理，不直连前端。
 */
// export async function getUploadUrl(key: string, contentType: string): Promise<string> { ... }
// export async function getDownloadUrl(key: string, filename?: string): Promise<string> { ... }
export const oss = {
  getUploadUrl: async (key: string, contentType: string): Promise<string> =>
    Promise.resolve(`${key}:${contentType}`),
  getDownloadUrl: async (key: string, filename?: string): Promise<string> =>
    Promise.resolve(`${key}:${filename ?? ""}`),
};
