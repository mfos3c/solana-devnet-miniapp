// Builds trades.json for the bot + tgcloud/lib/tradesSeed.js from known cycle signatures.
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
import { getTx } from '../tgcloud/lib/solana.js';
const cycles = [
 ['252Mg5mfhx4r3nuUQSV8XdbG5EjhYybxgdnb7mYGfWy7WN1j1dnQcFkWhGchUkoQJ8kYCkyBQYnPYP7enq1wqCTt','3VwydUbF5fhdZ2heHxCnFMZ2yNQzY5YpXbijvmj3Qhvax11vbAJE3ajuA5PTCZPLMdM39mzgzmHhdXXdxw5gaXpG'],
 ['4u7BixkJskoAuWbg7TuZskMwzNXSUmsoQbRo69jVLoSqTfnZ7qTc8wy2N3rHG6JtofbFJ3XXhr9kULaVZqcn8wjX','2HbqfAPCtovGVvWw8w2KD5By5ziHjrvQfEy3YHpC5hUXeuSdvqpT7DokL2N2kveUpkFmKgmjob77d6qbwyWZHwft'],
 ['PC7PUDJHmXumZ2yqV2kBv1go9KQPVgqPYvMHiyHhpJm1gPePmXTvXLMmkPtQK8ScsCXbpLyFBZy6hBPmTfskHpB','2YksG6gVFrV2hMhdtgT423rSTQXduQtVgNCdMt9HEy4TrWkuAAWtouUnhLWDnNQqStq5PcSFAeZL7FkXmpggKSAX'],
 ['hUTmpL4oYGhRUrdPX1ymaGukmMgje9hQPzFz4dLDxbLmCv719AFFjbxb7ex7DtKzLerDYuESnxLMR5Ehfo1dBWh','2xf2PYdfFfhG2C5VRHTkDoN5Sum2zVv3FjsLHiwY7wrhheFDouUmVV5zH2u725juEi1pASXoA7xwAkHotKfHV4Bt'],
];
const botFile = path.join(os.homedir(), 'agent-tools/solana-devnet-bot/trades.json');
let existing = []; try { existing = JSON.parse(fs.readFileSync(botFile, 'utf8')); } catch {}
const out = [...existing];
for (const [n, [e, x]] of cycles.entries()) {
  for (const [side, sig] of [['entry', e], ['exit', x]]) {
    if (out.some((t) => t.sig === sig)) continue;
    const t = await getTx(fetch, sig); t.side = side; t.cycle = n + 1; out.push(t);
    await new Promise((r) => setTimeout(r, 300));
  }
}
fs.writeFileSync(botFile, JSON.stringify(out, null, 2));
fs.writeFileSync('tgcloud/lib/tradesSeed.js', '// Snapshot of bot trades.json (regenerate: node scripts/seed.mjs)\nexport default ' + JSON.stringify(out, null, 2) + ';\n');
console.log(out.map((t) => `${t.cycle} ${t.side} ${t.status} sol=${t.solDelta} usdc=${t.usdcDelta}`).join('\n'));
