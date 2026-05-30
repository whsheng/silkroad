# Silkroads Trade V2 产品与工程规格说明

## 1. 文档目的

这份文档用于把当前 `silkroads.trade` 从“静态工具导航页”升级为“面向中国出海团队的工具决策入口”。

文档目标：

- 明确产品定位、目标用户、差异化方向
- 确定一期与二期的功能边界
- 给出适合 `Codex CLI`、Cursor、Claude Code 等 AI 工具执行的工程规格
- 指导是否新开项目，以及如何复用旧项目数据

这不是视觉稿，也不是营销文案，而是一份可直接指导工程实现的规格说明。

## 2. 总体建议

建议新开一个项目做 `V2`，不要在当前项目上直接硬改。

原因：

- 当前项目是单页静态站，核心数据集中在一个超大文件 `config/site.ts`
- 当前信息架构不适合多语言、SEO、审核流、广告管理
- 当前前台与内容数据强耦合，不适合持续运营
- V2 需要保留“静态化优先”的公开站点，同时引入后台工作流，直接在旧代码上叠加会很快变乱

建议项目名：

- `silkroads-trade-v2`
- 或 `silkroads.trade-next`

旧项目的主要复用资产：

- `config/site.ts` 中已有的分类与站点数据
- 现有卡片式展示风格
- 现有基本品牌方向与域名

旧项目不建议直接复用的部分：

- 单页滚动式信息架构
- `NavData` 大文件模式
- 远程 Google Fonts
- 远程 favicon 直接渲染方案

### 2.1 免费环境下的默认基础设施

已确认运行环境：

- 代码托管：GitHub
- 公开站部署：Vercel
- CDN / 安全层：Cloudflare
- 预算约束：优先按免费方案设计

因此，V2 默认架构原则如下：

- 公开站继续走纯静态输出
- 已发布内容优先存放在 Git 仓库
- 投稿审核优先复用 GitHub Issues / Pull Requests
- 只有运营复杂度明显上升后，才考虑引入数据库

默认推荐组合：

- Git 仓库作为内容源
- GitHub Issues 作为投稿池
- GitHub Pull Requests 作为审核与发布记录
- Vercel 在合并到 `main` 后自动重新部署
- Cloudflare Turnstile 保护投稿表单

当前不作为 V2 默认前提：

- 付费 Postgres
- 付费 CMS
- 复杂后台系统

## 3. 产品定位

### 3.1 一句话定位

为中国出海团队提供工具、服务商、平台与市场方案的中文决策入口。

### 3.2 主用户

主用户优先级：

- 中国跨境电商卖家
- 独立站运营团队
- 工厂型出海团队
- 外贸公司
- 围绕卖家服务的物流、支付、营销、ERP、合规服务商

### 3.3 次级用户

- 英文搜索进入的海外读者
- 希望被中国卖家发现的海外 SaaS / 服务商

### 3.4 核心价值

这个站不能只解决“我去哪里找工具”，而要解决：

- 哪些工具适合中国卖家
- 哪些工具适合哪个市场、平台、阶段
- 哪些服务商真实可用，哪些只是有链接
- 用户如何更快完成选择，而不是看一堆目录

### 3.5 差异化策略

差异化不靠“收录更多链接”，而靠：

- 中文场景化决策信息
- 对中国团队友好的结构化属性
- 持续审核与可信度标记
- 分类页、市场页、场景页、对比页等 SEO 资产
- 可运营、可扩展、可商用的内容系统

## 4. 产品目标

### 4.1 一期目标

一期要完成“可上线、可收录、可扩展”的底座。

一期必须包含：

- 公共站点静态化
- 多语言底座
- SEO 底座
- 内容模型重构
- 高性能加载方案
- 广告位能力预留

一期不做：

- 完整投稿审核后台
- 大规模用户系统
- 复杂商业化投放系统
- 大规模工具详情页扩展

### 4.2 二期目标

二期要完成“可持续运营”。

二期必须包含：

- 用户提交新站点
- 审核与发布工作流
- 审核通过后触发重新部署
- 广告位管理
- 内容运营能力

## 5. 两期迭代定义

## 5.1 第一期：静态化、SEO、多语言、内容底座

目标：

- 公开站点极快加载
- 公共内容可静态生成
- 支持中文和英文
- 形成可索引的信息架构
- 旧数据成功迁移到新内容模型

交付物：

- 新项目初始化完成
- 新内容 schema 与 Git 内容目录完成
- 公开页面可构建为静态页面
- `zh-CN` 与 `en` 基础路由可用
- 分类页、市场页、平台页基础 SEO 完成
- sitemap / robots / canonical / hreflang 可用
- 首批旧数据完成导入
- 搜索索引改为按需加载
- 图标与字体不依赖外部实时拉取

## 5.2 第二期：投稿、审核、发布、广告

目标：

- 外部用户可提交新站点
- 管理员可审核、补充翻译、上线
- 审核通过后自动触发一次新部署
- 广告位可配置与可统计

交付物：

- 投稿表单
- 去重检查
- GitHub Issue 或 PR 审核流
- 审核列表、详情、通过、驳回
- 自动发布与部署触发
- 广告位管理页
- 投稿与广告的基础统计

## 6. 产品信息架构

### 6.1 信息架构原则

- 首页不是唯一入口
- 分类页是核心 SEO 页
- 市场页、平台页、专题页承担搜索增长
- 工具详情页只做高价值精选，不做海量薄页面
- 语言版本必须是并列路由，不是仅前端切换文案

### 6.2 推荐公开路由

推荐路由：

- `/zh-CN`
- `/en`
- `/zh-CN/category/[categorySlug]`
- `/en/category/[categorySlug]`
- `/zh-CN/market/[marketSlug]`
- `/en/market/[marketSlug]`
- `/zh-CN/platform/[platformSlug]`
- `/en/platform/[platformSlug]`
- `/zh-CN/guide/[guideSlug]`
- `/en/guide/[guideSlug]`
- `/zh-CN/submit`
- `/en/submit`

二期或后续可加：

- `/zh-CN/compare/[compareSlug]`
- `/en/compare/[compareSlug]`
- `/zh-CN/tool/[toolSlug]`
- `/en/tool/[toolSlug]`

### 6.3 页面类型

首页：

- 站点定位
- 核心分类入口
- 热门平台/市场入口
- 精选工具区
- 少量赞助位
- 投稿入口

分类页：

- 分类说明
- 适用场景
- 工具列表
- 排序与标签
- FAQ
- 相关推荐分类

市场页：

- 面向国家或区域，如美国、欧洲、东南亚
- 展示适合该市场的工具、服务商、合规资源

平台页：

- 面向 Amazon、Shopify、TikTok Shop、独立站等

专题/指南页：

- 重点解决 SEO 内容问题
- 承载原创分析与场景化内容

投稿页：

- 外部用户提交工具
- 解释审核规则

## 7. SEO 方案

### 7.1 SEO 目标

一期必须让搜索引擎理解：

- 网站是做什么的
- 页面层级是什么
- 中英文页面之间的对应关系是什么
- 每个页面有什么独立价值

### 7.2 SEO 必做项

- 每个页面独立生成 `title`
- 每个页面独立生成 `description`
- 每个页面生成 `canonical`
- 中英文页面互相输出 `hreflang`
- 生成 `sitemap.xml`
- 生成 `robots.txt`
- 分类页和专题页使用面包屑
- 输出 `BreadcrumbList` 结构化数据
- 公开页 HTML 中可直接看到主要内容，避免仅客户端渲染

### 7.3 SEO 内容策略

不要为所有工具立刻生成独立详情页。

一期优先做：

- 首页
- 分类页
- 市场页
- 平台页
- 专题页

工具详情页只给以下对象做：

- 高搜索价值工具
- 能补充足够原创内容的工具
- 有对比、评测、适用人群、使用限制等独特信息的工具

### 7.4 多语言 SEO 原则

- 中文站是主战场
- 英文页面是辅助增长与国际曝光
- 未审核翻译内容不应直接作为高优先级索引页大规模放出
- 英文内容质量不足时，宁可减少页面数量，也不要大量生成薄页

### 7.5 内容质量原则

每个公开页至少要具备以下之一：

- 清晰的分类解释
- 场景化建议
- 中国卖家使用限制说明
- 市场适配信息
- 对比与选择建议

只有“站点名 + 简短简介 + 外链”的页面不应成为 SEO 主力页面。

## 8. 性能方案

### 8.1 性能目标

公开页性能优先级非常高。

目标：

- 公开页默认静态生成
- 首屏内容主要由服务端输出
- 控制公开页客户端 JavaScript 体积
- 减少远程依赖
- 图片、图标、字体全部可稳定构建

### 8.2 性能策略

- 不使用运行时远程 Google Fonts
- 优先使用系统字体栈或本地字体资源
- 不使用实时远程 favicon 作为工具卡片图标
- 对工具图标做本地缓存或对象存储镜像
- 搜索索引在用户打开搜索框时再加载
- 卡片列表分页或分页面展示，不做一个页面塞几千个节点
- 优先使用 Server Components，尽量减少客户端组件范围
- 仅把搜索框、主题切换、投稿表单、后台等交互部分做成客户端组件

### 8.3 图标策略

推荐方案：

- 导入旧数据后，异步抓取站点 favicon
- 存储为本地可控资源或对象存储资源
- 构建时使用本地 CDN 地址

不要继续使用：

- `https://www.google.com/s2/favicons?...`

原因：

- 构建与渲染不可控
- 页面稳定性差
- 性能与展示质量不稳定

## 9. 广告与商业化方案

### 9.1 一期原则

一期先做“广告位能力”，不急着接第三方广告联盟。

推荐优先级：

- 赞助位
- 精选推荐位
- 分类页顶部品牌位
- 卡片流中的赞助卡片

不建议一期优先做：

- AdSense
- 大量第三方广告脚本
- 弹窗式广告

原因：

- 性能影响大
- 控制力弱
- 不利于建立可信度
- 对中文 B2B 垂类站点未必是最佳变现方式

### 9.2 广告位类型

建议预设以下广告位：

- `home_hero_banner`
- `home_featured_sponsor`
- `category_top_banner`
- `category_inline_card`
- `guide_inline_banner`

### 9.3 广告内容约束

- 必须带“赞助”或“Sponsored”标记
- 不允许遮挡主内容
- 不允许导致明显 CLS
- 不允许自动播放
- 不允许破坏首屏可读性

### 9.4 后续商业化方向

- 赞助位销售
- 精选推荐合作
- 服务商入驻
- 专题合作页
- 线索表单分发
- 高价值目录页的付费曝光

## 10. 多语言方案

### 10.1 语言范围

首批支持：

- `zh-CN`
- `en`

### 10.2 多语言层次

需要区分三类多语言：

- UI 文案多语言
- SEO 元信息多语言
- 内容字段多语言

### 10.3 实现原则

- 路由采用 `app/[locale]`
- UI 文案使用本地字典文件
- 分类、工具、专题等内容使用 Git 内容文件与翻译文件
- 未翻译完成的内容不要强行在所有语言下公开

### 10.4 翻译策略

分类与核心页面：

- 中文人工确定
- 英文人工校对

工具简介：

- 允许机器初译
- 需要审核后才进入高优先级公开页

专题内容：

- 不建议一期全部双语
- 可以优先做中文，英文只做少量重点内容

## 11. 内容模型

这一节描述的是逻辑实体，不要求一期必须落数据库。

V2 默认实现方式：

- 公开内容使用 Git 管理的 JSON / Markdown / MDX 文件
- 投稿数据优先进入 GitHub Issues
- 审核通过后的内容进入 `content/` 目录
- 只有后续复杂度明显上升时，才迁移到数据库

## 11.1 核心实体

一期与二期需要以下实体：

- `categories`
- `category_translations`
- `tools`
- `tool_translations`
- `markets`
- `platforms`
- `tool_categories`
- `tool_markets`
- `tool_platforms`
- `guides`
- `guide_translations`
- `submissions`
- `ads`
- `ad_placements`

### 11.1.1 推荐文件化存储映射

推荐内容目录：

```text
content/
  categories/
    index.json
    translations/
      zh-CN.json
      en.json
  markets/
    index.json
    translations/
      zh-CN.json
      en.json
  platforms/
    index.json
    translations/
      zh-CN.json
      en.json
  tools/
    <tool-slug>/
      meta.json
      zh-CN.md
      en.md
  guides/
    <guide-slug>/
      zh-CN.mdx
      en.mdx
  ads/
    placements.json
    items.json
  submissions/
    archive/
```

设计原则：

- 一条工具一组文件，方便 PR 审核和差异比较
- 翻译内容按语言拆分，避免单文件过大
- 已发布内容和待审内容分离

### 11.2 `categories`

建议字段：

- `id`
- `slug`
- `parent_id`
- `sort_order`
- `status`
- `is_featured`
- `created_at`
- `updated_at`

### 11.3 `category_translations`

建议字段：

- `id`
- `category_id`
- `locale`
- `name`
- `short_description`
- `seo_title`
- `seo_description`
- `intro_markdown`

### 11.4 `tools`

建议字段：

- `id`
- `slug`
- `name_default`
- `official_url`
- `normalized_domain`
- `logo_url`
- `logo_local_path`
- `pricing_model`
- `supports_chinese`
- `supports_chinese_ui`
- `supports_chinese_support`
- `supports_chinese_business`
- `requires_foreign_entity`
- `requires_vat`
- `requires_credit_card`
- `free_trial_available`
- `verification_status`
- `editor_score`
- `status`
- `source_type`
- `source_note`
- `last_verified_at`
- `created_at`
- `updated_at`

说明：

- `status` 建议值：`draft | pending_review | approved | rejected | archived`
- `source_type` 建议值：`seed_import | manual_editor | user_submission | partner`

### 11.5 `tool_translations`

建议字段：

- `id`
- `tool_id`
- `locale`
- `name`
- `summary`
- `description_markdown`
- `best_for`
- `not_for`
- `pricing_notes`
- `seo_title`
- `seo_description`
- `faq_json`

### 11.6 `markets`

建议字段：

- `id`
- `slug`
- `sort_order`
- `status`

市场例子：

- `us`
- `eu`
- `uk`
- `sea`
- `middle-east`

### 11.7 `platforms`

建议字段：

- `id`
- `slug`
- `sort_order`
- `status`

平台例子：

- `amazon`
- `shopify`
- `tiktok-shop`
- `independent-site`
- `walmart`

### 11.8 关联表

建议关联表：

- `tool_categories`
- `tool_markets`
- `tool_platforms`

每张表至少包含：

- `id`
- `tool_id`
- 对应实体 `id`
- `sort_order`

### 11.9 `guides`

专题内容建议字段：

- `id`
- `slug`
- `cover_image`
- `status`
- `published_at`
- `updated_at`

### 11.10 `guide_translations`

建议字段：

- `id`
- `guide_id`
- `locale`
- `title`
- `summary`
- `content_markdown`
- `seo_title`
- `seo_description`

### 11.11 `submissions`

建议字段：

- `id`
- `submitted_by_name`
- `submitted_by_email`
- `submitted_by_wechat`
- `official_url`
- `tool_name`
- `description`
- `suggested_categories`
- `suggested_markets`
- `suggested_platforms`
- `locale`
- `contact_consent`
- `status`
- `dedupe_result`
- `review_note`
- `reviewed_by`
- `reviewed_at`
- `created_at`

默认存放方式建议：

- 一期与二期早期：GitHub Issues
- 如需结构化归档：审核完成后导出为 `content/submissions/archive/*.json`

### 11.12 `ads`

建议字段：

- `id`
- `placement_key`
- `locale`
- `target_type`
- `target_slug`
- `title`
- `description`
- `image_url`
- `cta_text`
- `target_url`
- `sponsor_name`
- `disclosure_label`
- `start_at`
- `end_at`
- `priority`
- `status`

### 11.13 `ad_placements`

建议字段：

- `id`
- `key`
- `name`
- `description`
- `supports_locales`
- `supports_targets`
- `max_items`
- `status`

## 12. 投稿、审核、发布流程

### 12.1 用户投稿流程

流程：

1. 用户提交工具信息
2. Cloudflare Turnstile 校验通过
3. 系统根据域名和名称做初步去重
4. 通过 GitHub API 创建一个 `submission` issue，状态为 `pending_review`
5. 管理员在 GitHub 中补充分类、市场、平台、中文简介、英文简介
6. 管理员通过脚本或审核页生成内容文件变更
7. 生成 Pull Request 并审核
8. 合并到 `main`
9. Vercel 自动重新部署
10. 新静态站点上线

### 12.2 审核规则

审核必须判断：

- 是否是正常官网
- 是否属于站点范围
- 是否已有重复工具
- 是否适合中国出海团队
- 简介是否足够清楚
- 是否需要添加风险提示

### 12.3 去重规则

至少用以下维度去重：

- `normalized_domain`
- 工具名称相似度
- `official_url` 标准化

### 12.4 发布机制

推荐机制：

- 管理员审核通过后，把内容写入仓库中的 `content/` 文件
- 通过 Pull Request 完成审核痕迹与版本记录
- 合并到 `main` 后触发 Vercel 自动构建
- 构建阶段只读取仓库中的已发布内容生成静态页

这样可以兼顾：

- 公开站点纯静态
- 审核工作流可持续运营
- 发布流程简单可靠

## 13. 技术架构建议

### 13.1 推荐技术方向

公开站点：

- `Next.js App Router`
- TypeScript
- Tailwind CSS
- Server Components 优先

后台与数据：

- Git 仓库作为主数据源
- GitHub Issues 作为投稿池
- GitHub Pull Requests 作为审核与发布记录
- Route Handlers 处理投稿、校验、GitHub API 调用

部署：

- `Vercel`
- 合并到 `main` 后自动部署

安全与反垃圾：

- `Cloudflare Turnstile`

可选升级路径：

- 如后续需要真正的在线后台与数据库，再评估 `Cloudflare D1`

### 13.2 为什么这样选

- 公开站需要静态化与 SEO，Next.js 适合
- Git 管理结构化内容，对静态站最稳
- GitHub 自带 issue / PR / diff / 审核痕迹，适合低成本运营
- 审核后合并触发重建，是最自然的静态站工作流
- Vercel 部署与 Next.js 配合成熟
- Cloudflare Turnstile 适合拦截垃圾投稿

### 13.3 为什么不把数据库作为默认前提

虽然 Cloudflare D1 免费层可用，但它更适合和 Cloudflare Workers 紧耦合使用。

当前项目的主部署目标是 Vercel，因此如果一开始就引入 D1，会增加：

- 运行时分裂
- 接口鉴权复杂度
- 本地开发复杂度
- 迁移与调试成本

因此，V2 更稳妥的起步方式是：

- 发布内容放 Git
- 投稿审核放 GitHub
- 公开站纯静态

当以下条件出现时，再考虑上数据库：

- 投稿量明显增大
- 需要多人后台协作
- 需要复杂筛选、统计、权限系统
- 需要半实时更新

### 13.4 构建数据来源

构建时读取：

- `content/categories`
- `content/tools`
- `content/markets`
- `content/platforms`
- `content/guides`
- `content/ads`

运行时公开页面不依赖数据库请求。

### 13.5 审核后台建议

优先级建议：

- 一期：不用自建完整后台，直接复用 GitHub Issues / PR
- 二期：补一个轻量审核页，只服务你自己或少数编辑

如果做二期轻量审核页，建议路由：

- `/admin/submissions`
- `/admin/submissions/[id]`
- `/admin/tools`
- `/admin/tools/[slug]`
- `/admin/ads`

## 14. 推荐目录结构

```text
silkroads-trade-v2/
  app/
    [locale]/
      layout.tsx
      page.tsx
      category/[slug]/page.tsx
      market/[slug]/page.tsx
      platform/[slug]/page.tsx
      guide/[slug]/page.tsx
      submit/page.tsx
    admin/
      submissions/page.tsx
      submissions/[id]/page.tsx
      tools/page.tsx
      tools/[slug]/page.tsx
      ads/page.tsx
    sitemap.ts
    robots.ts
    api/
      submit/route.ts
  components/
    public/
    admin/
    ui/
  content/
    categories/
    markets/
    platforms/
    tools/
    guides/
    ads/
  lib/
    seo/
    i18n/
    content/
    search/
    ads/
    github/
    turnstile/
  messages/
    zh-CN.json
    en.json
  scripts/
    import-navdata.ts
    fetch-tool-icons.ts
    build-search-index.ts
    issue-to-content.ts
    normalize-tool-data.ts
  docs/
```

## 15. 搜索能力设计

### 15.1 公开站搜索原则

- 搜索不是首屏阻塞资源
- 搜索索引应该预生成
- 用户打开搜索框时再加载索引

### 15.2 方案

- 构建时生成 `zh-CN` 与 `en` 的搜索索引 JSON
- 前端在打开搜索对话框时动态加载
- 搜索字段至少包含：
  - 工具名称
  - 简介
  - 分类
  - 市场
  - 平台

## 16. 内容迁移方案

### 16.1 迁移来源

当前项目 `config/site.ts` 是旧数据主来源。

### 16.2 迁移步骤

1. 解析 `NavData`
2. 为每个分类生成 `slug`
3. 为每个工具生成基础内容文件
4. 根据 URL 提取标准化域名
5. 写入 `zh-CN` 内容文件
6. 默认标记为 `approved` 或 `seed_import`
7. 对明显重复的数据做聚合
8. 后续补充英文翻译和增强属性

### 16.3 迁移后人工补充

迁移后需要人工或半自动补充：

- 市场标签
- 平台标签
- 中国卖家支持信息
- 风险与限制信息
- 英文翻译
- SEO 标题与描述

## 17. AI 自动化实施拆分

这一节用于让 `Codex CLI` 之类工具按小任务推进，不要一次性生成整站。

### 17.1 任务拆分原则

- 每次任务控制在一个明确模块内
- 每个任务都要有输入、输出、验收标准
- 先搭底座，再迁数据，再做后台

### 17.2 任务包列表

任务包 01：

- 初始化 V2 项目
- 建立目录结构
- 配置基础 lint / typecheck / format
- 验收：项目可运行，首页空壳可访问

任务包 02：

- 建立 `app/[locale]` 路由
- 建立本地字典加载
- 中英文切换可用
- 验收：`/zh-CN` 与 `/en` 都可访问

任务包 03：

- 建立 `content/` 内容 schema 与类型校验
- 建立分类、市场、平台、工具、广告的 JSON / Markdown 约束
- 验收：内容文件可通过校验脚本

任务包 04：

- 编写 `import-navdata.ts`
- 从旧项目导入分类和工具
- 验收：旧数据成功进入新内容目录

任务包 05：

- 实现首页、分类页、市场页、平台页静态页面
- 接入元信息生成
- 验收：主要公开页可 `next build` 成功

任务包 06：

- 实现 sitemap / robots / hreflang / breadcrumb
- 验收：主要 SEO 文件生成正确

任务包 07：

- 实现本地图标缓存与使用逻辑
- 移除远程 Google Fonts 依赖
- 验收：构建不依赖外部字体请求

任务包 08：

- 实现搜索索引预构建
- 搜索框按需加载索引
- 验收：搜索可用且不拖慢首屏

任务包 09：

- 实现投稿页与提交接口
- 接入 Turnstile
- 加入基本校验与去重
- 提交后创建 GitHub Issue
- 验收：可新增 `pending_review` 投稿 issue

任务包 10：

- 实现审核页或 GitHub 审核辅助脚本
- 审核通过 / 驳回流程可用
- 验收：可以从 issue 生成内容 PR 或直接生成内容文件变更

任务包 11：

- 实现审核通过后的发布脚本
- 构建时只读取 `content/` 已发布内容
- 验收：新内容能通过合并 PR 自动进入公开站

任务包 12：

- 实现广告位模型与前台渲染
- 后台可配置广告位
- 验收：不同页面可展示受控赞助位

## 18. 适合 AI 工具的执行提示词模板

以下模板用于拆给 AI 编码工具执行。

### 模板 A：初始化项目

```text
请创建一个新的 Next.js App Router 项目，项目名为 silkroads-trade-v2。
要求：
1. TypeScript
2. Tailwind CSS
3. app/[locale] 路由结构
4. 公开站与 admin 路由分离
5. 保留当前 silkroads.trade 的卡片式导航风格，但不要复制旧的数据结构
6. 输出完整目录结构和初始化代码
7. 保证 pnpm build 可通过
```

### 模板 B：实现内容模型

```text
请在 silkroads-trade-v2 中实现内容数据层。
要求：
1. 使用 JSON / Markdown / MDX 内容文件表达 categories、tools、translations、markets、platforms、guides、ads
2. 给出 Zod 或 TypeScript schema
3. 提供 TypeScript 类型定义
4. 提供 build-time 查询函数，只读取已发布内容
5. 不实现 UI，只实现内容 schema 和内容访问层
```

### 模板 C：迁移旧数据

```text
请编写一个导入脚本，把旧项目中的 config/site.ts NavData 转成新项目内容文件。
要求：
1. 解析分类与工具
2. 生成 slug
3. 提取标准化域名
4. 写入 zh-CN 内容文件
5. 标记 source_type = seed_import
6. 输出导入报告，包括总分类数、总工具数、重复项数
```

### 模板 D：实现 SEO 页

```text
请在 silkroads-trade-v2 中实现公开 SEO 页面。
要求：
1. 首页、分类页、市场页、平台页都使用静态生成
2. 使用 generateStaticParams
3. 使用 generateMetadata
4. 输出 canonical、hreflang、Open Graph、BreadcrumbList
5. 生成 sitemap.ts 与 robots.ts
6. 确保公开页面主要内容在 HTML 中直接可见
```

### 模板 E：实现审核流

```text
请在 silkroads-trade-v2 中实现投稿与审核最小闭环。
要求：
1. 公开投稿页
2. 接入 Cloudflare Turnstile
3. 提交后创建 GitHub Issue
4. 管理员可查看 pending_review submissions
5. 管理员可通过脚本或审核页把 issue 转为 content 文件变更
6. 合并后由 Vercel 自动部署
```

## 19. 验收标准

### 19.1 一期验收

- 公开站首页、分类页、市场页、平台页均可静态生成
- `zh-CN` 与 `en` 路由可访问
- `sitemap.xml`、`robots.txt`、`canonical`、`hreflang` 正常
- 旧数据可导入新内容目录
- 搜索索引按需加载
- 不依赖 Google Fonts 在线请求
- 公开站不依赖运行时数据库读取

### 19.2 二期验收

- 用户可以提交站点
- 管理员可以审核站点
- 审核通过后可以触发部署
- 新内容可在重新部署后进入公开站
- 广告位可配置
- 赞助内容有清晰标记

## 20. 指标建议

### 20.1 一期指标

- 首页与分类页可被正常收录
- 主要页面通过 Search Console 抓取
- 首屏速度与 Core Web Vitals 明显优于当前项目
- 分类页成为主要自然流量入口

### 20.2 二期指标

- 月投稿数
- 审核通过率
- 投稿到上线平均时长
- 广告位点击率
- 赞助位转化或线索量

## 21. 需要你尽快拍板的事项

以下事项建议在正式开工前确定：

- V2 是否单独新建仓库
- 首批是否只做 `zh-CN + en`
- 一期是否包含少量专题页
- 广告一期是否只做“赞助位”，暂不接广告联盟
- 是否使用 `GitHub + Vercel + Cloudflare Turnstile` 作为默认基础设施

## 22. 外部参考依据

以下官方资料支撑了本方案中的几个关键决策：

- Next.js App Router 国际化路由：<https://nextjs.org/docs/app/guides/internationalization>
- Next.js `generateStaticParams`：<https://nextjs.org/docs/app/api-reference/functions/generate-static-params>
- Next.js Metadata 与 sitemap：<https://nextjs.org/docs/app/building-your-application/optimizing/metadata>
- Next.js `sitemap.xml`：<https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap>
- Google Helpful Content 指南：<https://developers.google.com/search/docs/fundamentals/creating-helpful-content>
- Google `BreadcrumbList` 结构化数据：<https://developers.google.com/search/docs/appearance/structured-data/breadcrumb>
- Google 多语言页面 `hreflang`：<https://developers.google.com/search/docs/advanced/crawling/localized-versions>
- GitHub Free 计划：<https://docs.github.com/en/get-started/learning-about-github/githubs-plans>
- GitHub Contents API：<https://docs.github.com/en/rest/repos/contents>
- GitHub Pull Requests API：<https://docs.github.com/en/rest/pulls/pulls>
- Vercel 计划与使用限制：<https://vercel.com/docs/plans>
- Vercel 平台限制：<https://vercel.com/docs/limits>
- Cloudflare Turnstile：<https://www.cloudflare.com/application-services/products/turnstile/>
- Cloudflare D1 定价：<https://developers.cloudflare.com/d1/platform/pricing/>
