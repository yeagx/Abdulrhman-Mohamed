# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

static HTML/CSS/vanilla JavaScript; no framework and no build step

## Users

Primary users are recruiters, hiring managers, and technical peers evaluating Abdulrhman Mohamed Gomaa for data engineering, analytics, and software roles. The site is also used by clients or collaborators who want to contact him quickly and review concrete project work.

## Product Purpose

This portfolio exists to present Abdulrhman as a Computer Science graduate building a career in data engineering, while making it easy to understand his background, training, projects, and contact details. Success means a visitor can quickly assess his technical direction, evidence of work, and whether to reach out.

## Positioning

The product is a personal portfolio with a strong technical identity: a hand-built, schematic/engineering-inspired presentation rather than a generic personal website. Its differentiator is the combination of data-focused narrative, project evidence, and a custom interface designed to feel like a technical drawing or blueprint.

## Operating Context

The portfolio is a static web site served as plain files, intended to run without a framework or package install. It is used in a browser, usually from desktop or mobile, and content is maintained primarily in the data file that drives the page. The site includes contact functionality through a public form service and a public YouTube feed that is proxied client-side.

## Capabilities and Constraints

- Single-page portfolio experience with sections for background, current work, projects, toolkit, training, and contact
- Static hosting is the default model; no build pipeline is required
- Content is centralized in js/data.js and rendered by vanilla JavaScript
- Contact form depends on a public Web3Forms access key to send messages
- YouTube section uses a CORS proxy and a fallback video when the feed is unavailable
- Project content and training history are factual records that should remain accurate and current
- The portfolio is not a SaaS product or CMS-backed app; it is a personal portfolio site

## Brand Commitments

The project explicitly presents Abdulrhman as a data engineer with a technical, engineering-inspired aesthetic and a personal brand built around data, analytics, and systems thinking. The site name, profile details, links, and written narrative are treated as confirmed identity content.

## Evidence on Hand

- README.md: project setup, hosting instructions, and portfolio content editing guidance
- index.html: current structure and interface composition
- js/data.js: source of truth for profile, projects, tools, training, contact configuration, and portfolio content
- CSS/base.css and CSS/sections.css: incumbent visual system and layout language
- CV.pdf: downloadable résumé asset
- Images/: profile photo, icons, and card assets
- README.md states the site is built in plain HTML, CSS, and vanilla JavaScript with no package installation required

## Product Principles

1. Technical credibility before polish: the portfolio should communicate real work and learning, not only aesthetics.
2. Clear, direct evaluation: visitors should understand the person, their direction, and their evidence quickly.
3. Trust through concrete detail: projects, training, and tool usage anchor the personal brand in real experience.
4. Engineering-inspired presentation: the interface should reflect systems thinking and technical craft without sacrificing clarity.
5. Lightweight deployment: the site should remain easy to host and maintain as a static portfolio.

## Accessibility & Inclusion

The project includes standard static web accessibility considerations such as semantic sections, alt text, and responsive layout patterns. No product-specific accessibility requirement beyond general web accessibility was confirmed in the repository, but the site should preserve readable contrast, robust form labels, and mobile usability.
