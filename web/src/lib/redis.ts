/**
 * Redis 客户端预留。
 * 用途：短信验证码存储与限流、字典/SKU 缓存、登出黑名单（可选）。
 * 本地开发可用 Docker 启动 Redis，或实现 in-memory 适配层。
 */
// import Redis from 'ioredis';
// const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;
// export async function getRedis(): Promise<Redis | null> {
//   return redis;
// }
export async function getRedis(): Promise<null> {
  return null;
}
