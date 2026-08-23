// Hello Kitty Task-Done Notifier — Client half
// pluginId: hkdone-2 · packageId: pkg-4
//
// 客户端每 700ms 轮询 host.call('get-notify')，发现 seq 增长（新的一轮完成）后：
//   - 页面可见  -> 右上角弹粉色卡片 + 播放「叮咚」音
//   - 页面切走  -> 触发系统通知 + 系统提示音（需要用户授予通知权限）
//
// 新增：如果本轮收尾时，最后一条助手消息是一个**提问**（以 ? / ？ 结尾），
// 也触发同样的弹窗 + 声音，并提示用户回到当前对话回答。
return {
  inject: ['timer'],
  apply(ctx) {
    styles.insert(`
.hellokitty-done-toast {
  position: fixed;
  top: 22px;
  right: 22px;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 320px;
  box-sizing: border-box;
  padding: 14px 18px 14px 16px;
  background: linear-gradient(135deg, #ffffff 0%, #fff0f6 55%, #ffe4ef 100%);
  border: 3px solid #ffb6c1;
  border-radius: 22px;
  box-shadow: 0 10px 28px rgba(255, 182, 193, 0.50), 0 2px 6px rgba(214, 107, 140, 0.12);
  pointer-events: none;
  font-family: system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  animation: hellokitty-done-in .5s cubic-bezier(.18, 1.25, .4, 1) both;
}
.hellokitty-done-toast.hk-hide {
  animation: hellokitty-done-out .4s ease both;
}
.hellokitty-done-toast .hk-bow {
  font-size: 34px;
  line-height: 1;
  filter: drop-shadow(0 2px 2px rgba(214, 107, 140, .25));
}
.hellokitty-done-toast .hk-body { display: flex; flex-direction: column; gap: 2px; }
.hellokitty-done-toast .hk-text { font-size: 16px; font-weight: 800; letter-spacing: .3px; color: #e0568c; }
.hellokitty-done-toast .hk-sub { font-size: 12px; font-weight: 600; color: #f4a6c0; }
@keyframes hellokitty-done-in {
  0%   { transform: translateX(130%) scale(.9); opacity: 0; }
  60%  { transform: translateX(-6%) scale(1.02); opacity: 1; }
  100% { transform: translateX(0) scale(1); opacity: 1; }
}
@keyframes hellokitty-done-out {
  to { opacity: 0; transform: translateY(-12px) scale(.96); }
}
`);

    let baseline = -1;
    let leaveTimer = null;
    let hideTimer = null;

    function playDingDong() {
      try {
        const AC = (typeof globalThis !== 'undefined' && (globalThis.AudioContext || globalThis.webkitAudioContext));
        if (!AC) return;
        const ac = new AC();
        const playNote = (freq, delay, dur, done) => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          const t0 = ac.currentTime + delay;
          gain.gain.setValueAtTime(0.0001, t0);
          gain.gain.linearRampToValueAtTime(0.22, t0 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
          osc.connect(gain);
          gain.connect(ac.destination);
          if (done) osc.onended = done;
          osc.start(t0);
          osc.stop(t0 + dur + 0.03);
        };
        playNote(1046.50, 0.00, 0.55);                        // ding (C6)
        playNote(880.00, 0.16, 0.40, () => { try { ac.close(); } catch (e) {} }); // dong (A5)
        playNote(659.25, 0.32, 0.60);                         // sweet tail (E5)
      } catch (e) { console.error('hellokitty audio', e); }
    }

    function requestPermission() {
      try {
        if (typeof Notification === 'undefined') return;
        if (Notification.permission === 'default' && typeof Notification.requestPermission === 'function') {
          Notification.requestPermission().catch(function () {});
        }
      } catch (e) {}
    }

    function bindPermissionOnGesture() {
      try {
        if (typeof document === 'undefined' || typeof Notification === 'undefined') return;
        if (Notification.permission !== 'default') return;
        const evs = ['pointerdown', 'keydown', 'click'];
        function once() {
          try { requestPermission(); } catch (e) {}
          for (const ev of evs) { try { document.removeEventListener(ev, once, true); } catch (e) {} }
        }
        for (const ev of evs) { document.addEventListener(ev, once, true); }
      } catch (e) {}
    }

    function isPageVisible() {
      try {
        if (typeof document !== 'undefined' && document.visibilityState) {
          return document.visibilityState === 'visible';
        }
        return true;
      } catch (e) { return true; }
    }

    // 判断最后一条助手消息是否为「提问」（正文以 ? / ？ 结尾）。
    // 语义锚点来自皮肤中心 —— [data-dsh-part="message-body"] 是助手消息正文。
    function detectQuestion() {
      try {
        if (typeof document === 'undefined') return false;
        const conv = document.querySelector('[data-dsh-surface="conversation"]');
        if (!conv) return false;
        const bodies = conv.querySelectorAll('[data-dsh-part="message-body"]');
        if (!bodies.length) return false;
        const text = (bodies[bodies.length - 1].textContent || '').trim();
        if (!text) return false;
        return /[?？]\s*$/.test(text);
      } catch (e) { return false; }
    }

    function fireSystemNotification(kind) {
      try {
        if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
        const title = kind === 'question'
          ? '\u{1F4AC} \u6709\u4E2A\u95EE\u9898\u7B49\u4F60\u56DE\u7B54'
          : '\u{1F380} \u4EFB\u52A1\u5B8C\u6210\u5566 \u266A';
        const body = kind === 'question'
          ? '\u56DE\u5230\u5F53\u524D\u5BF9\u8BDD\u56DE\u590D\u4E00\u4E0B\u5427\u3002'
          : '\u641E\u5B9A\uFF01\u5DF2\u4E3A\u4F60\u5B8C\u6210\u4EFB\u52A1\u3002';
        let n;
        try {
          n = new Notification(title, { body, tag: 'hellokitty-done' });
        } catch (err) { return; }
        const timer = ctx.timeout(function () { try { n.close(); } catch (e) {} }, 5000);
        n.onclick = function () { try { n.close(); } catch (e) {} };
      } catch (e) { /* not available */ }
    }

    function ToastRoot(props) {
      const [state, setState] = React.useState({ visible: false, leaving: false, kind: 'done' });

      React.useEffect(() => {
        let stopped = false;
        const disposer = ctx.interval(async () => {
          if (stopped) return;
          try {
            const res = await host.call('get-notify', {});
            if (!res || typeof res.seq !== 'number') return;
            if (baseline < 0) { baseline = res.seq; return; }
            if (res.seq > baseline) {
              baseline = res.seq;
              const kind = detectQuestion() ? 'question' : 'done';
              if (isPageVisible()) {
                setState({ visible: true, leaving: false, kind });
                playDingDong();
                if (leaveTimer) leaveTimer();
                if (hideTimer) hideTimer();
                leaveTimer = ctx.timeout(() => setState((s) => ({ ...s, leaving: true })), 3400);
                hideTimer = ctx.timeout(() => setState({ visible: false, leaving: false, kind }), 3850);
              } else {
                fireSystemNotification(kind);
              }
            }
          } catch (e) { /* ignore */ }
        }, 700);
        return () => { stopped = true; disposer(); };
      }, []);

      if (!state.visible) return null;
      const title = state.kind === 'question'
        ? '\u6709\u4E2A\u95EE\u9898\u7B49\u4F60\u56DE\u7B54'
        : '\u4EFB\u52A1\u5B8C\u6210\u5566 \u266A';
      const sub = state.kind === 'question'
        ? '\u56DE\u5230\u5F53\u524D\u5BF9\u8BDD\u56DE\u590D\u4E00\u4E0B\u5427'
        : '\u641E\u5B9A\uFF01\u53BB\u770B\u770B\u5427';
      return React.createElement('div', { className: 'hellokitty-done-toast' + (state.leaving ? ' hk-hide' : '') },
        React.createElement('span', { className: 'hk-bow' }, state.kind === 'question' ? '\u{1F4AC}' : '\u{1F380}'),
        React.createElement('div', { className: 'hk-body' },
          React.createElement('div', { className: 'hk-text' }, title),
          React.createElement('div', { className: 'hk-sub' }, sub),
        ),
      );
    }

    requestPermission();
    bindPermissionOnGesture();

    const slots = ctx.get('slots');
    if (slots === undefined) return;
    slots.inject('shell.overlay', () => slots.register(
      { name: 'shell.overlay', id: 'hellokitty-done' },
      () => React.createElement(ToastRoot),
    ));
  },
};
