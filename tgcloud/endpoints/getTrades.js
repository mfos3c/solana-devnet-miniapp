import { fetch } from 'sdk';
import seed from '../lib/tradesSeed.js';
import { rpc, getTx, WALLET } from '../lib/solana.js';

// Seeded bot trades + any newer wallet txs found on Devnet that move demUSDC (swaps).
export default async function (input) {
  const trades = seed.map((t) => ({ ...t, source: 'bot' }));
  const known = new Set(trades.map((t) => t.sig));
  let rpcError = null;
  try {
    const sigs = await rpc(fetch, 'getSignaturesForAddress', [WALLET, { limit: Math.min(Number(input?.limit) || 15, 25) }]);
    for (const s of sigs) {
      if (known.has(s.signature) || s.err) continue;
      const t = await getTx(fetch, s.signature);
      if (t.usdcDelta !== 0) trades.push({ ...t, source: 'rpc' });
    }
  } catch (e) { rpcError = String(e.message || e); }
  trades.sort((a, b) => (b.slot || 0) - (a.slot || 0));
  return { trades, rpcError };
}
