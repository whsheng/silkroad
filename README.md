# 丝绸之路贸易站

面向中国出海团队的工具导航站。当前架构以静态化发布为主，内容源存放在 `content/`，适合 GitHub + Vercel + Cloudflare 的免费部署组合。

## 当前状态

- [x] 多语言公开站底座
- [x] 静态内容结构与搜索索引
- [x] SEO 基础结构
- [x] `submit -> GitHub Issue` 最小投稿闭环
- [ ] 审核后台与自动合并流程
- [ ] 广告投放与运营位管理

## 内容管理

- 公共内容源：`content/`
- 旧数据导入脚本：`scripts/import-navdata.mjs`
- 内容校验：`pnpm content:validate`
- 搜索索引生成：`pnpm search:build`

## 投稿闭环配置

投稿页会调用站内 `/api/submissions`，再由服务端创建 GitHub Issue，不依赖外部数据库。

本地或 Vercel 需要设置以下环境变量：

```bash
GITHUB_SUBMISSIONS_REPO=owner/repo
GITHUB_SUBMISSIONS_TOKEN=github_pat_xxx
GITHUB_SUBMISSIONS_LABELS=submission,pending-review
```

说明：

- `GITHUB_SUBMISSIONS_REPO`：接收投稿 Issue 的 GitHub 仓库，格式为 `owner/repo`
- `GITHUB_SUBMISSIONS_TOKEN`：建议使用 Fine-grained PAT，至少授予目标仓库 `Issues: Read and write`
- `GITHUB_SUBMISSIONS_LABELS`：可选，多个 label 用逗号分隔；这些 label 需要在仓库中预先存在

## 常用命令

```bash
pnpm dev
pnpm content:prepare
pnpm typecheck
pnpm lint
pnpm build
```
