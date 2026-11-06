// Pure helpers for Solana Devnet JSON-RPC (no npm imports; runs in tgcloud runtime and Node).
export const RPC = 'https://api.devnet.solana.com';
export const WALLET = 'EyBH1wPC8vXKhpWtWFnHR9z2GDqJDw4NwbbpfFhehjgW';
export const USDC_MINT = 'BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k';
export const POOL = '3KBZiL2g8C7tiJ32hTv5v3KM7aK9htpqTw4cTXz1HvPt';

export async function rpc(fetchFn, method, params) {
  const res = await fetchFn(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  if (!res.ok) throw new Error('RPC HTTP ' + res.status);
  const j = await res.json();
  if (j.error) throw new Error('RPC ' + method + ': ' + j.error.message);
  return j.result;
}

export async function getBalances(fetchFn) {
  const [sol, tok] = await Promise.all([
    rpc(fetchFn, 'getBalance', [WALLET, { commitment: 'confirmed' }]),
    rpc(fetchFn, 'getTokenAccountsByOwner', [WALLET, { mint: USDC_MINT }, { encoding: 'jsonParsed', commitment: 'confirmed' }]),
  ]);
  let usdc = 0;
  for (const a of tok.value || []) usdc += Number(a.account.data.parsed.info.tokenAmount.uiAmountString || 0);
  return { wallet: WALLET, sol: sol.value / 1e9, demUSDC: usdc, slot: sol.context.slot, at: new Date().toISOString() };
}

// Wallet SOL + demUSDC deltas for one tx.
export function parseTx(sig, tx) {
  if (!tx) return { sig, status: 'not_found' };
  const keys = tx.transaction.message.accountKeys.map((k) => (typeof k === 'string' ? k : k.pubkey));
  const i = keys.indexOf(WALLET);
  const m = tx.meta || {};
  const solDelta = i >= 0 ? (m.postBalances[i] - m.preBalances[i]) / 1e9 : 0;
  const tb = (arr) => (arr || []).filter((b) => b.mint === USDC_MINT && b.owner === WALLET)
    .reduce((s, b) => s + Number(b.uiTokenAmount.uiAmountString || 0), 0);
  const usdcDelta = tb(m.postTokenBalances) - tb(m.preTokenBalances);
  return {
    sig, slot: tx.slot, time: tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : null,
    status: m.err ? 'failed' : 'ok', fee: (m.fee || 0) / 1e9,
    solDelta: +solDelta.toFixed(9), usdcDelta: +usdcDelta.toFixed(6),
    side: usdcDelta > 0 ? 'entry' : usdcDelta < 0 ? 'exit' : 'other',
  };
}

export async function getTx(fetchFn, sig) {
  const tx = await rpc(fetchFn, 'getTransaction', [sig, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0, commitment: 'confirmed' }]);
  return parseTx(sig, tx);
}
