# Solana Devnet Mini App
Telegram Mini App (telegram-web-app.js + Vite) with a Telegram Serverless backend.
- `tgcloud/endpoints/getBalance.js` — SOL + demUSDC for EyBH1wPC…hjgW via Devnet JSON-RPC
- `tgcloud/endpoints/getTrades.js` — seeded Orca Devnet swaps + live scan of recent wallet txs
- `tgcloud/lib/solana.js`, `tgcloud/lib/tradesSeed.js`, `tgcloud/handlers/message.js` (/start)
- `src/`, `index.html` — front-end (Telegram theme colors, explorer links)
See BOTFATHER_STEPS.md to deploy.
