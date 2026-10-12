// bun run deploy: build, then upload dist/ to Cloudflare with wrangler, as
// Workers static assets (no Worker code). The wrangler config is generated
// from lemma.config.mjs (deploy) into .wrangler/deploy.jsonc.
// Signs in with the cf CLI's login (`cf auth login`) when cf is installed;
// otherwise wrangler uses its own (`bunx wrangler login`). Extra arguments go
// to wrangler: bun run deploy --dry-run
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import lemma from '../lemma.config.mjs';

// LEMMA_ABOUT=sample builds the fictitious sample profile as the about page;
// that must never go live.
if (process.env.LEMMA_ABOUT !== undefined) {
  console.error(`deploy: LEMMA_ABOUT is set (${process.env.LEMMA_ABOUT}). Unset it and run bun run deploy again.`);
  process.exit(1);
}
// Drafts and an about page that still holds the template marker are left out
// of production builds only.
if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV !== 'production') {
  console.error(`deploy: NODE_ENV is set (${process.env.NODE_ENV}). Unset it and run bun run deploy again.`);
  process.exit(1);
}

const run = (cmd, args, env) => execFileSync(cmd, args, { stdio: 'inherit', env: { ...process.env, ...env } });

const { worker, accountId, domain, compatibilityDate } = lemma.deploy;
const config = new URL('../.wrangler/deploy.jsonc', import.meta.url);
mkdirSync(new URL('.', config), { recursive: true });
writeFileSync(
  config,
  JSON.stringify(
    {
      name: worker,
      account_id: accountId,
      compatibility_date: compatibilityDate,
      // Relative to this file.
      assets: { directory: '../dist', not_found_handling: '404-page' },
      routes: [{ pattern: domain, custom_domain: true }],
      // The site lives at its domain only: no *.workers.dev copy.
      workers_dev: false,
      preview_urls: false,
    },
    null,
    2,
  ) + '\n',
);

run('bun', ['run', 'build']);
let env = {};
try {
  // Any authenticated cf call renews an expired token.
  execFileSync('cf', ['auth', 'whoami', '-q'], { stdio: 'ignore' });
  const { oauth_token } = JSON.parse(readFileSync(join(homedir(), '.config/cloudflare/config/default.json'), 'utf8'));
  env = { CLOUDFLARE_API_TOKEN: oauth_token };
} catch {}
run('bunx', ['wrangler', 'deploy', '--config', '.wrangler/deploy.jsonc', ...process.argv.slice(2)], env);
