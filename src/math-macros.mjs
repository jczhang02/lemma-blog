// Site-wide TeX macros, available in every post.
// A string is a macro without arguments; [body, n] takes n arguments;
// [body, n, default] makes the first argument optional.
// Per-post macros go in the post's frontmatter under `macros`, same format.
export default {
  N: '\\mathbb{N}',
  Z: '\\mathbb{Z}',
  Q: '\\mathbb{Q}',
  R: '\\mathbb{R}',
  C: '\\mathbb{C}',
  F: '\\mathbb{F}',
  eps: '\\varepsilon',
  id: '\\operatorname{id}',
  Hom: '\\operatorname{Hom}',
  End: '\\operatorname{End}',
  Aut: '\\operatorname{Aut}',
  Spec: '\\operatorname{Spec}',
  im: '\\operatorname{im}',
  coker: '\\operatorname{coker}',
  set: ['\\left\\{ #1 \\right\\}', 1],
  inner: ['\\left\\langle #1, #2 \\right\\rangle', 2],
};
