# 丝绸之路贸易站

面向中国出海团队的工具导航站，聚焦平台、市场、服务商与运营资源的筛选和整理。

## 项目结构

- 页面路由：`app/`
- 内容数据：`content/`
- 文案与多语言：`messages/`
- 内容加载与 SEO：`lib/`
- 数据处理脚本：`scripts/`

## 内容管理

- 公共内容源：`content/`
- 旧数据导入脚本：`scripts/import-navdata.mjs`
- 内容校验：`pnpm content:validate`
- 搜索索引生成：`pnpm search:build`

## 投稿工作流

当前投稿页走站内表单提交，服务端会将投稿转入 GitHub Issue 作为审核入口。

本地或 Vercel 需要设置以下环境变量：

```bash
GITHUB_SUBMISSIONS_REPO=owner/repo
GITHUB_SUBMISSIONS_TOKEN=github_pat_xxx
GITHUB_SUBMISSIONS_LABELS=submission,pending-review
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x...
TURNSTILE_SECRET_KEY=0x...
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXX
```

说明：

- `GITHUB_SUBMISSIONS_REPO`：接收投稿 Issue 的 GitHub 仓库，格式为 `owner/repo`
- `GITHUB_SUBMISSIONS_TOKEN`：建议使用 Fine-grained PAT，至少授予目标仓库 `Issues: Read and write`
- `GITHUB_SUBMISSIONS_LABELS`：可选，多个 label 用逗号分隔；这些 label 需要在仓库中预先存在
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`：Cloudflare Turnstile 站点公钥，配置后前台才会展示安全校验组件
- `TURNSTILE_SECRET_KEY`：Cloudflare Turnstile 服务端密钥，用于在 API 路由中调用 Siteverify 校验 token
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`：可选，配置后会加载 Google Analytics，并用于记录赞助位点击事件

推荐至少预置以下审核标签：

- `submission`
- `pending-review`
- `needs-info`
- `approved`
- `rejected`
- `published`

二期执行顺序与交付范围见：

- `docs/phase-2-execution-plan.md`

## 运行命令

```bash
pnpm dev
pnpm content:prepare
pnpm typecheck
pnpm lint
pnpm build
```

## 二期审核工具

将 GitHub Issue 转成工具草稿预览：

```bash
node scripts/generate-tool-from-issue.mjs --issue-file tmp/submission-123.md --issue-number 123
```

直接写入 `content/tools/index.json` 与 `content/categories/index.json`：

```bash
node scripts/generate-tool-from-issue.mjs --issue-file tmp/submission-123.md --issue-number 123 --apply
```

建议执行顺序：

1. 从 GitHub Issue 复制正文到本地 Markdown 文件
2. 先运行预览模式检查输出
3. 确认无误后加 `--apply`
4. 运行 `pnpm content:validate && pnpm build`

更新投稿 Issue 的审核状态：

```bash
node scripts/update-submission-issue-status.mjs --issue-number 123 --status approved
node scripts/update-submission-issue-status.mjs --issue-number 123 --status published
```

完整审核发布 SOP 见：

- `docs/submission-review-workflow.md`

## 广告位管理

当前广告 MVP 采用“原生赞助位”方式，不接入影响性能的第三方广告脚本。

- 广告位定义：`content/ads/placements.json`
- 广告内容定义：`content/ads/items.json`

字段规则：

- `status`: `reserved` 或 `active`
- `startDate` / `endDate`: `YYYY-MM-DD`，为空表示不限制
- `targetSlug`: `null` 表示作用于该类型的全部页面
- `targetUrl`: 站内链接可直接写成 `/submit` 这种相对路径，系统会自动补当前语言前缀

当前已支持的投放位：

- 首页：`home_hero_banner`
- 分类页：`category_top_banner`
- 专题页：`guide_inline_banner`

如果配置了 `NEXT_PUBLIC_GA_MEASUREMENT_ID`，广告点击会发送 `ad_click` 事件到 Google Analytics。
