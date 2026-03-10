# Offer信息站（OfferAI）产品文档结构标准

> 本标准用于统一本仓库内「蓝图 → Feature List → PRD → 技术设计」之间的结构与追溯关系，便于后续协作与 AI 代写/代查。

---

## 1. 文档根目录约定

- **顶层设计目录（DOC_ROOT）**：`topdesign/`
- 所有与产品设计相关的上游文档（蓝图、Feature List、结构标准）放在 `topdesign/`，与之对应的 PRD 与技术设计分别在同级的 `prd/`、`tech/` 目录中。

当前整体结构示例：

```text
xiaoy/
├── topdesign/
│   ├── README.md                    # 顶层设计总览与导航
│   ├── 01_blueprint.md              # 产品蓝图与场景说明
│   ├── 02_featureList .md           # Feature List（功能清单）
│   └── product-doc-standard/
│       └── README.md                # 本文件：产品文档结构标准
│
├── prd/                             # PRD 文档（按模块拆分）
│   ├── README.md                    # PRD 撰写规范与索引
│   ├── backend/                     # 后台管理 PRD
│   └── frontend/                    # 前台/工作台 PRD（如有）
│
└── tech/                            # 技术设计文档
    ├── README.md
    ├── 01_技术栈与架构.md
    ├── 02_数据模型与存储.md
    ├── 03_接口与鉴权.md
    ├── 04_支付与权益发放.md
    ├── 05_业务模块实现要点.md
    └── 06_开发环境与联调约定.md
```

---

## 2. 蓝图与上游文档

- **蓝图文档路径**：`topdesign/01_blueprint.md`
- 角色：
  - 统一描述业务背景、版本范围、用户角色、关键场景与能力地图；
  - 内联或索引 ER 图、时序图等 UML 资产；
  - 为 Feature List、PRD 与技术设计提供「场景 ID / 能力 ID」来源。

---

## 3. Feature List 与 PRD

- **Feature List（当前主用）**：`topdesign/02_featureList .md`
  - 对应蓝图中的领域/模块/能力，沿用编号体系（如 1.1.1、2.1.3）。
  - 后续若有新版本，建议在 `topdesign/` 目录增加 `03_featureList_V3.md` 等命名，并在蓝图中注明。

- **PRD 根目录**：`prd/`
  - 模块拆分：`backend/M1_登录`、`M2_飞书同步`、`M3_校招岗位` 等。
  - 规范说明：见 `prd/README.md` 与 `prd/backend/README.md`。
  - 每个 PRD 文档须在 Header 中声明：
    - 对应 Feature List 编号；
    - 对应蓝图场景 ID；
    - 对应 ER 实体与时序图编号（如有）。

---

## 4. UML 图与技术设计

- **ER 图与数据模型**：
  - 主要以 `tech/02_数据模型与存储.md` 为主，字段与表结构与蓝图中的 ER 描述保持一致；
  - 如需可视化 ER 图，可在 `01_blueprint.md` 或 `tech/02_数据模型与存储.md` 中使用 Mermaid 内联。

- **时序图（关键业务流程）**：
  - 关键场景（如校招信息表浏览与解锁、飞书多维表格同步）对应的时序图源码，优先内联在 `01_blueprint.md` 中；
  - 技术实现细节可在 `tech/03_接口与鉴权.md`、`tech/04_支付与权益发放.md` 等文档中补充。

- **技术设计**：
  - 统一放置于 `tech/` 目录，入口总览：`tech/README.md`。
  - 与蓝图、Feature List、PRD 中的场景与模块编号保持一致。

---

## 5. 演进约定

1. 新增版本/模块时，**先更新蓝图**（`01_blueprint.md`）中的版本范围、场景与能力地图，再更新 Feature List 与 PRD。
2. 若数据模型或关键流程有变更：
   - 优先在 `tech/02_数据模型与存储.md` 与相关技术文档中更新；
   - 在蓝图中补充或修正对应 ER/时序描述；
   - 必要时同步 PRD 中的字段/流程说明。
3. 历史文档如需归档，建议移动到单独的 `archive/` 目录或依赖 Git 历史，而不是在当前主目录保留重复版本。

