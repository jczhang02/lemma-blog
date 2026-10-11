// Reading time and section count for the line under a post's title, passed
// to templates as remarkPluginFrontmatter.readingMinutes / .sections.
//
// Prose is timed by script: Chinese at 400 characters a minute, Latin text at
// 230 words a minute. Math takes longer than its length suggests, so each
// formula, diagram and theorem-like block adds a fixed time. Must run before
// remark-cite, which appends the reference list (not counted).
import { visit } from 'unist-util-visit';

const HAN = /\p{Script=Han}/gu;
const WORD = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;

const SECONDS = {
  han: 60 / 400,
  word: 60 / 230,
  inlineMath: 2,
  math: 12,
  environment: 8,
  codeLine: 2,
};

export default function remarkReading() {
  return (tree, file) => {
    let seconds = 0;
    let sections = 0;
    visit(tree, (node) => {
      switch (node.type) {
        case 'text': {
          const han = node.value.match(HAN)?.length ?? 0;
          const words = node.value.replace(HAN, ' ').match(WORD)?.length ?? 0;
          seconds += han * SECONDS.han + words * SECONDS.word;
          break;
        }
        case 'inlineMath':
          seconds += SECONDS.inlineMath;
          break;
        case 'math':
        case 'tikz':
          seconds += SECONDS.math;
          break;
        case 'code':
          seconds += node.value.split('\n').length * SECONDS.codeLine;
          break;
        case 'containerDirective':
          seconds += SECONDS.environment;
          break;
        case 'heading':
          if (node.depth === 2) sections++;
          break;
      }
    });
    const frontmatter = file.data.astro.frontmatter;
    frontmatter.readingMinutes = Math.max(1, Math.round(seconds / 60));
    frontmatter.sections = sections;
  };
}
