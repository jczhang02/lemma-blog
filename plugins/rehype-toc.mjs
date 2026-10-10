// Collect h2/h3 for the table of contents, keeping rendered math.
//
// Must run after rehype-mathjax4. Astro's own `headings` drops math (the SVG
// has no text) and slugs "$L^2$ 空间" as "-空间", so this plugin sets the ids
// itself (with the TeX source in the slug) and passes the heading HTML to
// templates as `remarkPluginFrontmatter.toc`, together with a plain-text label
// and the first paragraph of the section (the TOC's hover preview).
import GithubSlugger from 'github-slugger';
import { toHtml } from 'hast-util-to-html';
import { visit } from 'unist-util-visit';

// Heading text with each formula replaced by its TeX source.
function slugText(node) {
  if (node.type === 'text') return node.value;
  if (node.tagName === 'mjx-container') return node.properties?.dataTex ?? '';
  if (node.properties?.className?.includes('secnum')) return '';
  return (node.children ?? []).map(slugText).join('');
}

const isHeading = (node) => node.type === 'element' && (node.tagName === 'h2' || node.tagName === 'h3');

// A copy without links or footnote marks: the preview is not interactive,
// and it sits inside the TOC's own link.
function inertCopy(node) {
  const copy = structuredClone(node);
  visit(copy, 'element', (el, index, parent) => {
    if (el.tagName === 'sup' && el.children.some((c) => c.properties?.dataFootnoteRef !== undefined)) {
      parent.children.splice(index, 1);
      return index;
    }
    if (el.tagName === 'a') {
      el.tagName = parent?.tagName === 'svg' || parent?.tagName === 'g' ? 'g' : 'span';
      el.properties = {};
    }
  });
  return copy;
}

// The first paragraph between a heading and the next one, as HTML.
function excerpt(siblings, start) {
  for (const node of siblings.slice(start)) {
    if (isHeading(node)) return '';
    let found;
    visit(node, 'element', (el) => {
      if (el.tagName !== 'p') return;
      found = el;
      return false;
    });
    if (found) return toHtml(inertCopy(found).children);
  }
  return '';
}

export default function rehypeToc() {
  return (tree, file) => {
    const slugger = new GithubSlugger();
    const toc = [];
    visit(tree, 'element', (node, index, parent) => {
      const depth = { h2: 2, h3: 3 }[node.tagName];
      // The footnotes heading is screen-reader-only and not part of the outline.
      if (!depth || node.properties.id === 'footnote-label') return;
      node.properties.id ??= slugger.slug(slugText(node).trim());
      const number = node.children.find((c) => c.properties?.className?.includes('secnum'));
      toc.push({
        depth,
        slug: node.properties.id,
        html: toHtml(node.children),
        label: [number && slugText({ children: number.children }), slugText(node).trim()].filter(Boolean).join(' '),
        excerpt: excerpt(parent.children, index + 1),
      });
    });
    file.data.astro.frontmatter.toc = toc;
  };
}
