import { getBalances } from '../tgcloud/lib/solana.js';
export default async function handler(req, res) {
  try { res.setHeader('Cache-Control', 's-maxage=10'); res.status(200).json(await getBalances(fetch)); }
  catch (e) { res.status(502).json({ error: e.message }); }
}
