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
```

说明：

- `GITHUB_SUBMISSIONS_REPO`：接收投稿 Issue 的 GitHub 仓库，格式为 `owner/repo`
- `GITHUB_SUBMISSIONS_TOKEN`：建议使用 Fine-grained PAT，至少授予目标仓库 `Issues: Read and write`
- `GITHUB_SUBMISSIONS_LABELS`：可选，多个 label 用逗号分隔；这些 label 需要在仓库中预先存在

## 运行命令

```bash
pnpm dev
pnpm content:prepare
pnpm typecheck
pnpm lint
pnpm build
```
