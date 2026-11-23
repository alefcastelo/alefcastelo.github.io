---
name: Alef Castelo
description: A demoscene title screen that holds still to be read.
colors:
  void: "#050505"
  well: "#0e0e0d"
  ash: "#3a3833"
  muted: "#8f897c"
  text: "#d6d0c2"
  ivory: "#efe8d8"
  amber: "#ffb000"
typography:
  display:
    fontFamily: "VT323, ui-monospace, monospace"
    fontSize: "clamp(56px, 11vw, 136px)"
    fontWeight: 400
    lineHeight: 0.85
    letterSpacing: "0.04em"
  headline:
    fontFamily: "VT323, ui-monospace, monospace"
    fontSize: "clamp(44px, 7vw, 72px)"
    fontWeight: 400
    lineHeight: 0.92
  title:
    fontFamily: "VT323, ui-monospace, monospace"
    fontSize: "44px"
    fontWeight: 400
    lineHeight: 0.95
  section:
    fontFamily: "VT323, ui-monospace, monospace"
    fontSize: "32px"
    fontWeight: 400
    lineHeight: 1
  label:
    fontFamily: "VT323, ui-monospace, monospace"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1
  body:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.75
  body-small:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  code:
    fontFamily: "JetBrains Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  none: "0px"
spacing:
  gutter-mobile: "16px"
  gutter-desktop: "40px"
  stack-sm: "12px"
  stack-md: "48px"
  stack-lg: "80px"
  stack-xl: "96px"
  frame: "1120px"
  column: "680px"
components:
  command:
    backgroundColor: "{colors.well}"
    textColor: "{colors.ivory}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.45rem 0.9rem"
  command-hover:
    textColor: "{colors.amber}"
  command-disabled:
    textColor: "{colors.muted}"
  quiet:
    textColor: "{colors.muted}"
    typography: "{typography.body-small}"
  quiet-hover:
    textColor: "{colors.ivory}"
  field:
    backgroundColor: "{colors.well}"
    textColor: "{colors.ivory}"
    rounded: "{rounded.none}"
    padding: "0.6rem 0.75rem"
  reaction:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "6px 12px"
  reaction-active:
    backgroundColor: "{colors.well}"
    textColor: "{colors.amber}"
  index-entry:
    textColor: "{colors.ivory}"
    typography: "{typography.title}"
  index-entry-hover:
    textColor: "{colors.amber}"
---

# Design System: Alef Castelo

## Overview

**Creative North Star: "The Cracktro Void"**

The blog is a demoscene title screen that holds still to be read: bright bitmap type over an emissive black void, with rank carried by brightness and never by boxes. A static field of grey dust pinpricks sits behind everything at two densities, in tile sizes chosen so no grid shows. The only thing that moves is a blinking amber block caret.

Two voices share the screen. VT323, a bitmap face, speaks for the frame: the masthead, titles, numbering, dates, labels, commands and counters. Hanken Grotesk carries everything meant to be read at length, in a calm column. JetBrains Mono appears only inside code. The scene does not translate into the reading column: no scrolling, drifting layers or palette cycling there.

Density is low. Wide vertical gaps separate the parts, and the reading column stops at 680px inside a 1120px frame. Nothing has a rule, a border or a rounded corner. A part is separated from the next by space, or set on a slightly lifted well.

**Key Characteristics:**
- Emissive black ground with a static, irregular dust field fixed behind the frame.
- One signal color, amber, reserved for the caret, the item under the pointer, focus and selection.
- Bitmap face for the frame, calm sans for reading, mono for code.
- Square everything: zero radius, zero borders.
- One motion: a stepped caret blink that stops under reduced motion.

## Colors

The palette is a black void, five dust neutrals that climb from near-black to ivory, and one signal amber.

### Primary
- **Signal Amber** (`amber`): the single accent. It fills the block caret, draws the focus outline, fills text selection, colors the text caret, and is the hover color of every link, title and command. It also marks the reader's own reaction and a comment counter that is over the limit. It never fills a surface larger than a caret block.

### Neutral
- **Emissive Void** (`void`): the page ground under the dust field, and the text color on amber or ivory fills.
- **Well** (`well`): the one lifted surface. Commands, text fields, inline and block code, the active reaction, avatars without a photo and the account menu sit on it.
- **Ash Dust** (`ash`): decorative only. It is the 404 numeral, the idle prompt block of the subscribe line and the scrollbar thumb. The dust pinpricks are drawn in tones around it (#24231f to #3a3833).
- **Dim Dust** (`muted`): secondary text such as post descriptions, dates, numbering, header links, placeholders, list markers, blockquotes and disabled commands.
- **Paper Dust** (`text`): body copy in the reading column and the home bio.
- **Ivory** (`ivory`): the brightest neutral. It is used for the masthead, titles, headings, strong text, link text, field input and command labels.

### Named Rules
**The Brightness Is Rank Rule.** Hierarchy is carried by stepping a line up the neutral ramp (muted, then text, then ivory) before reaching for size or a container.

**The One Signal Rule.** Amber marks something live: the caret, focus, the pointed-at item or the reader's own state. If it isn't live, it isn't amber.

**The Ash Is Not Ink Rule.** Ash never carries text that has to be read. Only aria-hidden ornaments and scrollbar chrome use it.

## Typography

**Display Font:** VT323 (with ui-monospace, monospace)
**Body Font:** Hanken Grotesk (with ui-sans-serif, system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, SF Mono, Menlo, monospace), for code only

**Character:** a hard-edged bitmap face that frames the page, paired with a quiet grotesque that gets out of the way of the writing.

### Hierarchy
- **Display** (VT323 400, clamp(56px, 11vw, 136px), 0.85, 0.04em, uppercase): the home masthead only.
- **Headline** (VT323 400, clamp(44px, 7vw, 72px), 0.92, balanced): the post title.
- **Title** (VT323 400, 36px mobile to 44px desktop, 0.95): an index entry. It is preceded by a muted 22–26px run with the zero-padded number and the date.
- **Section** (VT323 400, 32px, 1): the headings for Comments and the newsletter. Prose h2 and h3 use the same face at 2.125rem and 1.625rem, line-height 1.1.
- **Label** (VT323 400, 20–28px, 1): header links (lowercase, muted), the small off-home masthead link (uppercase, 0.08em tracking), the post date, commands, reaction counts and the comment counter.
- **Body** (Hanken Grotesk 400, 1.125rem, 1.75): the reading column. The bio uses the same size at 1.625 and is capped near 58ch. Post descriptions use the base size, are capped at 64ch and are muted. Strong text is 600 in ivory.
- **Body Small** (Hanken Grotesk 400, 0.875rem): comment metadata, quiet actions, status and alert lines.
- **Code** (JetBrains Mono 400, 0.95rem in blocks, 0.85em inline, ivory on well).

### Named Rules
**The Two Voices Rule.** VT323 frames the page and Hanken Grotesk is read. A paragraph is never set in the bitmap face, and a title or label is never set in the sans.

**The Single Weight Bitmap Rule.** VT323 is used only at 400. Emphasis in the frame comes from size, case and brightness.

## Layout

The page is one left-aligned frame (max 1120px) with a 16px side gutter on mobile and 40px from the sm breakpoint (640px) up. The top padding is 24px on mobile and 40px on desktop. The header row puts the masthead link at the left (it is replaced by an empty slot on the home page, where the display masthead leads the content) and the bitmap links line at the right. Content starts 56px below the header on mobile and 96px below on desktop.

The home page stacks the masthead, the bio, the index (80px on mobile and 112px on desktop below the bio, with 48px between entries) and the newsletter line (96px below, capped at 680px). An index entry is a two-column grid: a caret gutter (1.25rem on mobile, 1.75rem on desktop) and the text.

A post is a single 680px column. The title and date come first, then the prose 48px below, then the author aside, reactions, comments and the newsletter, separated by 64–80px. Inside the prose, siblings are spaced 1.25em apart and headings sit 2em above their content. Replies are indented 44px under their parent.

## Elevation & Depth

The system is flat. Depth comes from tone: the void is the ground, and the well is the single raised plane. The dust field is fixed to the viewport, so the content scrolls over it, which is the only sense of layering on the page. One shadow exists, on the account menu, a popover that has to float over the content beneath it.

### Shadow Vocabulary
- **Popover lift** (`box-shadow: 0 12px 32px rgb(0 0 0 / 0.7)`): only on a menu that overlays content.

### Named Rules
**The Tone Not Shadow Rule.** A surface is raised by sitting on the well. Shadows are reserved for an overlay that floats above other content.

## Shapes

Every corner is square (0px) and no element carries a border. The recurring silhouette is the block cell: the amber caret is 0.5em × 0.8em, the subscribe prompt is the same block in ash that turns amber on focus, and the ERR alert tag is a reversed ivory cell. Avatars and the author photo are square. Section breaks in prose are a row of dim 1px dots, not a line.

## Components

### Buttons
Commands that light up when they can act.
- **Shape:** square (0px), no border.
- **Command:** a VT323 label at 1.375rem on the well, ivory text, padding 0.45rem × 0.9rem.
- **Hover / Focus:** the label turns amber, with no fill change. Focus is the global 2px amber outline, offset 3px.
- **Disabled:** the label dims to muted.
- **Quiet:** a secondary action set in small muted sans, underlined with a 4px offset, that brightens to ivory on hover.

### Chips
- **Reaction:** an emoji plus a VT323 count at 24px with padding 6px × 12px, muted on the void. On hover it sits on the well. When the reader has reacted, it stays on the well with an amber count.

### Inputs / Fields
- **Field:** the comment textarea, ivory text on the well, padding 0.6rem × 0.75rem, muted placeholder, square.
- **Prompt line:** the newsletter input has no fill. It is a VT323 line led by an ash block that turns amber while the form has focus, and it ends in an ivory `> Subscribe` command whose chevron is amber.
- **Focus:** the 2px amber outline. The prompt line instead signals focus by lighting its block.
- **Error:** the alert pattern below.

### Navigation
- **Header:** lowercase VT323 links in muted at 20–22px that turn amber on hover. Off the home page, an uppercase ivory masthead link sits at the left. A signed-in reader gets a square 36px avatar button that opens the well menu.

### Index Entry (signature)
A numbered bitmap line, `#001 date`, in muted before the title in ivory, with a muted sans description below. The amber block caret sits in the left gutter of the newest entry and moves to whichever entry is hovered or focused. The title turns amber under the pointer.

### Alert (signature)
A failure is a reversed glyph cell and not a red line. An `ERR` tag in VT323, void on ivory, precedes ivory small text. The system has no red.

## Do's and Don'ts

### Do:
- **Do** separate parts with space and brightness steps: 48px between index entries, and 64–96px between post sections.
- **Do** put a raised control on the well (`#0e0e0d`) instead of drawing a box around it.
- **Do** reserve amber for the caret, focus, selection, hover and the reader's own state.
- **Do** stop the caret blink under `prefers-reduced-motion: reduce`.
- **Do** keep reading text in Hanken Grotesk at 1.125rem / 1.75 inside a 680px column.

### Don't:
- **Don't** add borders, rules or rounded corners. The only line-like mark is the dotted break in prose.
- **Don't** introduce a second accent or a red error color. Failures use the reversed ERR cell.
- **Don't** animate anything other than the caret, and don't make the dust field drift.
- **Don't** set ash (`#3a3833`) on text that must be read.
- **Don't** set paragraphs in VT323 or use it above weight 400.
