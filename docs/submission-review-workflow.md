# 投稿审核与发布工作流

本文档定义二期投稿内容从进入 GitHub Issue 到正式上线的标准流程。

适用范围：

- 站内投稿表单提交的新站点
- 进入 `whsheng/silkroads-submissions` 的审核 Issue
- 最终需要发布到 `silkroads.trade` 主仓库的工具条目

## 目标

这套流程要解决 4 个问题：

- 投稿进入后，审核状态怎么流转
- 审核通过后，如何生成标准化内容草稿
- 草稿如何以 PR 方式进入主仓库
- 发布完成后，如何回写 Issue 状态，形成闭环

## 审核状态标签

建议在投稿仓库中预置以下标签：

- `submission`
- `pending-review`
- `needs-info`
- `approved`
- `rejected`
- `published`

规则：

- 每个投稿 Issue 始终保留 `submission`
- 审核状态标签同一时刻只保留一个
- 初始状态为 `pending-review`

状态含义：

- `pending-review`：已收到投稿，等待人工审核
- `needs-info`：信息不足，需要补充
- `approved`：已确认收录，准备生成内容草稿
- `rejected`：不收录或不相关
- `published`：已合并到主仓库并完成上线

## 标准流程

### 1. 初审

检查项：

- 链接是否可访问
- 是否与中国出海贸易相关
- 是否和现有收录重复
- 分类、市场、平台建议是否基本合理
- 描述是否能支持生成公开条目

如果缺失关键信息：

- 将 Issue 从 `pending-review` 改为 `needs-info`
- 在 Issue 中留言说明缺什么

命令示例：

```bash
node scripts/update-submission-issue-status.mjs --issue-number 123 --status needs-info
```

### 2. 审核通过

当站点确认可收录时：

- 将 Issue 状态改为 `approved`
- 保留原始投稿信息，作为内容来源记录

命令示例：

```bash
node scripts/update-submission-issue-status.mjs --issue-number 123 --status approved
```

### 3. 生成内容草稿

从 GitHub Issue 复制正文到本地文件，例如：

```bash
tmp/submission-123.md
```

先预览生成结果：

```bash
node scripts/generate-tool-from-issue.mjs --issue-file tmp/submission-123.md --issue-number 123
```

确认无误后写入内容文件：

```bash
node scripts/generate-tool-from-issue.mjs --issue-file tmp/submission-123.md --issue-number 123 --apply
```

此步骤会更新：

- `content/tools/index.json`
- `content/categories/index.json`

生成记录默认会写入：

- `sourceIssueNumber`
- `reviewStatus`
- `reviewedAt`

## 4. 提交 PR

建议新建分支，例如：

```bash
git checkout -b chore/publish-submission-123
```

然后执行：

```bash
pnpm content:validate
pnpm build
git add content/tools/index.json content/categories/index.json
git commit -m "Publish submission #123"
git push origin chore/publish-submission-123
```

PR 需要包含：

- 来源 Issue 编号
- 本次新增条目的 slug
- 是否同步更新了分类索引
- 校验与构建结果

仓库内已提供 PR 模板：

- `.github/pull_request_template.md`

### 5. 合并与上线

合并到 `main` 后：

- GitHub 记录合并历史
- Vercel 自动重新部署
- Cloudflare 继续分发已部署内容

默认不需要人工重新发布。

### 6. 回写 Issue 状态

PR 合并后，将投稿 Issue 改为 `published`。

命令示例：

```bash
node scripts/update-submission-issue-status.mjs --issue-number 123 --status published
```

如果需要补充一条说明，可追加：

```bash
node scripts/update-submission-issue-status.mjs --issue-number 123 --status published --comment "Published in silkroads.trade and queued for Vercel deployment."
```

## 发布前检查清单

- Issue 标签已从 `pending-review` 进入正确状态
- 域名未与现有内容重复
- `content/tools/index.json` 新条目字段完整
- `content/categories/index.json` 已同步加入对应 slug
- `pnpm content:validate` 通过
- `pnpm build` 通过

## 发布后检查清单

- PR 已合并到 `main`
- Vercel 部署成功
- 投稿 Issue 已切换为 `published`
- 如有需要，在 Issue 中补充公开链接

## 当前边界

这套流程当前仍是“轻运营工具流”，不是完整后台系统。

当前不做：

- 审核后台 UI
- 数据库驱动的运营状态管理
- 自动从 GitHub Issue 拉取正文并直接提交 PR

当投稿量明显上升后，再考虑把这套流程升级成自动化更高的审核后台。
