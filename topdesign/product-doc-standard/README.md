# Offer信息站（OfferAI）产品文档结构标准

> 本标准用于统一本仓库内「蓝图 → Feature List → PRD → 技术设计 → UML 图/原型」之间的结构与追溯关系，便于后续协作与 AI 代写/代查。

---

## 1. 文档根目录约定

- **文档根目录（DOC_ROOT）**：`designdocx/`
- 所有与产品/设计相关的文档（蓝图、Feature List、PRD、ER、时序图、技术设计）均以此为起点进行组织。

目录整体示例：

```text
designdocx/
├── README.md                      # 文档总览与目录说明
├── 01_blueprint.md                # 产品蓝图与场景说明（本 skill 维护）
├── offerAI 产品featureList V2.md  # 功能清单（当前版本主用）
├── offerAI_ER图.mmd               # 数据 ER 图（Mermaid 源文件）
├── offerAI 数据ER图.md            # 数据 ER 图说明文档
├── 时序图*.mmd                    # 关键流程时序图（01~06）
├── tech/                          # 技术设计文档
└── prd/                           # PRD 文档（按模块拆分）
```

---

## 2. 蓝图与上游文档

- **蓝图文档路径**：`designdocx/01_blueprint.md`
- 角色：
  - 统一描述业务背景、版本范围、用户角色、关键场景与能力地图；
  - 汇总并引用 ER 图、时序图等 UML 资产；
  - 为 Feature List、PRD 与技术设计提供「场景 ID / 能力 ID」来源。

---

## 3. Feature List 与 PRD

- **Feature List（当前主用）**：`designdocx/offerAI 产品featureList V2.md`
  - 对应蓝图中的领域/模块/能力，沿用编号体系（如 1.1.1、2.1.3）。
  - 后续若有新版本，建议在同目录增加 `V3`、`V4` 等命名，并在蓝图中注明。

- **PRD 根目录**：`designdocx/prd/`
  - 模块拆分：`backend/M1_登录`、`M2_飞书同步`、`M3_校招岗位` 等。
  - 规范说明：见 `designdocx/prd/README.md` 与 `designdocx/prd/backend/README.md`。
  - 每个 PRD 文档须在 Header 中声明：
    - 对应 Feature List 编号；
    - 对应蓝图场景 ID；
    - 对应 ER 实体与时序图编号（如有）。

---

## 4. UML 图与技术设计

- **ER 图**：
  - 源文件：`designdocx/offerAI_ER图.mmd`
  - 说明文档：`designdocx/offerAI 数据ER图.md`
  - 与技术文档：`designdocx/tech/02_数据模型与存储.md` 对齐。

- **时序图**（关键业务流程）：
  - `designdocx/时序图01_微信扫码登录.mmd`
  - `designdocx/时序图02_校招信息表浏览与解锁.mmd`
  - `designdocx/时序图03_事业编信息表浏览与公告详情.mmd`
  - `designdocx/时序图04_面试资料预览与购买.mmd`
  - `designdocx/时序图05_会员购买.mmd`
  - `designdocx/时序图06_飞书多维表格定时增量同步到系统数据库.mmd`

- **技术设计**：
  - 统一放置于 `designdocx/tech/` 目录，入口总览：`designdocx/TECH_DESIGN_OVERVIEW.md`。

---

## 5. 演进约定

1. 新增版本/模块时，**先更新蓝图**（`01_blueprint.md`）中的版本范围、场景与能力地图，再更新 Feature List 与 PRD。
2. 若 ER 图或时序图更新：
   - 优先修改 `.mmd` 源文件；
   - 在蓝图中补充或修正相关场景描述；
   - 必要时同步技术设计与 PRD 中的字段/流程说明。
3. 历史文档如需归档，建议移动到 `archive/` 或使用 Git 历史，而非在当前主目录保留重复版本。

