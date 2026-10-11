// bun run deploy: build, then upload dist/ to Cloudflare with wrangler.
// Signs in with the cf CLI's login (`cf auth login`), so wrangler needs no
// login of its own.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const run = (cmd, args, env) => execFileSync(cmd, args, { stdio: 'inherit', env: { ...process.env, ...env } });

run('bun', ['run', 'build']);
// Any authenticated cf call renews an expired token.
execFileSync('cf', ['auth', 'whoami', '-q'], { stdio: 'ignore' });
const { oauth_token } = JSON.parse(readFileSync(join(homedir(), '.config/cloudflare/config/default.json'), 'utf8'));
run('bunx', ['wrangler', 'deploy'], { CLOUDFLARE_API_TOKEN: oauth_token });
