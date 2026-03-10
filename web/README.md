# OfferAI Web

Next.js 全栈项目（App Router + TypeScript），校招/事业编信息表、面试资料、投递工作台及管理后台。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **数据库**: PostgreSQL（推荐 [Neon](https://neon.tech) 或 Vercel Postgres 迁移后的 Neon）
- **ORM**: Drizzle ORM
- **样式**: Tailwind CSS

## 项目结构

```
web/
├── src/
│   ├── app/           # 页面与 API 路由
│   │   ├── (site)/    # C 端布局组
│   │   ├── admin/     # 管理后台
│   │   ├── api/       # Route Handlers
│   │   ├── jobs/      # 校招信息表
│   │   ├── civil/     # 事业编信息表
│   │   ├── materials/ # 面试资料
│   │   └── workspace/ # 投递工作台
│   ├── components/    # UI 与业务组件
│   ├── lib/           # 工具、DB、API 响应、Redis/OSS 预留
│   └── middleware.ts  # 鉴权与路由守卫
├── drizzle/
│   ├── schema/        # 表结构
│   └── migrations/    # SQL 迁移
├── design-system/     # 设计系统说明
└── docs/              # PRD 映射等文档
```

## 环境变量

在项目根目录创建 `.env.local`：

```env
# 数据库（Neon 或兼容 Postgres）
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# 可选：Redis（验证码、缓存）
# REDIS_URL="redis://..."

# 可选：阿里云 OSS（资料、简历）
# OSS_*=
```

## 本地开发

```bash
# 安装依赖
npm install

# 生成迁移（按需）
npm run db:generate

# 执行迁移（需已配置 DATABASE_URL）
npm run db:migrate

# 开发
npm run dev
```

访问 http://localhost:3000 。管理后台 http://localhost:3000/admin 未登录会重定向到 `/admin/login`。

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 生产启动 |
| `npm run lint` | ESLint |
| `npm run db:generate` | Drizzle 生成迁移 |
| `npm run db:migrate` | 执行迁移 |
| `npm run db:push` | 直接推 schema（开发用） |
| `npm run db:studio` | Drizzle Studio |

## Vercel 部署

1. 在 Vercel 创建项目，连接本仓库。
2. **Root Directory** 设为 `web`（若仓库根即 web 则留空）。
3. 环境变量中配置 `DATABASE_URL`（Neon 提供 Postgres 连接串）。
4. 部署后执行迁移可在本地或 CI 中运行 `npm run db:migrate`（需能访问生产 DB）。

数据库建议使用 [Neon](https://neon.tech)（与 Vercel 集成良好）；原 Vercel Postgres 已迁移至 Neon，连接方式见 Neon 文档。

## 字典数据（校招筛选）

校招页「招聘类型」「行业」筛选项来自 `dict_items` 表。执行迁移后需插入数据，例如：

- `field_key = 'recruit_type'`：26届春招、26届秋招、暑期实习、日常实习等，`status = 'active'`。
- `field_key = 'industry'`：金融业、IT互联网、房地产等，`status = 'active'`。

可在后台字典管理维护，或直接向 `dict_items` 插入记录（含 `field_key`, `code`, `label`, `sort_order`, `status`, `created_at`, `updated_at`）。

## 参考文档

- 技术设计：`designdocx/tech/`
- 数据模型：`designdocx/tech/02_数据模型与存储.md`
- PRD 与实现映射：`web/docs/prd-mapping.md`
