# 春日手语园 · A Spring Garden of Signs

> 北京大学爱心社手语分社 · 春日手语文化节 · MMXXVI

一个**手语换装小游戏**：玩家阅读手语动作示意图（不显示文字释义），猜出对应的服装，给主角「手小语」从头到脚搭配一身春装；之后可以在展示墙看到和自己穿一样的同学，在留言区贴一张春日小纸条。

整站是**静态前端 + 单文件 Node 服务**，零依赖、零构建步骤。当前部署在以手予爱服务器，通过 Nginx 子路径提供 HTTPS 访问。

**正式入口**：[2026 手语文化节](https://shouyulove.cn/2026-sign-language-cultural-festival/) · [心创组作品集](https://shouyulove.cn/portfolio/) · [以手予爱主站](https://shouyulove.cn/)

**设计者**：周丽敏 涂增基 黄庭逸

🌸 **GitHub**：<https://github.com/tuzengji/Sign-Language-Cultura-Festival>

---

## 玩法

| | |
|---|---|
| **首页** | 起一个昵称、选你的 MBTI（每个维度可选「未知」），系统会按注册顺序分配 `#001`、`#002`…的 UID |
| **试衣间** | 左侧手语卡片三个类别（上衣 / 下装 / 鞋子），点开任一类别，对应的 4 件服装 PNG 会从立绘两侧浮现 |
| **展示墙** | 顶部有你当前造型的大立绘 + 身份卡；下方是同造型同学列表 + 「看看其他人的春装」缩略图墙 |
| **留言区** | 春日便利贴风格的 140 字短留言；可以给别人的留言送 ✿ 一朵花，每人对每条留言只送一次 |

四个 panel 通过顶部调色带 tab 切换（hash 路由 `#/home`、`#/dressing`、`#/wall`、`#/board`）。

---

## 技术栈

- **前端**：原生 HTML + CSS + JS，单文件 IIFE，无框架、无构建
- **后端**：Node 内置模块（`node:http` / `node:fs` / `node:crypto`），不需要 `npm install`
- **存储**：四个 jsonl 文件（`users` / `outfits` / `messages` / `flowers`），文本可读、可备份
- **风格**：Riso-print 春日绘本风 — 霞鹜文楷 + Fraunces 衬线、硬边阴影 + 软地面阴影、纸纤维网点纹理、便利贴
- **MBTI 配色**：NT 🟣 紫 · NF 🟢 绿 · SJ 🔵 蓝 · SP 🟡 黄 · 未知绿

---

## 本地开发

```bash
# 启动 (默认 8080)
node server/server.mjs

# 自定义端口
PORT=8088 node server/server.mjs

# 健康检查
curl http://localhost:8080/api/health
```

需要 **Node 18+**。无需 `package.json` 或构建工具。修改后运行 `node --check game.js`、`node --check server/server.mjs` 和 `python3 tests/smoke.py`，再用浏览器检查桌面与手机。冒烟检查使用临时数据目录，不改动历史玩家数据。

### 数据与本地预览

默认本地运行使用 `server/data/`，该目录保存既有玩家记录。需要空数据预览时，使用独立目录并关闭示例数据：

```bash
HOST=127.0.0.1 PORT=8088 DATA_DIR=/tmp/sign-festival-preview SEED=off node server/server.mjs
```

未设置 `SEED=off` 且数据为空时会注入 20 个示例玩家与 16 条示例留言；正式服务固定 `SEED=off`，不会注入模拟记录。不要用重置或强制注入命令处理正式数据。

## 早期校园网部署

项目最初支持 Windows + PKU 校园网 IPv6，`start-server.bat` 仍可用于本地启动。当前正式入口与维护流程见本文「以手予爱正式部署」；单独的 Python 静态服务不能提供注册、穿搭和留言 API。

---

## API 简表

```
GET  /api/health
POST /api/users/check         { nickname }                       → 检测重名 + 给替代建议
POST /api/users               { uid, nickname, mbti }            → 注册（409 表示重名）
GET  /api/users/me?uid=...                                       → 刷新页面后回填身份
POST /api/outfits             { uid, nickname, t, b, s, mbti }   → 一个 uid 全局只保留最新一身
GET  /api/outfits?t&b&s                                          → 同造型名单
GET  /api/outfits/recent?limit&exclude&excludeUid                → 其他人的造型缩略图列表
GET  /api/messages?limit&since&uid
POST /api/messages            { uid, body }                      → 1–140 字
POST /api/messages/:id/flower { uid }                            → 送花，幂等
```

每 IP 30 POST/分钟限流。

---

## 文件结构

```
.
├─ index.html               入口 + 四个 panel
├─ styles.css               所有样式
├─ game.js                  状态机 + 路由 + UI 接线
├─ start-server.bat         Windows 双击启动
├─ assets/
│  ├─ characters/           86 张换装立绘（{top}{bottom}{shoe}.png）+ start.png
│  ├─ items/                12 张独立服装图（top/bottom/shoe-1..4.png）
│  └─ signs/                手语动作示意卡
└─ server/
   ├─ server.mjs            零依赖 Node 服务
   └─ data/                 jsonl 持久化（gitignored）
```

---

## 致谢

- 项目开发：北京大学爱心社手语分社
- 立绘 / 服装 / 手语示意图：分社志愿者手绘
- 字体：[霞鹜文楷](https://github.com/lxgw/LxgwWenKai) / [Fraunces](https://fraun.ces/)

✿ 春日特辑 · MMXXVI

## 以手予爱正式部署（2026-10-11）

- 正式入口：https://shouyulove.cn/2026-sign-language-cultural-festival/
- 设计者：周丽敏 涂增基 黄庭逸
- 说明：服务于 2026 年手语文化节的小游戏网页～
- Node 通过 Nginx 子路径反向代理，前端使用相对 API 地址；保留本地根路径启动方式。
- 服务 `sign-language-festival.service`，只监听 `127.0.0.1:8041`；发布目录 `/opt/sign-language-festival/current`。
- `DATA_DIR=/var/lib/sign-language-festival` 保存玩家数据，独立于代码发布；正式环境 `SEED=off`，不自动加入模拟玩家。
- 仅在回环监听且前置 Nginx 覆盖 `X-Real-IP` 时设置 `TRUST_PROXY=1`，让限流按真实访客计算。
- 发布白名单：`index.html`、`styles.css`、`game.js`、`assets/` 图片与 `server/server.mjs`。历史玩家数据、文档及开发文件不发布。
- 静态服务只允许页面、脚本、样式和图片，禁止下载服务源码与数据文件。
- 配置在 `deploy/`。回滚时将 `current` 切回保留的版本并重启本服务；数据目录不随版本切换。

### 日常查看

```bash
curl https://shouyulove.cn/2026-sign-language-cultural-festival/api/health
ssh ubuntu@49.232.193.175 'systemctl status sign-language-festival --no-pager'
ssh ubuntu@49.232.193.175 'sudo journalctl -u sign-language-festival -n 50 --no-pager'
```

2026-10-11 首次发布目录：`/opt/sign-language-festival/releases/20261011T140000Z`；`current` 指向该版本。服务使用 systemd DynamicUser 与 StateDirectory，进程故障自动重启、随系统启动。Nginx 配置为 `/etc/nginx/snippets/sign-language-festival.conf`，只新增本项目子路径。

### 更新与回滚

1. 修改后通过语法、隔离 API 和桌面／手机浏览器检查。前端 API 必须使用相对地址 `api/...`，保持子路径兼容。
2. 将运行白名单打包到新的版本目录，核对文件清单与 SHA-256；文档、测试、历史数据、`output/` 和 Git 元数据均不进入线上目录。
3. 记录当前 `current` 指向和相关 Nginx 配置。用临时符号链接原子切换 `current`，仅重启 `sign-language-festival`；只有修改 Nginx 配置时才在 `nginx -t` 通过后重载 Nginx。
4. 核验正式页面、健康接口、注册／换装／留言功能与主站入口；实际功能写入测试应在独立测试数据中完成。失败时切回记录的旧版本并重启本服务，保留 `/var/lib/sign-language-festival`。
5. 将审查后的源码和公开说明提交推送到 `tuzengji/Sign-Language-Cultura-Festival`。本地维护目录没有 `.git`；本次使用 `output/deployment/festival-20261011/repo/` 独立克隆同步 GitHub。不要整体上传维护目录。

本次运行清单、发布脚本和验证记录保存在 `output/deployment/festival-20261011/`。其中 `publish.py` 只用于首次安装，包含「服务尚不存在」检查，不能当成日常更新命令重复执行。

主站文案来源为 `/Users/wishingcat/ObsidianNotes/AI Study/爱心社/心创组主站-以手予爱.md`；修改作品名称、简介、署名或入口后，还需在主站项目重新构建、推送并部署。
