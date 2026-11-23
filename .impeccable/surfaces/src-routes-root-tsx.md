---
version: 1
slug: "src-routes-root-tsx"
primary_target: "src/routes/__root.tsx"
related_targets: ["src/routes/index.tsx","src/routes/posts.$slug.tsx"]
---

## Scope

The blog's whole frame: home (post index and bio), post page (article, reactions, comments, newsletter), about page, 404. Mode: Read.

## Audience and job

Engineers and technical leaders read a post end to end; recruiters and Bidirekt prospects check who wrote it. Success: they read, subscribe, and leave knowing who Alef is.

## Constraints

User pinned: dev feel, dark, few colours, little animation, content first. Posts stay in English.

## Direction contract

THESIS: The blog is a demoscene title screen that holds still to be read: one bright line of type over an emissive black void, rank shown by brightness, never by boxes. It refuses the centred avatar-plus-cards dev blog.

OWN-WORLD: Emissive black #050505 ground, a static field of grey dust pinpricks behind the frame only, four ash-to-ivory neutrals, one signal amber used for the caret, the active item and focus. VT323 bitmap face for masthead, titles, numbering and labels; a calm sans (Hanken Grotesk) for the reading column; JetBrains Mono for code. No rules, cards or boxes: separation is space and brightness.

STORY: The visitor sees the name and one sentence of who he is, then the posts as numbered lines with the newest under an amber caret; reads the post in a calm column; reacts, comments, subscribes.

FIRST VIEWPORT: Home: top-left bitmap masthead ALEF CASTELO with a small links line right; the bio as one ivory sans paragraph at 60ch; then the index: each post a bitmap line #001 date title, description dim below, amber caret on the newest. Newsletter is a single prompt line at the end.

FORM: Cracktro Void (catalog challenger operate-c-cracktro-scroller-queue), chosen over the assigned Drawing Set; seed:b4ddd6d05a402cfb. Translated for the pin: no drifting layers, the dust field is static, the caret is the only motion and stops under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
