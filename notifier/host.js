// Hello Kitty Task-Done Notifier — Host half
// pluginId: hkdone-2 · packageId: pkg-4
//
// 触发语义：agent/turn-stopping 在「一轮对话即将收尾」时触发一次
// （区别于 agent/status，它会在同一轮内部的多个步骤之间来回翻转）。
// 每触发一次，seq 自增 1；客户端轮询 get-notify 读取 seq 判断是否有新的一轮完成。
return {
  apply(ctx) {
    let seq = 0;
    ctx.on('agent/turn-stopping', (payload) => {
      seq += 1;
    });
    harness.handle('get-notify', async () => ({ seq }));
  },
};
