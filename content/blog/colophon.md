---
layout: post.njk
title: Colophon
description: Behind the scenes — the tools, workflows, and components used to write, assemble, and publish this blog.
permalink: /colophon/index.html
---

# Colophon

> *Behind the scenes — the tools, workflows, and components used to write, assemble, and publish this blog.*

This page is intentionally short today. What is listed below is **what is actually in use right now** to write and ship these posts. Over time, as I release the components, prompts, and methods I use as open source, this page will grow into a full inventory: not only the *publishing* system, but how the underlying *content* gets researched, drafted, listened-into, edited, and assembled before it ever reaches the publisher.

If you are reading this and the page is still short, that is honest, not a bug. Inspired in spirit by [Simon Willison's colophon](https://tools.simonwillison.net/colophon).

---

## Bespoke Tools & Methods

| Method / Tool | Status |
|---|---|
| Deep Listening methodology and agents | Coming soon at [DeeperListening.AI](https://DeeperListening.AI/) |

## AI development tools

| Tool | Role |
|---|---|
| Cursor | AI-native code editor. Where the writing, editing, and template work happens. |
| Claude Cowork | Anthropic's AI assistant. Used as a drafting partner, editor, and reviewer, and filesystem speleunker, context & intent gatherer. |
| Opus 4.7 | The specific Claude large language model (LLM) by Anthropic in active use for the co-writing on this site. |

## Development environment

| Tool | Role |
|---|---|
| Cursor | Primary editor (see above). |
| Git | Version control for every word and template change. |
| GitHub | Where the repository lives. |

## Static site generation

| Tool | Role |
|---|---|
| Eleventy (11ty) | Static site generator. Takes the markdown in `content/blog/` and turns it into the HTML you are reading. |

## Deployment & hosting

| Tool | Role |
|---|---|
| GitHub Pages | Serves the built site. |

## Community & engagement

| Tool | Role |
|---|---|
| *(to come)* | Components for community engagement will be listed here as they are released as open source. |

## SEO & marketing

| Tool | Role |
|---|---|
| *(to come)* | Components for distribution and discoverability will be listed here as they are released as open source. |

---

## What this page will become

The deeper purpose of this colophon is to make the *production process* of the writing itself legible — not only the publishing chain. As I release them, expect entries on:

- the listening-and-capture method that produces the raw material of these essays;
- the prompts, rubrics, and `.context/` artifacts used to draft, critique, and revise them;
- the workflow scripts (post staging, draft pools, the blog-publish loop) that move a piece from a working note to a published post;
- the editorial discipline of working with a model like Claude Opus 4.7 in a way that preserves voice rather than flattening it.

Each piece will land on this page as it goes open. **If a tool is named here, it is in use today. If it is not named, it either does not exist yet or has not been released yet.**
