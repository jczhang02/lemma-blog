// Videos next to a post: `![caption](./clip.mp4)` becomes a <video>.
//
// Astro only processes images, so video files are served from their post
// folder at /media/posts/<post>/<file>: by middleware in dev, and copied into
// the build output after a build.
//
// Cloudflare Pages takes files up to 25 MiB. Larger videos go to R2 with
// `bun run media:push`, which uploads them, lists them in src/media-r2.json
// and keeps them out of git; posts still write `![caption](./clip.mp4)`.
import { cpSync, existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import sirv from 'sirv';

export const VIDEO = { '.mp4': 'video/mp4', '.webm': 'video/webm', '.m4v': 'video/x-m4v', '.mov': 'video/quicktime', '.ogv': 'video/ogg' };
const BASE = '/media/posts';
// Cloudflare Pages rejects larger files.
export const MAX_BYTES = 25 * 1024 * 1024;
export const R2 = { bucket: 'blog-media', origin: 'https://media.jczhang.cc' };

export const isVideo = (path) => Object.hasOwn(VIDEO, extname(path).toLowerCase());

/** Videos on R2: { "<post>/<file>": { key, size, sha256 } }. */
export const readManifest = (url) => (existsSync(url) ? JSON.parse(readFileSync(url, 'utf8')) : {});

/** Remark plugin. @param {{ posts: URL, manifest: URL }} options */
export default function remarkMedia({ posts, manifest }) {
  const root = fileURLToPath(posts);
  const remote = readManifest(manifest);
  return (tree, file) => {
    const visit = (node) => {
      for (const [i, child] of (node.children ?? []).entries()) {
        if (child.type === 'image' && isVideo(child.url) && !/^[a-z]+:/i.test(child.url)) {
          let src = child.url;
          // Root-absolute URLs point into public/ and are served as they are.
          if (!src.startsWith('/')) {
            const path = join(dirname(file.path), decodeURIComponent(child.url));
            const rel = relative(root, path);
            if (rel.startsWith('..')) {
              console.warn(`[media] ${file.path}: ${child.url} is outside the posts folder`);
              continue;
            }
            const key = rel.split('\\').join('/');
            const size = existsSync(path) ? statSync(path).size : undefined;
            if (remote[key]) {
              // The local copy is absent in CI (not in git); that is fine.
              if (size !== undefined && size !== remote[key].size) console.warn(`[media] ${file.path}: ${child.url} changed since upload; run bun run media:push`);
              src = `${R2.origin}/${remote[key].key}`;
            } else {
              if (size === undefined) console.warn(`[media] ${file.path}: missing ${child.url}`);
              else if (size > MAX_BYTES) console.warn(`[media] ${file.path}: ${child.url} is over 25 MiB; run bun run media:push`);
              src = `${BASE}/${key}`;
            }
          }
          node.children[i] = {
            type: 'video',
            data: {
              hName: 'video',
              // "#t=0.001" makes browsers show the first frame instead of a blank box.
              hProperties: { src: `${src}#t=0.001`, controls: true, preload: 'metadata', playsInline: true, title: child.alt || undefined },
              hChildren: [{ type: 'element', tagName: 'a', properties: { href: src }, children: [{ type: 'text', value: child.alt || src }] }],
            },
          };
        } else {
          visit(child);
        }
      }
    };
    visit(tree);
  };
}

/** Integration that serves (dev) and copies (build) the video files that are not on R2. @param {{ posts: URL, manifest: URL }} options */
export function mediaIntegration({ posts, manifest }) {
  const root = fileURLToPath(posts);
  const serve = sirv(root, { dev: true });
  return {
    name: 'post-media',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use(BASE, (req, res, next) => (isVideo(req.url.split('?')[0]) ? serve(req, res, next) : next()));
      },
      'astro:build:done': ({ dir }) => {
        const out = join(fileURLToPath(dir), BASE);
        // A folder whose posts are all drafts is not published, nor are its videos.
        const draftOnly = (folder) => {
          const posts = readdirSync(folder).filter((f) => /^(zh|en)\.md$/.test(f));
          return posts.length > 0 && posts.every((f) => /^draft:\s*true\s*$/m.test(readFileSync(join(folder, f), 'utf8').split(/^---\s*$/m)[1] ?? ''));
        };
        const remote = readManifest(manifest);
        const copy = (from) => {
          if (draftOnly(from)) return;
          for (const entry of readdirSync(from, { withFileTypes: true })) {
            const path = join(from, entry.name);
            if (entry.isDirectory()) copy(path);
            else if (isVideo(entry.name) && !remote[relative(root, path).split('\\').join('/')]) cpSync(path, join(out, relative(root, path)), { recursive: true });
          }
        };
        copy(root);
      },
    },
  };
}
