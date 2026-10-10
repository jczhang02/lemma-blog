// Render TeX math to SVG at build time with MathJax 4.
//
// Input comes from remark-math: `code.math-inline` and `pre > code.math-display`
// (also ```math fenced blocks). Each post gets its own macro sandbox, so
// \newcommand in one post does not leak into another, and equation numbers
// restart per post. Per-post macros come from frontmatter `macros`.
import MathJax from '@mathjax/src';
import { fromHtml } from 'hast-util-from-html';
import { toText } from 'hast-util-to-text';
import { visitParents } from 'unist-util-visit-parents';

// Loaded up front; anything else is still reachable through \require or autoload.
const PACKAGES = [
  'ams', 'newcommand', 'configmacros', 'begingroup', 'mathtools', 'physics',
  'cancel', 'cases', 'empheq', 'mhchem', 'bussproofs', 'amscd', 'extpfeil',
  'centernot', 'upgreek', 'gensymb', 'units', 'textcomp', 'colortbl',
  'boldsymbol', 'color', 'html', 'enclose', 'bbox', 'dsfont', 'bbm', 'bboldx',
];
// Built into input/tex, so not loaded separately.
const BUILTIN = new Set(['ams', 'newcommand', 'configmacros']);

let ready;
function init(macros) {
  ready ??= MathJax.init({
    loader: {
      load: ['input/tex', 'output/svg', ...PACKAGES.filter((p) => !BUILTIN.has(p)).map((p) => `[tex]/${p}`)],
    },
    tex: {
      // Without noundefined, an unknown macro is an error (as in LaTeX), so the build warns.
      packages: { '[+]': PACKAGES, '[-]': ['noundefined'] },
      tags: 'ams',
      macros,
    },
    // Wide display math scrolls sideways instead of overflowing the column.
    svg: { fontCache: 'local', displayOverflow: 'scroll' },
  });
  return ready;
}

// Astro may transform several files at once; MathJax state (labels, macro
// sandbox) is global, so one file at a time.
let queue = Promise.resolve();
function serial(fn) {
  const run = queue.then(fn);
  queue = run.catch(() => {});
  return run;
}

function toNewcommands(macros = {}) {
  return Object.entries(macros)
    .map(([name, def]) => {
      const [body, n, opt] = Array.isArray(def) ? def : [def];
      const args = n ? `[${n}]` + (opt !== undefined ? `[${opt}]` : '') : '';
      return `\\newcommand{\\${name}}${args}{${body}}`;
    })
    .join('');
}

function isMath(node) {
  const cls = node.properties?.className ?? [];
  return node.tagName === 'code' && (cls.includes('math-inline') || cls.includes('math-display') || cls.includes('language-math'));
}

// Bare \ref{..} / \eqref{..} in prose, as in LaTeX, without $ around them.
const REF = /\\(?:eq)?ref\{[^}]+\}/g;

function wrapRefs(tree) {
  visitParents(tree, 'text', (node, ancestors) => {
    if (!node.value.match(REF) || ancestors.some((a) => a.tagName === 'code' || a.tagName === 'pre')) return;
    const parent = ancestors.at(-1);
    const parts = [];
    let last = 0;
    for (const m of node.value.matchAll(REF)) {
      if (m.index > last) parts.push({ type: 'text', value: node.value.slice(last, m.index) });
      parts.push({
        type: 'element',
        tagName: 'code',
        properties: { className: ['math-inline'] },
        children: [{ type: 'text', value: m[0] }],
      });
      last = m.index + m[0].length;
    }
    if (last < node.value.length) parts.push({ type: 'text', value: node.value.slice(last) });
    parent.children.splice(parent.children.indexOf(node), 1, ...parts);
  });
}

/** @param {{ macros?: Record<string, string | [string, number, string?]> }} options */
export default function rehypeMathJax4(options = {}) {
  return async (tree, file) => {
    await init(options.macros ?? {});
    wrapRefs(tree);
    const items = [];
    visitParents(tree, 'element', (node, ancestors) => {
      if (!isMath(node)) return;
      const parent = ancestors.at(-1);
      const display = !node.properties.className.includes('math-inline');
      // Display math sits in a <pre>; replace the <pre>, not the <code>.
      if (display && parent?.tagName === 'pre') {
        items.push({ node: parent, parent: ancestors.at(-2), tex: toText(node), display });
      } else {
        items.push({ node, parent, tex: toText(node), display });
      }
      return 'skip';
    });
    if (!items.length) return;

    const fm = file.data.astro?.frontmatter ?? {};
    await serial(async () => {
      MathJax.texReset();
      await MathJax.tex2svgPromise(`\\begingroupSandbox${toNewcommands(fm.macros)}`);
      for (const item of items) {
        const out = await MathJax.tex2svgPromise(item.tex, { display: item.display });
        const html = MathJax.startup.adaptor.serializeXML(out);
        if (html.includes('data-mjx-error')) {
          const msg = html.match(/data-mjx-error="([^"]*)"/)?.[1];
          console.warn(`[mathjax] ${file.path}: ${msg}\n  in: ${item.tex}`);
        }
        const [rendered] = fromHtml(html, { fragment: true }).children;
        rendered.properties ??= {};
        rendered.properties.dataTex = item.tex;
        const i = item.parent.children.indexOf(item.node);
        item.parent.children[i] = rendered;
      }
    });
  };
}

// The small stylesheet MathJax needs once per site (mjx-container layout).
export async function mathjaxStylesheet() {
  await init({});
  return MathJax.startup.adaptor.textContent(MathJax.svgStylesheet());
}
