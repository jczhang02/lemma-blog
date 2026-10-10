// Videos next to a post: `![caption](./clip.mp4)` becomes a <video>.
//
// Astro only processes images, so video files are served from their post
// folder at /media/posts/<post>/<file>: by middleware in dev, and copied into
// the build output after a build.
import { cpSync, existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import sirv from 'sirv';

const VIDEO = new Set(['.mp4', '.webm', '.m4v', '.mov', '.ogv']);
const BASE = '/media/posts';
// Cloudflare Pages rejects larger files.
const MAX_BYTES = 25 * 1024 * 1024;

const isVideo = (path) => VIDEO.has(extname(path).toLowerCase());

/** Remark plugin. @param {{ posts: URL }} options */
export default function remarkMedia({ posts }) {
  const root = fileURLToPath(posts);
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
            if (!existsSync(path)) console.warn(`[media] ${file.path}: missing ${child.url}`);
            else if (statSync(path).size > MAX_BYTES) console.warn(`[media] ${file.path}: ${child.url} is over 25 MiB; host it elsewhere`);
            src = `${BASE}/${rel.split('\\').join('/')}`;
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

/** Integration that serves (dev) and copies (build) the video files. @param {{ posts: URL }} options */
export function mediaIntegration({ posts }) {
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
        const copy = (from) => {
          if (draftOnly(from)) return;
          for (const entry of readdirSync(from, { withFileTypes: true })) {
            const path = join(from, entry.name);
            if (entry.isDirectory()) copy(path);
            else if (isVideo(entry.name)) cpSync(path, join(out, relative(root, path)), { recursive: true });
          }
        };
        copy(root);
      },
    },
  };
}
