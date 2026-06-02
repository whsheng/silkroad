# 工具目录巡检与发布工作流

本文档用于把当前工具库从“原始候选池”逐步整理成“可信公开目录”。

## 背景

当前 `content/tools/index.json` 中的大量条目来自批量导入：

- 并未做人工审核
- 一部分不是官网，而是聚合页或中间页
- 分类、市场、平台标签并不完全准确
- 描述和 SEO 文案也不应直接视为最终公开内容

因此，这批数据应视为候选池，而不是默认公开目录。

## 当前机制

工具条目新增了两组关键状态：

- `publicationStatus`
  - `candidate`：候选池，默认不公开
  - `published`：可公开展示
  - `hidden`：暂时隐藏
  - `rejected`：不再使用

- `auditStatus`
  - `unchecked`
  - `ok`
  - `redirected`
  - `dead`
  - `parked`
  - `aggregator`
  - `review_needed`

当前前台、搜索索引和统计默认只使用 `publicationStatus = published` 的条目。

## 巡检脚本

运行命令：

```bash
pnpm content:audit -- --limit 50
```

常用参数：

- `--limit 50`：只巡检前 50 条
- `--offset 50`：从第 51 条开始巡检
- `--include-published`：连已发布条目一起复查
- `--apply`：将低风险巡检结果回写到 `content/tools/index.json`

脚本输出：

- `reports/tool-audit-YYYY-MM-DD.json`
- `reports/tool-audit-YYYY-MM-DD.csv`

输出字段包括：

- `reachable`
- `httpStatus`
- `finalUrl`
- `finalDomain`
- `pageTitle`
- `auditStatus`
- `redirectChain`

当使用 `--apply` 时，脚本会回写这些低风险字段：

- `auditStatus`
- `lastCheckedAt`
- `finalUrl`
- `finalDomain`
- `pageTitle`

另外，如果一个已发布条目被巡检为以下状态之一：

- `dead`
- `parked`
- `aggregator`

脚本会自动将其 `publicationStatus` 改为 `hidden`，避免继续对外公开。

## 推荐处理顺序

### 第一步：先巡检，不回写

先跑一批候选条目，判断有多少属于：

- 死链
- 聚合页
- 停放域名
- 异常跳转
- 需要人工复核

### 第二步：优先整理高价值条目

不要试图一次处理 600 多条。

建议优先整理：

1. 首页未来想展示的 20 到 30 条
2. 核心分类页需要承接流量的条目
3. 明显是聚合页但实际有明确官网可替换的条目

### 第三步：确认后再公开

当一个条目满足以下条件时，再改为 `published`：

- 最终链接真实可访问
- 不是聚合页或中间页
- 站点名称准确
- 分类、市场、平台标签已确认
- 摘要与描述可公开使用

## 内容策略建议

当前阶段建议采用“少而准”的公开策略：

- 宁可只公开 30 到 50 条
- 也不要公开 600 多条低可信内容

因为对于真实用户和 SEO 来说：

- 少量可信目录胜过大批错误目录
- 错误外链、死链、错误分类会伤害整体站点质量判断

## 后续可继续做的自动化

本轮先完成“巡检 + 状态分层 + 前台过滤”。

后续可以再补：

- 自动回写 `auditStatus / finalUrl / finalDomain / lastCheckedAt`
- 聚合域名黑名单配置文件
- 发布候选清单生成器
- 人工审核后的批量发布脚本
