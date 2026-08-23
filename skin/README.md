# 甜心工作台·强化版

DeepSeek Harness 的 Skin Center v2 用户皮肤。它把已经确认的“主题强化版”设计拆成可安装资源包，不修改 Harness 应用本体，也不注入远程代码。

## 视觉内容

- 奶油白、贝壳粉与玫瑰粉的浅色主题；深莓果色的配套暗色主题
- 对话区低密度菱格、爱心与星星纹样
- 左侧栏角色装饰与品牌区头像覆盖
- 输入框右上角 CSS 蝴蝶结和右侧兔子杯装饰
- 保留运行态蓝色与成功、警告、错误语义色，避免影响开发状态判断
- 窄屏或低高度窗口会自动隐藏大型装饰，避免遮挡控件

## 安装

macOS 双击 `install.command`，或在终端进入本目录后运行：

```sh
node scripts/install.mjs
```

安装脚本会把纯资源皮肤复制到：

```text
~/.dsh/skins/hello-kitty-expressive/
```

如果本机已经安装皮肤中心但处于停用状态，脚本会先备份当前 profile 的 `cordis.patch.yml`，再把 `web-ui-skin-center` 改为启用。它不会自动替你选择皮肤。

随后重启 DeepSeek Harness，打开：

```text
设置 → 皮肤中心 → 甜心工作台·强化版 → 应用
```

若皮肤中心尚未安装，请先安装 `@linxin666/dsh-client-ui-skin-center`。社区皮肤本身遵循官方约定，仅为纯资产目录，不需要独立 Cordis 进程。

## 验证

```sh
npm run validate
```

校验会使用本机皮肤中心的真实 v2 校验器和 CSS 安全转换器，检查清单、作用域隔离、资源路径与用户目录册收录。

## 卸载

双击 `uninstall.command`，或运行：

```sh
node scripts/uninstall.mjs
```

卸载使用可恢复移动：皮肤会被移到 `~/.dsh/skins/.removed/`，不会永久删除，也不会停用皮肤中心或影响其他皮肤。

## 兼容性和边界

- 目标协议：Skin Center manifest v2 / semantic attrs v1
- 已针对本机 `@linxin666/dsh-client-ui-skin-center 0.2.9` 校验
- 角色装饰全部 `pointer-events: none`，不会截获点击
- 使用 `data-dsh-surface` / `data-dsh-part` 语义锚点，不依赖 CSS Modules 哈希类名
- 角色素材按个人使用场景交付；公开或商业分发前请阅读 `skin/hello-kitty-expressive/NOTICE.md`
