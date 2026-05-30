# 运营专题内容系统改造方案

## 1. 目标

将当前 `content/guides/index.json` 的专题内容结构，逐步改造成更适合长期维护的“每个专题一个目录，每种语言一个 Markdown 文件”的内容系统。

这个改造的目标不是改变前台栏目名称，而是提升以下能力：

- 长文编辑体验
- 多语言内容维护
- SEO 内容扩展
- Git 版本管理可读性
- AI 辅助生成专题草稿的稳定性

## 2. 当前状态

当前专题内容集中在：

- `content/guides/index.json`

每个专题包含：

- `slug`
- `publishedAt`
- `updatedAt`
- 关联分类 / 市场 / 平台
- `zh-CN` 与 `en` 的标题、摘要、正文数组、SEO 字段

这种结构适合专题数量很少、正文较短的阶段，但不适合持续运营。

## 3. 推荐目录结构

建议改成：

```bash
content/guides/
  cross-border-stack/
    meta.json
    zh-CN.md
    en.md
  independent-site-launch/
    meta.json
    zh-CN.md
    en.md
```

## 4. 文件职责

### 4.1 `meta.json`

用于保存结构化字段，例如：

- `id`
- `slug`
- `sortOrder`
- `status`
- `publishedAt`
- `updatedAt`
- `featuredCategorySlugs`
- `featuredMarketSlugs`
- `featuredPlatformSlugs`
- `coverImage`

示例：

```json
{
  "id": "guide-cross-border-stack",
  "slug": "cross-border-stack",
  "sortOrder": 1,
  "status": "published",
  "publishedAt": "2026-05-29",
  "updatedAt": "2026-05-29",
  "featuredCategorySlugs": ["popular-platforms", "core-tools"],
  "featuredMarketSlugs": ["us", "eu"],
  "featuredPlatformSlugs": ["amazon", "independent-site"]
}
```

### 4.2 `zh-CN.md` / `en.md`

用于保存文章正文与该语言下的 SEO 信息。

示例：

```md
---
title: 中国出海团队的一期工具栈怎么搭
summary: 围绕平台、物流、支付、内容与 AI 工具，梳理适合中国团队的最小可行工具栈。
seoTitle: 中国出海团队一期工具栈搭建指南 | Silkroads Trade
seoDescription: 从平台、支付、履约、建站、内容与 AI 工具出发，梳理适合中国出海团队的一期工具栈。
---

## 这篇适合谁

...
```

## 5. 为什么不用继续用 JSON

JSON 方案的问题：

- 所有专题堆在同一个大文件里
- 长文编辑体验差
- 不方便插入标题层级、列表、引用、表格
- Git diff 可读性差
- 不适合让 AI 按篇稳定生成或修改

Markdown 方案的优势：

- 更适合长内容
- 编辑成本低
- 结构清晰
- Git diff 清晰
- 与 SEO 内容运营更匹配

## 6. Markdown 还是 MDX

建议第一阶段使用：

- `Markdown (.md)`

原因：

- 足够支撑专题正文
- 引入复杂度最低
- 不需要额外组件渲染约束

只有在后续确实需要在文章中插入页面组件时，再升级到：

- `MDX (.mdx)`

## 7. 多语言策略

建议规则：

- `zh-CN` 为主语言，必须存在
- `en` 为可选语言
- 英文内容质量不达标时，不强制生成英文专题页

这样可以避免为了“表面多语言完整”而生成低质量英文内容。

## 8. 渲染层建议

后续代码改造时，专题页加载逻辑建议如下：

1. 扫描 `content/guides/*/meta.json`
2. 读取元数据
3. 按当前 `locale` 读取对应 Markdown 文件
4. 解析 frontmatter
5. 渲染正文 HTML
6. 继续挂接相关分类、市场、平台链接

## 9. 校验规则建议

建议增加以下校验：

- `slug` 唯一
- `zh-CN.md` 必须存在
- 日期格式合法
- 关联的分类 / 市场 / 平台 slug 必须存在
- `title`、`summary`、`seoTitle`、`seoDescription` 不为空
- `status !== published` 的专题不生成公开页

## 10. 迁移策略

建议分三步迁移：

### 第一步

让系统同时兼容：

- 旧的 `content/guides/index.json`
- 新的目录化专题结构

### 第二步

将现有专题逐篇迁移为：

- `meta.json`
- `zh-CN.md`
- `en.md`

### 第三步

确认线上渲染、SEO 与内容一致后，再移除旧 `index.json`

## 11. AI 协作建议

为了让 Codex / Cursor / Claude Code 更稳定地产出专题草稿，建议未来每篇专题使用单独目录。

这样 AI 可以直接对单篇文章做：

- 新建
- 改写
- 翻译
- SEO 优化
- 扩写或压缩

而不会误伤整个大 JSON 文件。

## 12. 实施优先级

当前建议优先级：

1. 先优化首页信息表达
2. 再做专题内容系统重构

原因：

- 首页优化会直接影响线上用户理解
- 专题系统改造主要影响后台可维护性
