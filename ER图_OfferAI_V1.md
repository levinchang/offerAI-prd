```mermaid
erDiagram
    用户 {
        bigint 用户ID PK
        string 微信OpenID
        string 微信UnionID
        string 昵称
        string 头像URL
        datetime 注册时间
        string 状态
    }

    管理员 {
        bigint 管理员ID PK
        string 账号
        string 密码摘要
        string 角色
        string 状态
        datetime 创建时间
    }

    商品SKU {
        bigint 商品ID PK
        string 商品类型 "会员/资料"
        string 名称
        decimal 售价
        int 有效天数 "会员用"
        bigint 关联资料ID "资料商品用"
        string 状态 "DRAFT/PUBLISHED"
    }

    面试资料 {
        bigint 资料ID PK
        string 标题
        string 分类
        string 标签
        string 文件Key
        int 预览页数 "默认3"
        string 发布状态
        datetime 更新时间
    }

    资料预览页 {
        bigint 预览页ID PK
        bigint 资料ID FK
        int 页码
        string 预览资源URL
    }

    订单 {
        bigint 订单ID PK
        bigint 用户ID FK
        string 订单号
        string 订单状态 "created/paying/paid/refunded"
        decimal 订单总额
        string 支付渠道 "微信/支付宝"
        datetime 创建时间
        datetime 支付时间
    }

    订单明细 {
        bigint 明细ID PK
        bigint 订单ID FK
        bigint 商品ID FK
        int 数量
        decimal 成交单价
        string 权益范围 "如doc_id"
    }

    支付记录 {
        bigint 支付记录ID PK
        bigint 订单ID FK
        string 渠道交易号
        string 回调验签状态
        string 回调幂等键
        string 支付状态
        datetime 回调时间
    }

    用户权益 {
        bigint 权益ID PK
        bigint 用户ID FK
        string 权益类型 "校招会员/事业编会员/资料访问"
        string 权益范围 "如doc_id"
        datetime 生效时间
        datetime 失效时间
        string 来源 "订单发放/后台补发"
        string 状态
    }

    校招信息 {
        bigint 校招ID PK
        string source_key
        string 公司
        string 岗位
        string 城市
        string apply_url
        string source_url
        string 发布状态
        string 生命周期状态
        datetime 更新时间
    }

    事业编信息 {
        bigint 事业编ID PK
        string source_key
        string 机构
        string 标题
        string 地区
        string 报名入口URL
        string 公告来源URL
        string 发布状态
        string 生命周期状态
        datetime 更新时间
    }

    投递记录 {
        bigint 投递ID PK
        bigint 用户ID FK
        string 目标类型 "校招/事业编"
        bigint 目标ID
        string 阶段 "未投/已投/笔试/一面/二面/OC/拒"
        datetime 投递时间
        bigint 简历ID FK
        string 备注
    }

    简历版本 {
        bigint 简历ID PK
        bigint 用户ID FK
        string 文件Key
        string 文件名
        string 标签
        datetime 上传时间
    }

    分组 {
        bigint 分组ID PK
        bigint 用户ID FK
        string 分组名
        datetime 创建时间
    }

    分组项 {
        bigint 分组项ID PK
        bigint 分组ID FK
        string 目标类型 "校招/事业编"
        bigint 目标ID
        datetime 加入时间
    }

    收藏 {
        bigint 收藏ID PK
        bigint 用户ID FK
        string 目标类型 "校招/事业编/资料"
        bigint 目标ID
        datetime 收藏时间
    }

    反馈 {
        bigint 反馈ID PK
        bigint 用户ID FK
        string 目标类型
        bigint 目标ID
        string 问题类型 "链接失效/信息错误/侵权"
        string 内容
        string 状态 "OPEN/IN_PROGRESS/DONE"
        datetime 创建时间
    }

    数据源配置 {
        bigint 数据源ID PK
        string 数据源类型 "campus/civil"
        string 飞书BaseID
        string 飞书TableID
        string 同步频率
        string 状态
    }

    字段映射 {
        bigint 映射ID PK
        bigint 数据源ID FK
        string 映射版本
        text mapping_json
        datetime 创建时间
    }

    同步任务 {
        bigint 同步任务ID PK
        bigint 数据源ID FK
        datetime 开始时间
        datetime 结束时间
        string 状态
        int 新增数
        int 更新数
        int 失败数
    }

    同步差异 {
        bigint 差异ID PK
        bigint 同步任务ID FK
        string 动作 "INSERT/UPDATE/EXPIRE/SKIP"
        string 目标类型 "校招/事业编"
        string source_key
        text diff_json
    }

    审计日志 {
        bigint 日志ID PK
        bigint 管理员ID FK
        string 操作对象类型
        bigint 操作对象ID
        string 操作类型 "发布/撤销/编辑/同步"
        text 变更摘要
        datetime 操作时间
    }

    用户 ||--o{ 订单 : 下单
    订单 ||--|{ 订单明细 : 包含
    商品SKU ||--o{ 订单明细 : 被购买
    订单 ||--o{ 支付记录 : 支付回调
    用户 ||--o{ 用户权益 : 拥有
    订单 ||--o{ 用户权益 : 发放来源

    面试资料 ||--o{ 资料预览页 : 生成
    面试资料 ||--o| 商品SKU : 对应资料商品

    用户 ||--o{ 简历版本 : 上传
    用户 ||--o{ 投递记录 : 记录
    简历版本 ||--o{ 投递记录 : 关联

    用户 ||--o{ 分组 : 创建
    分组 ||--o{ 分组项 : 包含
    用户 ||--o{ 收藏 : 收藏
    用户 ||--o{ 反馈 : 提交

    数据源配置 ||--o{ 字段映射 : 定义
    数据源配置 ||--o{ 同步任务 : 触发
    同步任务 ||--o{ 同步差异 : 产出

    管理员 ||--o{ 审计日志 : 操作
```
