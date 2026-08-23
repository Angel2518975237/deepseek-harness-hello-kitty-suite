# 💗 DeepSeek Harness · Hello Kitty Suite

> 把 DeepSeek Harness 变成一座**甜度超标**的粉色工作台。
> 一套皮肤 + 一个提醒插件，纯资源 / 纯客户端扩展，不动 Harness 本体、不注入远程代码，即装即用。

![Sweetheart Workspace Expressive 效果图](docs/screenshots/preview.png)

<p align="center"><em>甜心工作台·强化版 —— 奶油粉 × 玫瑰粉 × 蝴蝶结，连角色都在陪你聊天。</em></p>

---

## ✨ 这是什么

一套给 [DeepSeek Harness](https://github.com/deepseek-ai) Web GUI 的 **Hello Kitty 主题套件**，包含两样东西：

| 部件 | 说明 |
| --- | --- |
| 🎀 **甜心工作台·强化版皮肤** | Skin Center v2 用户皮肤（`hello-kitty-expressive`）：奶油白/贝壳粉浅色 + 深莓果暗色双主题；会话头字标、输入框蝴蝶结、侧栏坐姿 Kitty、对话区菱格爱心纹样…… |
| 🔔 **Hello Kitty Task-Done Notifier** | 一轮对话收尾时右上角弹粉色卡片 + 「叮咚」音；页面切走则发系统通知。**大模型以提问收尾时同样提醒你回来回答。** |

---

## 🎀 皮肤 · 甜心工作台·强化版

- **双主题**：奶油白 · 贝壳粉 · 玫瑰粉（浅色）/ 深莓果色（暗色），亮暗自适配
- **角色装饰**：会话头顶部字标、侧栏坐姿 Kitty 衬底、输入框蝴蝶结 + 兔子杯
- **低密度纹样**：对话区菱格 · 爱心 · 星星
- **保留开发语义色**：成功 / 警告 / 错误、运行态蓝色全部保留，不影响状态判断
- **响应式友好**：窄屏 / 低窗口自动隐藏大型装饰，不遮挡控件
- **非侵入**：全部 `pointer-events: none`，不截获点击；只依赖皮肤中心语义锚点

![弹窗效果图](docs/screenshots/preview-toast.png)

<p align="center"><em>任务完成提醒 —— 「任务完成啦 ♪ 搞定！去看看吧」</em></p>

## 🔔 提醒插件 · Hello Kitty Task-Done Notifier

- 每轮对话收尾（`agent/turn-stopping`）右上角弹粉色卡片 + 「叮咚」音
- 页面切走 → 系统通知 + 提示音（需授权）
- **提问检测**：最后一条助手消息以 `?` / `？` 结尾时，提示 **「有个问题等你回答」** —— 提醒你回到当前对话回答
- 7×24 轮询（700ms），触发即提醒，绝不打扰其它任务

---

## 📦 安装

### 皮肤

```sh
cd skin
node scripts/install.mjs      # 复制到 ~/.dsh/skins/ 并启用皮肤中心
```

重启 Harness → **设置 → 皮肤中心 → 甜心工作台·强化版 → 应用**。

- 卸载：`node scripts/uninstall.mjs`（可恢复移动，不删源码、不停用皮肤中心）
- 校验：`node scripts/validate.mjs`（用本机皮肤中心真实 v2 校验器）

### 提醒插件

`notifier/` 是 DSH **动态插件**（`host.js` + `client.js`）。在 Harness 的动态插件面板加载即可；`agent/turn-stopping` → host 自增 `seq` → 客户端轮询触发。

> 提问检测依赖皮肤中心语义锚点 `[data-dsh-surface="conversation"]` / `[data-dsh-part="message-body"]`，建议与皮肤一起使用。

---

## 🗂 目录结构

```text
.
├── notifier/            # Hello Kitty Task-Done Notifier（动态插件源码）
│   ├── host.js
│   └── client.js
├── skin/                # 甜心工作台·强化版（Skin Center v2 皮肤包，自包含）
│   ├── README.md · package.json
│   ├── install.command / uninstall.command
│   ├── scripts/install.mjs / uninstall.mjs / validate.mjs
│   └── skin/hello-kitty-expressive/...
└── docs/screenshots/    # 效果截图
```

---

## 📄 License

[MIT](./LICENSE)。角色素材由使用者提供，相关商标归其各自所有者所有；公开 / 商业分发前请阅读 `skin/skin/hello-kitty-expressive/NOTICE.md`。
