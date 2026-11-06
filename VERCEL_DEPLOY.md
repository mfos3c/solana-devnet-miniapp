# Deploy on Vercel (no Telegram Serverless)
- API: /api/balance (live Devnet RPC), /api/trades (seed + live RPC scan of wallet txs on Orca pool; new cloud-bot trades appear automatically).
- Temporary: `npx vercel deploy --temporary --yes` (expires in 60 min; claim via printed claimUrl).
- Permanent: `npx vercel login` then `npx vercel --yes --prod`.
## BotFather
/mybots → grok_scalping_solana_bot → Bot Settings → Menu Button → paste the https URL (or /setmenubutton). Optionally /newapp for a Mini App link.
