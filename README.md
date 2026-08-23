# DeepSeek Harness · Hello Kitty Suite

一套给 DeepSeek Harness Web GUI 的粉色 Hello Kitty 主题 + 提醒插件合集。全部为纯资源 / 纯客户端扩展，不改动 Harness 应用本体，不注入远程代码。

## 包含

| 部件 | 路径 | 说明 |
| --- | --- | --- |
| 皮肤 · 甜心工作台·强化版 | `skin/` | Skin Center v2 用户皮肤（`hello-kitty-expressive`）。奶油粉/玫瑰粉浅色 + 深莓果暗色，侧栏角色装饰、输入框蝴蝶结、会话头字标与坐姿 Kitty 衬底等。 |
| 提醒插件 · Hello Kitty Task-Done Notifier | `notifier/` | 一轮对话收尾时右上角弹粉色卡片 + 「叮咚」音；页面切走则发系统通知。**新增：若本轮大模型以提问收尾，同样弹窗 + 声音，提示你回到当前对话回答。** |

## 安装皮肤

```sh
cd skin
node scripts/install.mjs
```

脚本会把皮肤复制到 `~/.dsh/skins/hello-kitty-expressive/`，并在「皮肤中心处于停用状态时」启用 `web-ui-skin-center`。随后重启 Harness，到 **设置 → 皮肤中心 → 甜心工作台·强化版 → 应用**。

卸载：`node scripts/uninstall.mjs`（可恢复移动，不删源码、不停用皮肤中心）。

校验：`node scripts/validate.mjs`（使用本机皮肤中心的真实 v2 校验器）。

## 安装 / 加载提醒插件

notifier 是 DSH **动态插件**（`host.js` + `client.js`）。在 Harness 里通过动态插件机制加载：

- 宿主端 `host.js`：监听 `agent/turn-stopping`，每轮收尾自增 `seq`，通过 `harness.handle('get-notify', ...)` 暴露给客户端。
- 客户端 `client.js`：每 700ms `host.call('get-notify')` 轮询，`seq` 增长后：
  - 页面可见 → 右上角粉色卡片 + 播放「叮咚」音；
  - 页面切走 → 系统通知 + 提示音（需授予通知权限）；
  - 最后一条助手消息以 `?` / `？` 结尾（提问）→ 显示「有个问题等你回答」并同样弹窗 + 声音。

### 触发提问检测的约定

提问检测依赖皮肤中心的语义锚点 `[data-dsh-surface="conversation"]` 与 `[data-dsh-part="message-body"]`（助手消息正文）。建议与 `skin/` 皮肤一起使用（皮肤中心启用后这些锚点由适配器注入）。

## 目录

```text
.
├── notifier/                 # Hello Kitty Task-Done Notifier（动态插件源码）
│   ├── host.js
│   └── client.js
└── skin/                     # 甜心工作台·强化版（Skin Center v2 皮肤包，自包含）
    ├── README.md
    ├── package.json
    ├── install.command / uninstall.command
    ├── scripts/install.mjs / uninstall.mjs / validate.mjs
    └── skin/hello-kitty-expressive/...
```

## License

MIT。角色素材由使用者提供，相关商标归其各自所有者所有；公开/商业分发前请阅读 `skin/skin/hello-kitty-expressive/NOTICE.md`。
