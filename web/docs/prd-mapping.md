# PRD 与实现映射

| PRD 章节 | 路由/API | 说明 |
|----------|----------|------|
| **F3.1** 校招页概览与24h统计 | `/jobs` 顶部统计卡片, `/api/jobs/stats` | 已实现：6 项指标 + 更新日期 |
| **F3.3** 校招筛选与搜索 | `/jobs` 筛选区, `/api/jobs?keyword=&recruitType=&industry=` | 已实现：关键词、招聘类型、行业、重置 |
| **F3.5** 校招列表展示与分页 | `/jobs` 表格, `/api/jobs` | 已实现：列（更新时间/公司/岗位/城市/行业/网申时间）、20/50 条每页、截止高亮、空状态 |
| F3.4 筛选分组 | `/jobs` 首行「我的筛选分组」「保存当前筛选」 | 待实现（需用户筛选分组表与登录） |
| **F3.6** 权限与行内操作 | 投递链接、信息来源、操作专区、收藏 | 已实现：三态展示、标记进度（含已投递填岗位）、编辑备注、收藏星标；开发登录占位 |
| **F3.7** 收藏与已投递筛选 | 仅看收藏、求职进度下拉 | 已实现：仅看收藏、求职进度筛选；列表返回 favoriteIds、applyRecordMap |
| M8.1 校招表字典 | `/api/dicts?field_key=recruit_type&field_key=industry` | 已实现；需在 dict_items 中维护数据 |
| 事业编信息表 | `/civil`, `/api/civil` | 待按 PRD 实现列表与筛选 |
| 面试资料 | `/materials`, `/api/materials` | 待实现 |
| 投递工作台 | `/workspace`, `/api/submissions` | 待实现 |
| 账户与鉴权 | `/api/auth/login`, `/api/auth/session` | 占位：cookie session、开发期 POST body `user_id` 设登录；session 返回 userId、isCampusMember |
| 收藏 | `GET/POST/DELETE /api/favorites` | 已实现；按用户与 target_type/target_id |
| 投递记录 | `GET/POST/PATCH /api/apply-records` | 已实现；标记进度、备注，与列表联动 |
| 会员与订单 | `/api/orders` | 预留 |
| 后台管理 | `/admin`, `/admin/jobs`, `/admin/orders` | 骨架已建 |
