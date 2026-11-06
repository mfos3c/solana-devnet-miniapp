// Trades = embedded seed + live Devnet RPC scan of wallet txs touching the Orca pool (picks up new cloud-bot trades automatically).
import seed from '../tgcloud/lib/tradesSeed.js';
import { rpc, getTx, WALLET, POOL } from '../tgcloud/lib/solana.js';
export default async function handler(req, res) {
  const bySig = new Map(seed.map((t) => [t.sig, t]));
  let rpcError = null;
  try {
    const sigs = await rpc(fetch, 'getSignaturesForAddress', [POOL, { limit: 100 }]);
    const mine = await rpc(fetch, 'getSignaturesForAddress', [WALLET, { limit: 100 }]);
    const poolSet = new Set(sigs.map((s) => s.signature));
    const fresh = mine.filter((s) => poolSet.has(s.signature) && !bySig.has(s.signature)).slice(0, 20);
    for (const s of fresh) { const t = await getTx(fetch, s.signature); if (t.side !== 'other') bySig.set(t.sig, t); }
  } catch (e) { rpcError = e.message; }
  const trades = [...bySig.values()].sort((a, b) => (b.time || '').localeCompare(a.time || ''));
  res.setHeader('Cache-Control', 's-maxage=15');
  res.status(200).json({ trades, rpcError });
}
