// The theme settings of lemma.config.mjs as modules for the layout:
// - virtual:lemma/tokens.css: the CSS custom properties (colors, font stacks,
//   layout) on :root, and the dark colors on :root[data-theme='dark'].
// - virtual:lemma/fonts: imports the font CSS listed in the config, in order.
// src/layouts/Base.astro imports both before the global stylesheet.

const TOKENS = 'virtual:lemma/tokens.css';
const FONTS = 'virtual:lemma/fonts';

// camelCase key to custom property: shadowRaised -> --shadow-raised.
const prop = (key) => `--${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
const block = (selector, scheme, values) =>
  `${selector} {\n  color-scheme: ${scheme};\n${Object.entries(values)
    .map(([key, value]) => `  ${prop(key)}: ${value};`)
    .join('\n')}\n}\n`;

/** @param {{ colors: { light: Record<string, string>, dark: Record<string, string> }, fonts: { stacks: Record<string, string>, imports: string[] }, layout: Record<string, string | number> }} theme */
export function tokensCss(theme) {
  const fonts = Object.fromEntries(Object.entries(theme.fonts.stacks).map(([k, v]) => [`font${k[0].toUpperCase()}${k.slice(1)}`, v]));
  return (
    block(':root', 'light', { ...fonts, ...theme.layout, ...theme.colors.light }) +
    '\n' +
    block(":root[data-theme='dark']", 'dark', theme.colors.dark)
  );
}

/** Astro integration. @param {Parameters<typeof tokensCss>[0]} theme */
export default function lemmaTheme(theme) {
  return {
    name: 'lemma-theme',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [
              {
                name: 'lemma-theme',
                resolveId: (id) => (id === TOKENS || id === FONTS ? id : undefined),
                load(id) {
                  if (id === TOKENS) return tokensCss(theme);
                  if (id === FONTS) return theme.fonts.imports.map((f) => `import ${JSON.stringify(f)};`).join('\n');
                },
              },
            ],
          },
        });
      },
    },
  };
}
