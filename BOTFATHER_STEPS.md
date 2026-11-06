# Deploy to Telegram Serverless (@grok_scalping_solana_bot)

1. In Telegram open **@BotFather** → /mybots → @grok_scalping_solana_bot → **Serverless** → turn it **On**.
2. BotFather → Serverless → **CLI Access** → copy the **Access token** (form `app<id>:…` — NOT the Bot API token).
3. On the Mac:
   ```bash
   cd ~/agent-tools/solana-devnet-miniapp   # or ~/Desktop/solana-devnet-miniapp (run `npm install` first)
   npx tgcloud login      # paste the CLI access token
   npm run deploy         # vite build + tgcloud push; prints https://app<id>.tgcloud.ai/
   ```
   (No database tables are used, so `tgcloud migrate` is not needed.)
4. BotFather → @grok_scalping_solana_bot → **Bot Settings → Configure Mini App / Menu Button** → set URL to the printed `https://app<id>.tgcloud.ai/`.
5. Optional: put that URL into `MINI_APP_URL` in `tgcloud/handlers/message.js`, then `npx tgcloud push` so `/start` replies with an "Open dashboard" button.
6. Open the bot in Telegram → tap the menu button (or `/start` → Open dashboard).

## Note
Deploying Serverless puts the bot on a platform-managed webhook. Your local `tg.py` alerts use `sendMessage` only (no polling), so they keep working.

## Updating trade history
- New trades by the bot wallet appear automatically (getTrades scans recent Devnet signatures).
- To refresh the embedded snapshot: `node scripts/seed.mjs` (also merges `~/agent-tools/solana-devnet-bot/trades.json`), then `npm run deploy`.
- Record a new cycle in the bot: `node ~/agent-tools/solana-devnet-bot/record-trade.mjs entry <sig> 5`.

## Local test (after login)
```bash
npx tgcloud run endpoints/getBalance '{}' --ctx '{ initData: { user: { id: 1 } } }'
npx tgcloud run endpoints/getTrades '{}' --ctx '{ initData: { user: { id: 1 } } }'
```
