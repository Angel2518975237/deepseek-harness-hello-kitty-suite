window.__ModuleLoader__.load({ id: "deepseek-harness-hello-kitty-suite", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
"use strict";
// Hello Kitty Task-Done Notifier — Client half (compiled DSH plugin).
// Polls /api/hellokitty-notify every 700ms; when `seq` ticks (a turn ended),
//   - page visible  -> pink card + chime
//   - page hidden   -> system notification + chime
//   - final assistant message ends with ? / ？ -> "你有个问题等你回答" prompt.
var React = require("react");

var TOAST_ID = "hello-kitty-notifier-style";
function injectCss() {
  try {
    if (typeof document === "undefined") return;
    if (document.getElementById(TOAST_ID)) return;
    var style = document.createElement("style");
    style.id = TOAST_ID;
    style.textContent = `
.hellokitty-done-toast{position:fixed;top:22px;right:22px;z-index:2147483000;display:flex;align-items:center;gap:12px;max-width:320px;box-sizing:border-box;padding:14px 18px 14px 16px;background:linear-gradient(135deg,#ffffff 0%,#fff0f6 55%,#ffe4ef 100%);border:3px solid #ffb6c1;border-radius:22px;box-shadow:0 10px 28px rgba(255,182,193,.50),0 2px 6px rgba(214,107,140,.12);pointer-events:none;font-family:system-ui,-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;animation:hellokitty-done-in .5s cubic-bezier(.18,1.25,.4,1) both;}
.hellokitty-done-toast.hk-hide{animation:hellokitty-done-out .4s ease both;}
.hellokitty-done-toast .hk-bow{font-size:34px;line-height:1;filter:drop-shadow(0 2px 2px rgba(214,107,140,.25));}
.hellokitty-done-toast .hk-body{display:flex;flex-direction:column;gap:2px;}
.hellokitty-done-toast .hk-text{font-size:16px;font-weight:800;letter-spacing:.3px;color:#e0568c;}
.hellokitty-done-toast .hk-sub{font-size:12px;font-weight:600;color:#f4a6c0;}
@keyframes hellokitty-done-in{0%{transform:translateX(130%) scale(.9);opacity:0;}60%{transform:translateX(-6%) scale(1.02);opacity:1;}100%{transform:translateX(0) scale(1);opacity:1;}}
@keyframes hellokitty-done-out{to{opacity:0;transform:translateY(-12px) scale(.96);}}
`;
    (document.head || document.documentElement).appendChild(style);
  } catch (e) { /* ignore */ }
}

function playDingDong() {
  try {
    var AC = (typeof globalThis !== 'undefined' && (globalThis.AudioContext || globalThis.webkitAudioContext));
    if (!AC) return;
    var ac = new AC();
    var playNote = function (freq, delay, dur, done) {
      var osc = ac.createOscillator();
      var gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      var t0 = ac.currentTime + delay;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(0.22, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(ac.destination);
      if (done) osc.onended = done;
      osc.start(t0);
      osc.stop(t0 + dur + 0.03);
    };
    playNote(1046.50, 0.00, 0.55);
    playNote(880.00, 0.16, 0.40, function () { try { ac.close(); } catch (e) {} });
    playNote(659.25, 0.32, 0.60);
  } catch (e) { try { console.error('hellokitty audio', e); } catch (e2) {} }
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
    var evs = ['pointerdown', 'keydown', 'click'];
    function once() {
      try { requestPermission(); } catch (e) {}
      for (var i = 0; i < evs.length; i++) { try { document.removeEventListener(evs[i], once, true); } catch (e) {} }
    }
    for (var i = 0; i < evs.length; i++) { try { document.addEventListener(evs[i], once, true); } catch (e) {} }
  } catch (e) {}
}
function isPageVisible() {
  try {
    if (typeof document !== 'undefined' && document.visibilityState) return document.visibilityState === 'visible';
    return true;
  } catch (e) { return true; }
}
// Last assistant message body ends with ? / ？ -> treat as the model asking a question.
function detectQuestion() {
  try {
    if (typeof document === 'undefined') return false;
    var conv = document.querySelector('[data-dsh-surface="conversation"]');
    if (!conv) return false;
    var bodies = conv.querySelectorAll('[data-dsh-part="message-body"]');
    if (!bodies.length) return false;
    var text = (bodies[bodies.length - 1].textContent || '').trim();
    if (!text) return false;
    return /[?？]\s*$/.test(text);
  } catch (e) { return false; }
}
function notifySystem(kind) {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    var title = kind === 'question'
      ? '\u{1F4AC} \u6709\u4E2A\u95EE\u9898\u7B49\u4F60\u56DE\u7B54'
      : '\u{1F380} \u4EFB\u52A1\u5B8C\u6210\u5566 \u266A';
    var body = kind === 'question'
      ? '\u56DE\u5230\u5F53\u524D\u5BF9\u8BDD\u56DE\u590D\u4E00\u4E0B\u5427\u3002'
      : '\u641E\u5B9A\uFF01\u5DF2\u4E3A\u4F60\u5B8C\u6210\u4EFB\u52A1\u3002';
    var n;
    try { n = new Notification(title, { body: body, tag: 'hellokitty-done' }); } catch (err) { return; }
    setTimeout(function () { try { n.close(); } catch (e) {} }, 5000);
    n.onclick = function () { try { n.close(); } catch (e) {} };
  } catch (e) {}
}

function apply(ctx) {
  injectCss();
  var baseline = -1;
  var leaveTimer = null;
  var hideTimer = null;
  var state = { visible: false, leaving: false, kind: 'done' };

  function show(kind) {
    var self = ctx;
    state = { visible: true, leaving: false, kind: kind };
    playDingDong();
    if (leaveTimer) leaveTimer();
    if (hideTimer) hideTimer();
    leaveTimer = ctx.timeout(function () { state = { visible: true, leaving: true, kind: kind }; render(); }, 1600);
    hideTimer = ctx.timeout(function () { state = { visible: false, leaving: false, kind: kind }; render(); }, 2000);
    render();
  }

  // The slot registry renders <ToastRoot>; it re-renders through this publisher.
  var subs = [];
  function render() { for (var i = 0; i < subs.length; i++) subs[i](); }

  function ToastRoot() {
    React.useEffect(function () { subs.push(force); return function () { subs = subs.filter(function (s) { return s !== force; }); }; }, []);
    var force = React.useState(0)[1];
    if (!state.visible) return null;
    var title = state.kind === 'question'
      ? '\u6709\u4E2A\u95EE\u9898\u7B49\u4F60\u56DE\u7B54'
      : '\u4EFB\u52A1\u5B8C\u6210\u5566 \u266A';
    var sub = state.kind === 'question'
      ? '\u56DE\u5230\u5F53\u524D\u5BF9\u8BDD\u56DE\u590D\u4E00\u4E0B\u5427'
      : '\u641E\u5B9A\uFF01\u53BB\u770B\u770B\u5427';
    return React.createElement('div', { className: 'hellokitty-done-toast' + (state.leaving ? ' hk-hide' : '') },
      React.createElement('span', { className: 'hk-bow' }, state.kind === 'question' ? '\u{1F4AC}' : '\u{1F380}'),
      React.createElement('div', { className: 'hk-body' },
        React.createElement('div', { className: 'hk-text' }, title),
        React.createElement('div', { className: 'hk-sub' }, sub)
      )
    );
  }

  requestPermission();
  bindPermissionOnGesture();

  var undoInterval = ctx.interval(async function () {
    try {
      var res = await fetch('/api/hellokitty-notify', { cache: 'no-store' });
      if (!res.ok) return;
      var data = await res.json();
      if (!data || typeof data.seq !== 'number') return;
      if (baseline < 0) { baseline = data.seq; return; }
      if (data.seq > baseline) {
        baseline = data.seq;
        var kind = detectQuestion() ? 'question' : 'done';
        if (isPageVisible()) show(kind);
        else notifySystem(kind);
      }
    } catch (e) { /* ignore */ }
  }, 700);

  ctx.effect(function () {
    var slots = ctx.slots;
    if (!slots) return;
    return slots.inject('shell.overlay', function () {
      return slots.register({ name: 'shell.overlay', id: 'hellokitty-done' }, function () {
        return React.createElement(ToastRoot);
      });
    });
  });

  ctx.on('dispose', function () { if (undoInterval) undoInterval(); });
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = { apply: apply, inject: ["slots", "timer"] };
}
return module.exports; } });
