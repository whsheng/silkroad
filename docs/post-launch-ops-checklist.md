# 上线后补配置与运营动作清单

适用范围：

- 当前已上线的 `silkroads.trade` / `www.silkroads.trade`
- 当前技术栈：GitHub + Vercel + Cloudflare
- 当前内容与投稿流程：站内表单 -> GitHub Issue -> 人工审核 -> 合并发布

使用方式：

- 按顺序执行，优先完成“必须先做”
- 完成一项就手动勾选
- 如果后续主域、分析工具或广告方案变化，再更新本文档

## 必须先做

- [x] 轮换 `GITHUB_SUBMISSIONS_TOKEN`
  - 原因：该 PAT 曾经明文暴露，应按“已泄露”处理
  - 操作：在 GitHub 撤销旧 token，重新创建 Fine-grained PAT
  - 权限：仅授予 `whsheng/silkroads-submissions` 仓库，且仅保留 `Issues: Read and write`
  - 完成后：将新 token 回填到 Vercel，并重新部署

- [x] 确定正式主域：`https://www.silkroads.trade`
  - 当前代码已切换到 `https://www.silkroads.trade`
  - 相关文件：
    - `lib/seo/site.ts`
    - `app/sitemap.ts`
    - `app/robots.ts`

- [x] 将非主域 `https://silkroads.trade` 做 301 跳转到 `https://www.silkroads.trade`
  - 目标：避免 SEO 权重分散、重复收录、canonical 混乱

- [x] 代码中已同步修正 `siteUrl`
  - 说明：canonical / sitemap / robots 现在应统一输出 `https://www.silkroads.trade`

## Vercel 清单

- [x] 确认当前线上项目就是 `silkroads`
- [x] 确认 Production Branch 为 `main`

- [ ] 在 `Project -> Settings -> Environment Variables` 中确认以下变量
  - [x] `GITHUB_SUBMISSIONS_REPO`
  - [x] `GITHUB_SUBMISSIONS_TOKEN`
  - [x] `GITHUB_SUBMISSIONS_LABELS`
  - [x] `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - [x] `TURNSTILE_SECRET_KEY`
  - [x] `NEXT_PUBLIC_GA_MEASUREMENT_ID`

- [x] 检查 Turnstile 是否成对配置
  - 要求：`NEXT_PUBLIC_TURNSTILE_SITE_KEY` 和 `TURNSTILE_SECRET_KEY` 要么都配置，要么都不配置
  - 风险：只配一个会导致投稿流程异常

- [ ] 如果预览环境也要测试投稿，将同样变量补到 `Preview`

- [ ] 每次修改环境变量后，手动执行一次 Redeploy

- [ ] 上线后检查 Functions 日志
  - 重点关注：`/api/submissions`
  - 留意状态码：`400`、`422`、`502`、`503`

## Cloudflare 清单

- [ ] 核对 DNS 配置
  - [ ] `www` 已正确指向 Vercel
  - [ ] apex 根域已正确指向 Vercel

- [ ] 将 SSL/TLS 模式设为 `Full (strict)`
  - 不要使用 `Flexible`

- [x] 如果启用 Turnstile，检查 Cloudflare Turnstile 后台配置
  - [x] 已创建 site key
  - [x] 已创建 secret key
  - [x] 已把实际访问域名加入 allowed hostnames
  - [x] 如果短期内 `www` 和 apex 都可访问，则两个都加

- [ ] 检查缓存规则
  - [ ] 不要对整站粗暴开启 `Cache Everything`
  - [ ] 确保 `/api/submissions` 不被缓存

- [ ] Bot 防护策略先保守
  - [ ] 如启用 Bot Fight Mode，先观察真实流量和误杀情况
  - [ ] 不建议在未验证前直接上过强规则

- [ ] 主域切换完成后，重新验证以下项目
  - [ ] HTTPS 正常
  - [ ] 301 跳转正确
  - [ ] 缓存未误伤动态接口

## GitHub 清单

- [x] 在 `whsheng/silkroads-submissions` 仓库预置以下 labels
  - [x] `submission`
  - [x] `pending-review`
  - [x] `needs-info`
  - [x] `approved`
  - [x] `rejected`
  - [x] `published`

- [ ] 确认投稿 PAT 只授权给 `whsheng/silkroads-submissions`
  - 不要授予主站仓库额外权限

- [ ] 给主站仓库的 `main` 分支开启基础保护
  - 至少避免误 force push
  - 是否强制 PR，可按后续协作方式决定

- [ ] 按现有 SOP 运转投稿审核
  - 参考文档：`docs/submission-review-workflow.md`

## SEO 与搜索引擎

- [x] 在 Google Search Console 添加正式主域属性

- [x] 提交 sitemap
  - 地址必须与最终主域一致
  - 当前应提交：`https://www.silkroads.trade/sitemap.xml`

- [ ] 首周观察 Search Console
  - [ ] 是否开始收录
  - [ ] 是否出现重复主域
  - [ ] 是否出现抓取异常

- [ ] 可选：提交 Bing Webmaster Tools

## 日常运营动作

- [ ] 每周清理一次投稿 Issue 队列
  - 建议节奏：`pending-review -> approved / needs-info / rejected -> published`

- [ ] 审核通过后，按现有脚本生成内容草稿并发布
  - 相关文档：`docs/submission-review-workflow.md`

- [ ] 若开始销售广告，先补内部规则
  - [ ] 广告位说明
  - [ ] 投放周期
  - [ ] 价格口径
  - [ ] 是否接受竞品
  - [ ] UTM 命名规范

- [x] 如果配置了 `NEXT_PUBLIC_GA_MEASUREMENT_ID`
  - [x] 检查 GA 是否已正常收集基础 PV
  - [ ] 检查赞助位点击事件 `ad_click` 是否已上报

## 当前代码已依赖的关键项

- 投稿 GitHub Issue 依赖：
  - `GITHUB_SUBMISSIONS_REPO`
  - `GITHUB_SUBMISSIONS_TOKEN`
  - `GITHUB_SUBMISSIONS_LABELS`

- Turnstile 依赖：
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - `TURNSTILE_SECRET_KEY`

- Google Analytics 依赖：
  - `NEXT_PUBLIC_GA_MEASUREMENT_ID`

## 相关文件

- `README.md`
- `lib/seo/site.ts`
- `app/sitemap.ts`
- `app/robots.ts`
- `app/api/submissions/route.ts`
- `lib/submissions/server.ts`
- `docs/submission-review-workflow.md`

## 建议执行顺序

1. 轮换 GitHub PAT
2. 在 Cloudflare / Vercel 完成主域跳转与证书校验
3. 在 Vercel 补齐并核对环境变量
4. 验证投稿接口与 Turnstile
5. 提交 Google Search Console sitemap
6. 补齐 GitHub labels 与 branch protection
7. 建立每周投稿审核与发布节奏

## 官方文档

- Vercel Environment Variables
  - https://vercel.com/docs/environment-variables

- Vercel Project Settings
  - https://vercel.com/docs/project-configuration/project-settings

- Cloudflare Turnstile
  - https://developers.cloudflare.com/turnstile/get-started/

- Cloudflare SSL Full (strict)
  - https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/

- Cloudflare Cache Rules
  - https://developers.cloudflare.com/cache/how-to/cache-rules/settings/

- Cloudflare Bot Fight Mode
  - https://developers.cloudflare.com/bots/get-started/bot-fight-mode/

- GitHub Create an Issue API
  - https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#create-an-issue

- Google Search Console Sitemap
  - https://support.google.com/webmasters/answer/7451001?hl=en
