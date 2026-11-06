import './style.css';
const tg = window.Telegram?.WebApp;
const WALLET = 'EyBH1wPC8vXKhpWtWFnHR9z2GDqJDw4NwbbpfFhehjgW';
const $ = (id) => document.getElementById(id);
const ex = (p) => `https://explorer.solana.com/${p}?cluster=devnet`;
if (tg) { tg.ready(); tg.expand(); }
$('addr').innerHTML = `<a href="${ex('address/' + WALLET)}" target="_blank">${WALLET}</a>`;

function call(name, input = {}) {
  return new Promise((resolve, reject) => {
    if (!tg?.Serverless) return reject(new Error('Open inside Telegram'));
    tg.Serverless.call(name, input, (err, res) => (err ? reject(err) : resolve(res)));
  });
}
const fmt = (n, d) => (n > 0 ? '+' : '') + Number(n).toFixed(d);
const cls = (n) => (n > 0 ? 'pos' : n < 0 ? 'neg' : '');
const short = (s) => s.slice(0, 6) + '…' + s.slice(-6);

async function load() {
  $('sol').textContent = $('usdc').textContent = '…';
  call('getBalance').then((b) => {
    $('sol').textContent = b.sol.toFixed(4);
    $('usdc').textContent = b.demUSDC.toFixed(4);
    $('updated').textContent = `Slot ${b.slot} · ${new Date(b.at).toLocaleString()}`;
  }).catch((e) => { $('sol').textContent = $('usdc').textContent = '—'; $('updated').textContent = 'Balance error: ' + e.message; });
  call('getTrades').then(({ trades, rpcError }) => {
    const net = trades.reduce((s, t) => s + (t.solDelta || 0), 0);
    $('summary').innerHTML = `${trades.length} swaps · net SOL <span class="${cls(net)}">${fmt(net, 6)}</span>${rpcError ? ' · live RPC scan failed' : ''}`;
    $('trades').innerHTML = trades.map((t) => `<li class="t">
      <div class="row"><span><span class="tag ${t.side}">${t.side}${t.cycle ? ' #' + t.cycle : ''}</span> ${t.status}</span><span class="muted">${t.time ? new Date(t.time).toLocaleString() : ''}</span></div>
      <div class="row"><span class="${cls(t.solDelta)}">${fmt(t.solDelta, 6)} SOL</span><span class="${cls(t.usdcDelta)}">${fmt(t.usdcDelta, 4)} demUSDC</span></div>
      <a href="${ex('tx/' + t.sig)}" target="_blank">${short(t.sig)} ↗</a></li>`).join('') || '<li class="muted">No trades yet</li>';
  }).catch((e) => { $('trades').innerHTML = `<li class="muted">Trades error: ${e.message}</li>`; });
}
$('refresh').onclick = load;
load();
