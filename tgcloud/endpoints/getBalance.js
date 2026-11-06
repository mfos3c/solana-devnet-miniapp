import { fetch, EndpointError } from 'sdk';
import { getBalances } from '../lib/solana.js';

export default async function () {
  try { return await getBalances(fetch); }
  catch (e) { throw new EndpointError('Devnet RPC unavailable', { code: 'RPC', detail: String(e.message || e) }); }
}
