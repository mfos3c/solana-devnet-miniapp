import { api } from 'sdk';

// Set after first deploy (printed by `npm run deploy`), e.g. https://app123.tgcloud.ai/
const MINI_APP_URL = '';

export default async function (message) {
  const text = message.text || '';
  if (!text.startsWith('/start') && !text.startsWith('/app')) return;
  const params = {
    chat_id: message.chat.id,
    text: 'Solana Devnet bot dashboard\n\nOpen the Mini App to see wallet balance (SOL + demUSDC) and the Orca Devnet trade history with explorer links.' +
      (MINI_APP_URL ? '' : '\n\n(Mini App URL not configured yet — use the menu button.)'),
  };
  if (MINI_APP_URL) params.reply_markup = { inline_keyboard: [[{ text: 'Open dashboard', web_app: { url: MINI_APP_URL } }]] };
  await api.sendMessage(params);
}
