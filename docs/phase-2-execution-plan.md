# 二期开发执行清单

本文档用于把二期从“讨论方向”落成“按顺序执行的任务列表”。默认约束不变：

- 代码托管：GitHub
- 部署：Vercel
- CDN / 安全层：Cloudflare
- 预算：优先免费方案
- 已发布内容：继续走静态构建

## 当前基线

当前线上版本已经具备：

- 静态化公开站
- `zh-CN / en` 多语言路由
- SEO 基础能力
- `content/` 驱动的数据结构
- 站内投稿到 GitHub Issue 的最小闭环

当前二期仍缺：

- 投稿防垃圾
- 审核状态规范
- 审核通过后的内容入库流程
- 自动发布与回滚边界
- 广告投放 MVP
- 更适合长期运营的专题内容系统

## 执行顺序

### 任务 1：投稿防垃圾与审核状态基础

状态：已完成基础实现，待线上变量联调

目标：

- 给投稿表单接入 Cloudflare Turnstile
- 服务端完成 Siteverify 校验
- 明确 GitHub Issue 的审核状态标签约定

本批交付：

- 投稿页可选启用 Turnstile
- 服务端在开启密钥后强制校验 token
- README 补充环境变量说明
- 推荐审核状态标签：
  - `pending-review`
  - `needs-info`
  - `approved`
  - `rejected`
  - `published`

验收标准：

- 未完成安全校验时，不能成功创建投稿 Issue
- 已完成校验时，正常进入 GitHub Issue 队列
- 旧的无 Turnstile 环境不因本次改动直接中断

代码落点：

- `components/public/submit-form.tsx`
- `components/public/turnstile-widget.tsx`
- `app/api/submissions/route.ts`
- `lib/submissions/server.ts`

### 任务 2：Issue -> 内容草稿生成

状态：已完成基础实现

目标：

- 把审核通过的 Issue 转成可合并的内容草稿，而不是人工复制粘贴

本批交付：

- 新增脚本，从 GitHub Issue 内容生成标准化工具记录
- 输出内容能写入 `content/tools/index.json`
- 记录 `sourceIssueNumber`、`reviewStatus`、`reviewedAt`

验收标准：

- 给定一个合格 Issue，可自动生成一条可校验的工具草稿
- 不合法字段会在脚本阶段报错，而不是到部署阶段才失败

建议实现：

- `scripts/generate-tool-from-issue.mjs`
- `lib/content/types.ts`
- `scripts/validate-content.mjs`

### 任务 3：审核发布工作流

状态：进行中

目标：

- 让审核通过后的内容以 PR 方式进入主仓库，并由合并触发上线

本批交付：

- 生成内容草稿的标准操作文档
- PR 模板或审核清单
- 发布后回写 Issue 状态为 `published`

当前进展：

- 已补充审核发布 SOP 文档
- 已补充 PR 模板
- 已新增 Issue 状态回写脚本

验收标准：

- 一个投稿从 `pending-review` 到 `published` 的步骤固定可重复
- 合并到 `main` 后由 Vercel 自动发布，无需手工部署

### 任务 4：广告投放 MVP

状态：进行中

目标：

- 先做轻量原生赞助位，不引入影响性能的广告脚本

本批交付：

- 广告位配置支持开始时间、结束时间、语言、页面范围
- 首页、分类页、专题页至少各有一个可控投放位
- 点击事件接入现有统计

当前进展：

- 已扩展广告数据结构，支持排期与页面范围
- 已接入首页、分类页、专题页的赞助位读取逻辑
- 已补充可选 Google Analytics 点击事件上报

验收标准：

- 运营可通过内容文件控制广告上线和下线
- 页面不依赖第三方广告脚本也能稳定展示赞助内容

建议实现：

- `content/ads/placements.json`
- `content/ads/items.json`
- `components/public/ad-banner.tsx`

### 任务 5：专题内容系统重构

状态：进行中

目标：

- 把专题从大 JSON 迁移到按篇维护的 Markdown 结构

本批交付：

- 新旧专题结构兼容读取
- 至少迁移现有 8 篇专题中的 2 篇作为样例
- 增加专题 schema 校验

当前进展：

- 已新增 JSON 与目录化 Markdown 双兼容读取
- 已迁移 2 篇专题为目录化样例
- 已补充专题内容块校验

验收标准：

- 单篇专题可单独增删改
- 多语言专题可按篇维护
- 构建产物与现有路由兼容

设计参考：

- `docs/guide-content-system-plan.md`

### 任务 6：SEO 运营增强

状态：进行中

目标：

- 强化专题页、分类页、市场页的搜索承接能力

本批交付：

- 专题页补充 `Article` 结构化数据
- 面包屑结构化数据补全
- 分类 / 市场 / 平台页补充 FAQ 或运营化说明模块
- 加强站内内链

当前进展：

- 已为专题页补充 `Article` 结构化数据
- 已为分类 / 市场 / 平台页补充 FAQ 结构化数据或可见 FAQ 模块
- 现有页面之间的市场、平台、分类、专题导流关系已进一步增强

验收标准：

- 重点页面的标题、摘要、结构化数据更完整
- 同一内容在分类、市场、专题之间存在清晰导流

## 推荐环境变量

```bash
GITHUB_SUBMISSIONS_REPO=owner/repo
GITHUB_SUBMISSIONS_TOKEN=github_pat_xxx
GITHUB_SUBMISSIONS_LABELS=submission,pending-review
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x...
TURNSTILE_SECRET_KEY=0x...
```

说明：

- `GITHUB_SUBMISSIONS_LABELS` 建议至少包含 `submission,pending-review`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` 与 `TURNSTILE_SECRET_KEY` 需要成对配置
- 如果未配置 Turnstile，站点仍可运行，但不会启用额外的人机校验

## 本周开工顺序

1. 完成任务 1
2. 紧接着开始任务 2
3. 任务 2 验证通过后，再接任务 3

按这个顺序推进，二期会先把“能投稿”升级成“能审核并上线”，这才是最关键的运营闭环。
