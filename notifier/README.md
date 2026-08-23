# Hello Kitty Task-Done Notifier

DeepSeek Harness **动态插件**（`host.js` + `client.js`）。一轮对话收尾时：
- 右上角弹粉色卡片 + 播放「叮咚」音；
- 页面切走 → 系统通知 + 提示音（需授予通知权限）；
- **新增**：若本轮助手消息以 `?` / `？` 结尾（大模型提问），也弹窗 + 声音，提示「有个问题等你回答」。

## 加载（在 DSH 里作为动态插件）

1. 宿主端 `host.js`：监听 `agent/turn-stopping`，每轮收尾 `seq` 自增，并用 `harness.handle('get-notify', ...)` 暴露。
2. 客户端 `client.js`：每 700ms `host.call('get-notify')` 轮询。

在 Harness 的动态插件面板里分别粘贴/加载 `host.js` 与 `client.js` 即可。也可按 DSH 文档用 `cordis_define` 定义。

## 触发语义

- `agent/turn-stopping`：在一轮即将收尾时触发一次（区别于 `agent/status` 会在同一轮内多个步骤间来回翻转）。
- **提问判定**：取对话区（`[data-dsh-surface="conversation"]`）里最后一条助手消息正文（`[data-dsh-part="message-body"]`），去掉首尾空白后以 `?` / `？` 结尾即视为提问。建议与仓库根部的 `skin/`（甜心工作台·强化版）一起使用——这些语义锚点由皮肤中心适配器注入。

## 权限

浏览器通知需要用户授权（脚本会在首次手势时请求通知权限）。

## License

MIT
