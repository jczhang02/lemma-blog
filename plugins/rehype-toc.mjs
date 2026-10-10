// Collect h2/h3 for the table of contents, keeping rendered math.
//
// Must run after rehype-mathjax4. Astro's own `headings` drops math (the SVG
// has no text) and slugs "$L^2$ 空间" as "-空间", so this plugin sets the ids
// itself (with the TeX source in the slug) and passes the heading HTML to
// templates as `remarkPluginFrontmatter.toc`.
import GithubSlugger from 'github-slugger';
import { toHtml } from 'hast-util-to-html';
import { visit } from 'unist-util-visit';

// Heading text with each formula replaced by its TeX source.
function slugText(node) {
  if (node.type === 'text') return node.value;
  if (node.tagName === 'mjx-container') return node.properties?.dataTex ?? '';
  return (node.children ?? []).map(slugText).join('');
}

export default function rehypeToc() {
  return (tree, file) => {
    const slugger = new GithubSlugger();
    const toc = [];
    visit(tree, 'element', (node) => {
      const depth = { h2: 2, h3: 3 }[node.tagName];
      if (!depth) return;
      node.properties.id ??= slugger.slug(slugText(node));
      toc.push({ depth, slug: node.properties.id, html: toHtml(node.children) });
    });
    file.data.astro.frontmatter.toc = toc;
  };
}
