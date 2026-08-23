// Hello Kitty Task-Done Notifier — Host half (compiled DSH plugin)
// Serves a tiny JSON endpoint the client polls. `seq` ticks once per
// `agent/turn-stopping`, so the client knows a turn just finished
// (and can then decide "task done" vs "model asked a question" from the DOM).
export const name = 'hello-kitty-notifier';

/** Required host services. */
export const inject = ['webServer'];

export function apply(ctx) {
  let seq = 0;

  // A turn is about to close (model owes no response): one tick.
  ctx.on('agent/turn-stopping', () => {
    seq += 1;
  });

  // Client polls this endpoint every 700ms.
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/api/hellokitty-notify',
    handler: (req, res) => {
      res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      res.end(JSON.stringify({ seq }));
    },
  }));
}
