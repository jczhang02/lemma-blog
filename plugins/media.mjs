// Videos next to a post: `![caption](./clip.mp4)` becomes a <video>.
//
// Astro only processes images, so video files are served from their post
// folder at /media/posts/<post>/<file>: by middleware in dev, and copied into
// the build output after a build.
import { cpSync, existsSync, readdirSync, statSync } from 'node:fs';
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
          const path = join(dirname(file.path), decodeURIComponent(child.url));
          if (!existsSync(path)) console.warn(`[media] ${file.path}: missing ${child.url}`);
          else if (statSync(path).size > MAX_BYTES) console.warn(`[media] ${file.path}: ${child.url} is over 25 MiB; host it elsewhere`);
          const src = `${BASE}/${relative(root, path).split('\\').join('/')}`;
          node.children[i] = {
            type: 'video',
            data: {
              hName: 'video',
              hProperties: { src, controls: true, preload: 'metadata', playsInline: true, title: child.alt || undefined },
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
        const copy = (from) => {
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
