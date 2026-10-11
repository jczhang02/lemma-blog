---
name: Chengrui Zhang
description: A bilingual research blog on equations and models, read like a well-set paper.
colors:
  accent: "#b5532f"
  accent-dark: "#e08b66"
  paper: "#faf9f5"
  paper-dark: "#171715"
  ink: "#191917"
  ink-dark: "#e9e6de"
  muted: "#6b6a64"
  muted-dark: "#9c998f"
  rule: "#e6e3d9"
  rule-dark: "#2e2d29"
  surface: "#f2f0e8"
  surface-dark: "#201f1c"
  raised: "#fffefb"
  raised-dark: "#22211e"
  selection: "#ead9cc"
  selection-dark: "#4a3328"
typography:
  display:
    fontFamily: "Source Serif 4 Variable, Noto Serif SC Variable, serif"
    fontSize: "clamp(2rem, 5vw, 2.75rem)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Source Serif 4 Variable, Noto Serif SC Variable, serif"
    fontSize: "1.625rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Source Serif 4 Variable, Noto Serif SC Variable, serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.5
  body:
    fontFamily: "Source Serif 4 Variable, Noto Serif SC Variable, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.75
  statement:
    fontFamily: "Source Serif 4 Variable, LXGW WenKai Screen, serif"
    fontSize: "1.125rem"
    lineHeight: 1.75
  small:
    fontFamily: "Source Serif 4 Variable, Noto Serif SC Variable, serif"
    fontSize: "0.9375rem"
    lineHeight: 1.6
  label:
    fontFamily: "Inter Variable, Noto Sans SC Variable, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
  code:
    fontFamily: "JetBrains Mono Variable, ui-monospace, monospace"
    fontSize: "0.875em"
    lineHeight: 1.6
rounded:
  tick: "1px"
  focus: "2px"
  inline: "4px"
  button: "6px"
  block: "8px"
  card: "14px"
spacing:
  measure: "46rem"
  gutter: "1.5rem"
  sidenote: "15rem"
  sidenote-gap: "2.5rem"
  tap: "2.75rem"
components:
  preview-card:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "0.875rem 1rem"
    width: "min(26rem, 100vw - 1rem)"
  toc-card:
    backgroundColor: "{colors.raised}"
    rounded: "{rounded.card}"
    padding: "0.75rem 1rem"
    width: "19rem"
  code-block:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.block}"
    padding: "1rem 1.25rem"
  copy-button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "0.25rem 0.625rem"
  sidenote:
    textColor: "{colors.muted}"
    width: "{spacing.sidenote}"
  inline-code:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.inline}"
    padding: "0.1em 0.35em"
---

# Design System: Chengrui Zhang

## Overview

**Creative North Star: "The Typeset Notebook"**

A personal research blog (AI for PDE, and mathematics around it) in Chinese and English. Each post should read like a carefully typeset paper on a screen: serif text on warm paper, numbered sections and theorems, captions where print puts them, citations that resolve. The chrome around it is quiet sans-serif and stays out of the way. The look is clean and modern rather than antique: nothing imitates paper texture, and there are no ornaments.

Depth is minimal. The page is flat; only content that floats above it (TOC cards, link previews) is lifted, and all of it in the same way. Color is almost entirely neutral, with one terracotta accent for links and the current state.

**Key Characteristics:**
- Serif reading text, sans-serif chrome, a one-column 46rem measure.
- Warm paper and ink neutrals, one terracotta accent.
- Paper conventions where they help reading: numbered sections and theorems, booktabs tables, figure captions below and table captions above, AMS-style references, an abstract and keywords under the title.
- Supporting content shown in place: margin sidenotes, link preview cards, a tick-mark TOC with section cards.
- Every page works in light and dark, from 320px phones to wide screens.

## Colors

Warm, low-chroma neutrals carry everything; the accent is the only saturated color.

### Primary
- **Terracotta** (accent / accent-dark): links on hover, cross-reference and citation numbers, focus rings, the current state. Lighter in dark mode to keep contrast.

### Neutral
- **Warm Paper** (paper / paper-dark): the page background.
- **Ink** (ink / ink-dark): body text and headings.
- **Graphite** (muted / muted-dark): secondary text: dates, captions, sidenotes, metadata, counts. Meets 4.5:1 on paper in both themes.
- **Hairline** (rule / rule-dark): borders, rules above notes, table rules, inactive TOC ticks.
- **Vellum** (surface / surface-dark): code blocks, inline code, the BibTeX block, video placeholders.
- **Lifted Paper** (raised / raised-dark): the one floating surface (cards).
- **Highlight** (selection / selection-dark): text selection.

**The One Accent Rule.** Terracotta marks what is interactive or current, and nothing else: no accent backgrounds, no accent headings.

**The Readable Code Rule.** Syntax colors (Vitesse themes) are raised to 4.5:1 against Vellum at build time (`plugins/shiki-themes.mjs`); hue stays, lightness moves.

## Typography

**Body Font:** Source Serif 4 (with Noto Serif SC for Chinese)
**Statement Font:** LXGW WenKai Screen, Chinese theorem statements only (Latin stays Source Serif 4)
**Label Font:** Inter (with Noto Sans SC)
**Mono Font:** JetBrains Mono (the Nerd Font build when installed locally)

**Character:** A text serif with optical sizes for reading, a neutral grotesque for everything around it. Latin fonts come first in every stack, so English and digits never fall back to the CJK font.

### Hierarchy
- **Display** (500, clamp(2rem, 5vw, 2.75rem), 1.2): post titles.
- **Headline** (600, 1.625rem, 1.35): numbered section headings (h2); h3 at 1.25rem.
- **Title** (500, 1.25rem, 1.5): post titles in lists; the home tagline is 1.75rem serif.
- **Body** (400, 1.125rem, 1.75): article text, 46rem measure. Abstract and keywords 1rem / 0.9375rem, indented from both sides.
- **Small** (0.9375rem): captions, references, footnotes, tables, preview cards; sidenotes 0.875rem.
- **Label** (0.875rem sans): dates, post facts, footer, navigation.

**The Justify Rule.** Chinese body text is justified from 48rem up and ragged below that, and always ragged in sidenotes and cards. Latin text is never justified.

**The Spacing Rule.** Chinese and adjacent Latin words or digits are separated by a space (`2026 年 10 月 10 日 · 约 8 分钟 · 7 节`); UI copy uses ASCII punctuation.

## Layout

One centered column: the body is 46rem of text plus 1.5rem gutters. The header (avatar, wordmark, navigation) and footer share the column.

- **TOC** (72rem and up): a column of tick marks fixed in the left margin, one per h2/h3; the current section's tick is long and dark.
- **Sidenotes** (75rem and up, posts with footnotes): a 15rem column 2.5rem right of the text. The text stays centered while the right margin fits it (84rem and up); between 75rem and 84rem the page shifts left just enough, and the TOC moves with it. Notes align their first baseline with the reference and stack downward when they would overlap.
- **Below 75rem:** footnotes return to the end of the post. Below 72rem the TOC is hidden.
- **Overflow:** wide formulas, tables, diagrams and code scroll sideways inside the column, with an edge fade on the side that has more.

**The No Horizontal Scroll Rule.** At 320px nothing makes the page scroll sideways; only individual blocks do.

## Elevation & Depth

Flat by default. The only elevation is the floating card, used for TOC section cards and link previews, appearing on hover, focus or tap.

### Shadow Vocabulary
- **Raised** (`0 1px 2px rgb(25 25 23 / 0.06), 0 12px 32px -8px rgb(25 25 23 / 0.2)`): cards in light mode.
- **Raised, dark** (`0 0 0 1px rgb(255 255 255 / 0.07), 0 16px 40px -8px rgb(0 0 0 / 0.6)`): shadows barely read on dark, so a faint ring carries the edge.

**The One Floating Surface Rule.** Anything that floats uses Lifted Paper, the 14px radius and the Raised shadow. There is no second popover style.

## Shapes

Small, quiet radii that grow with the size of the thing: 1px TOC ticks, 2px focus rings, 4px inline code and video, 6px buttons, 8px code blocks, 14px floating cards, a circle for the avatar. Boxes are rare: tables use horizontal rules only (booktabs), notes get a short rule above them, and theorems are set by type, not by frames.

## Components

### Navigation
- **Header:** 32px circular avatar and serif wordmark on the left; sans links (Posts, language switch EN/中) and a sun/moon theme toggle on the right. Links are muted and turn terracotta on hover.
- **Footer:** © line, then Email, GitHub and RSS links; wraps to two rows at 320px.
- **Tap targets:** small text links get a 2.75rem hit area through padding and matching negative margins.

### TOC
- **Ticks:** 2px bars in Hairline, shorter for h3; the current one is full length in Ink.
- **Section card:** on hover or focus of a tick, a floating card with the section title (bold, one line) and its first paragraph (serif, muted, three lines).

### Link preview card
- **Trigger:** citations, `\ref` to sections, theorems, figures and tables, `\eqref`, and footnote references where no sidenote is shown. Opens after 200ms of hover, on keyboard focus, or on the first tap (a second tap follows the link).
- **Content:** a copy of the target; cut at 18rem with a bottom fade, then a "Jump" link (always shown on touch).
- **Style:** the one floating surface, 26rem wide at most, placed below the link or above it when that is the only fit.

### Sidenote
- **Style:** serif 0.875rem in Graphite, number in bold Ink; a reference and its note turn Ink/terracotta together on hover.

### Theorem
- **Head:** bold label and number (定理 2.2 / Theorem 2.2) with an optional name in parentheses. Statements of theorem-like kinds are in LXGW WenKai (Chinese) or italic (English); definitions and remarks stay upright. Proofs end with a right-aligned ∎.

### Figure and table
- **Captions:** small, centered while short, with a bold "图 1." / "Table 1." label; below figures, above tables. Line art can invert in dark mode.
- **Tables:** booktabs rules (1.5px top and bottom, a 1px rule under the header), no vertical lines.

### Code block
- **Style:** Vellum background, 1px Hairline border, 8px radius, JetBrains Mono.
- **Copy button:** top right; appears on hover or focus on pointer devices and always on touch (the code moves down to make room). Shows 已复制 / Copied for 1.5s.

### Post header
- **Order:** title; a sans meta line (date · reading time · sections, and "Read in English" on the right); the abstract, then keywords, both indented like a paper's.

## Do's and Don'ts

### Do:
- **Do** use the accent only for interactive or current things.
- **Do** keep every floating element on the one card style.
- **Do** check light and dark at 320, 390, 1280 and 1440px after a visual change.
- **Do** give every hover affordance a keyboard-focus and a touch equivalent.
- **Do** keep text at 4.5:1 or better in both themes, including code and secondary text.

### Don't:
- **Don't** add boxes, frames or background fills to theorems, notes or sections; set them with type and rules.
- **Don't** justify narrow columns or Latin text.
- **Don't** add vertical rules to tables.
- **Don't** add a second accent color or a second shadow style.
