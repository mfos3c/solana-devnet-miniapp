import './style.css';
import seed from '../tgcloud/lib/tradesSeed.js';
import { getBalances, rpc, getTx, WALLET, POOL } from '../tgcloud/lib/solana.js';

const tg = window.Telegram?.WebApp;
const $ = (id) => document.getElementById(id);
const ex = (p) => `https://explorer.solana.com/${p}?cluster=devnet`;
if (tg) { tg.ready(); tg.expand(); }
$('addr').innerHTML = `<a href="${ex('address/' + WALLET)}" target="_blank">${WALLET}</a>`;

const fmt = (n, d) => (n > 0 ? '+' : '') + Number(n).toFixed(d);
const cls = (n) => (n > 0 ? 'pos' : n < 0 ? 'neg' : '');
const short = (s) => s.slice(0, 6) + '…' + s.slice(-6);

async function loadTrades() {
  const bySig = new Map(seed.map((t) => [t.sig, t]));
  let rpcError = null;
  try {
    const [sigs, mine] = await Promise.all([
      rpc(fetch, 'getSignaturesForAddress', [POOL, { limit: 100 }]),
      rpc(fetch, 'getSignaturesForAddress', [WALLET, { limit: 100 }]),
    ]);
    const poolSet = new Set(sigs.map((s) => s.signature));
    const fresh = mine.filter((s) => poolSet.has(s.signature) && !bySig.has(s.signature)).slice(0, 20);
    for (const s of fresh) {
      const t = await getTx(fetch, s.signature);
      if (t.side !== 'other') bySig.set(t.sig, t);
    }
  } catch (e) { rpcError = e.message; }
  return { trades: [...bySig.values()].sort((a, b) => (b.time || '').localeCompare(a.time || '')), rpcError };
}

async function load() {
  $('sol').textContent = $('usdc').textContent = '…';
  getBalances(fetch).then((b) => {
    $('sol').textContent = b.sol.toFixed(4);
    $('usdc').textContent = b.demUSDC.toFixed(4);
    $('updated').textContent = `Slot ${b.slot} · ${new Date(b.at).toLocaleString()}`;
  }).catch((e) => {
    $('sol').textContent = $('usdc').textContent = '—';
    $('updated').textContent = 'Balance error: ' + e.message;
  });
  loadTrades().then(({ trades, rpcError }) => {
    const net = trades.reduce((s, t) => s + (t.solDelta || 0), 0);
    $('summary').innerHTML = `${trades.length} swaps · net SOL <span class="${cls(net)}">${fmt(net, 6)}</span>${rpcError ? ' · live scan note: ' + rpcError : ''}`;
    $('trades').innerHTML = trades.map((t) => `<li class="t">
      <div class="row"><span><span class="tag ${t.side}">${t.side}${t.cycle ? ' #' + t.cycle : ''}</span> ${t.status}</span><span class="muted">${t.time ? new Date(t.time).toLocaleString() : ''}</span></div>
      <div class="row"><span class="${cls(t.solDelta)}">${fmt(t.solDelta, 6)} SOL</span><span class="${cls(t.usdcDelta)}">${fmt(t.usdcDelta, 4)} demUSDC</span></div>
      <a href="${ex('tx/' + t.sig)}" target="_blank">${short(t.sig)} ↗</a></li>`).join('') || '<li class="muted">No trades yet</li>';
  }).catch((e) => { $('trades').innerHTML = `<li class="muted">Trades error: ${e.message}</li>`; });
}
$('refresh').onclick = load;
load();
