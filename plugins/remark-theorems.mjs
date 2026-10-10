// Section numbers and theorem-like environments, numbered in one pass.
//
//   ## Introduction \label{sec:intro}
//
//   :::theorem[Lagrange]{#thm:lagrange}
//   Body.
//   :::
//
// h2/h3 are numbered 1, 1.1, ...; theorem-like kinds share one counter that
// restarts in each section (2.1, 2.2, ...), as amsthm with [section].
// `numbering: false` in frontmatter turns section numbers off (theorems are
// then 1, 2, ...). `\ref{id}` in prose becomes a link with the number of a
// section or theorem; other \ref and \eqref are left for MathJax.
import { visit, SKIP } from 'unist-util-visit';

const LABELS = {
  zh: {
    theorem: '定理', lemma: '引理', proposition: '命题', corollary: '推论',
    definition: '定义', example: '例', remark: '注', proof: '证明',
  },
  en: {
    theorem: 'Theorem', lemma: 'Lemma', proposition: 'Proposition', corollary: 'Corollary',
    definition: 'Definition', example: 'Example', remark: 'Remark', proof: 'Proof',
  },
};

const REF = /\\ref\{([^}]+)\}/g;
const LABEL = /\s*\\label\{([^}]+)\}/;

const text = (value) => ({ type: 'text', value });
const span = (className, children) => ({ type: 'emphasis', data: { hName: 'span', hProperties: { className } }, children });

function langOf(file) {
  return /[/\\]posts[/\\]en[/\\]/.test(file.path ?? '') ? 'en' : 'zh';
}

// Put the inline head at the start of the first paragraph, or in its own
// paragraph if the environment starts with display math, a list, etc.
function prependHead(node, head) {
  const first = node.children[0];
  if (first?.type === 'paragraph') first.children.unshift(head, text(' '));
  else node.children.unshift({ type: 'paragraph', children: [head] });
}

function appendQed(node) {
  const qed = span(['qed'], [text('∎')]);
  const last = node.children.at(-1);
  if (last?.type === 'paragraph') last.children.push(qed);
  else node.children.push({ type: 'paragraph', data: { hProperties: { className: ['qed-line'] } }, children: [qed] });
}

// Restored directives leave split text ("\ref{thm" + ":lagrange" + "}"); join it again.
function mergeText(tree) {
  visit(tree, (node) => {
    if (!node.children) return;
    node.children = node.children.reduce((out, child) => {
      const prev = out.at(-1);
      if (prev?.type === 'text' && child.type === 'text') prev.value += child.value;
      else out.push(child);
      return out;
    }, []);
  });
}

// Take `\label{...}` out of a heading's text and return the label.
function takeLabel(heading) {
  for (const child of heading.children) {
    if (child.type !== 'text') continue;
    const m = child.value.match(LABEL);
    if (m) {
      child.value = child.value.replace(LABEL, '');
      return m[1];
    }
  }
}

export default function remarkTheorems() {
  return (tree, file) => {
    const labels = LABELS[langOf(file)];
    const numbered = file.data.astro?.frontmatter?.numbering !== false;
    const numbers = new Map();
    let section = 0;
    let subsection = 0;
    let counter = 0;

    // Directives we do not handle (e.g. "std::vector", "note:this", or the
    // ":intro" in "\label{sec:intro}") go back to their source text first, so
    // the passes below see whole text nodes.
    visit(tree, (node, index, parent) => {
      if (node.type !== 'textDirective' && node.type !== 'leafDirective') return;
      const { start, end } = node.position ?? {};
      const source = start && end ? String(file.value).slice(start.offset, end.offset) : `:${node.name}`;
      parent.children[index] = node.type === 'leafDirective' ? { type: 'paragraph', children: [text(source)] } : text(source);
      return SKIP;
    });
    mergeText(tree);

    visit(tree, (node) => {
      if (node.type === 'heading' && (node.depth === 2 || node.depth === 3)) {
        const label = takeLabel(node);
        if (!numbered) {
          if (label) node.data = { hProperties: { id: label } };
          return;
        }
        if (node.depth === 2) {
          section++;
          subsection = 0;
          counter = 0;
        } else {
          subsection++;
        }
        const n = node.depth === 2 ? `${section}` : `${section}.${subsection}`;
        if (label) numbers.set(label, n);
        node.data = { hProperties: label ? { id: label } : {} };
        node.children.unshift(span(['secnum'], [text(n)]), text(' '));
        return;
      }
      if (node.type !== 'containerDirective') return;
      if (!(node.name in labels)) {
        console.warn(`[theorems] ${file.path}: unknown environment :::${node.name}`);
        return;
      }

      const kind = node.name;
      const id = node.attributes?.id;
      const title = node.children[0]?.data?.directiveLabel ? node.children.shift().children : null;

      if (kind === 'proof') {
        node.data = { hName: 'section', hProperties: { className: ['proof'], id } };
        prependHead(node, span(['thm-head'], title ? [...title, text('.')] : [text(`${labels.proof}.`)]));
        appendQed(node);
        return;
      }

      counter++;
      const n = numbered && section > 0 ? `${section}.${counter}` : `${counter}`;
      if (id) numbers.set(id, n);
      node.data = { hName: 'section', hProperties: { className: ['thm'], dataKind: kind, id } };
      prependHead(
        node,
        span(['thm-head'], [
          { type: 'strong', children: [text(`${labels[kind]} ${n}`)] },
          ...(title ? [text(' ('), ...title, text(')')] : []),
          text('.'),
        ]),
      );
    });

    // Last pass, after all numbers are known, so forward references work.
    visit(tree, 'text', (node, index, parent) => {
      if (!node.value.includes('\\ref{')) return;
      const parts = [];
      let last = 0;
      for (const m of node.value.matchAll(REF)) {
        const n = numbers.get(m[1]);
        if (n === undefined) continue;
        if (m.index > last) parts.push(text(node.value.slice(last, m.index)));
        parts.push({ type: 'link', url: `#${m[1]}`, data: { hProperties: { className: ['xref'] } }, children: [text(n)] });
        last = m.index + m[0].length;
      }
      if (!parts.length) return;
      if (last < node.value.length) parts.push(text(node.value.slice(last)));
      parent.children.splice(index, 1, ...parts);
      return index + parts.length;
    });
  };
}
