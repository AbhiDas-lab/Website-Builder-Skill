# website-review-build

An agent skill for reviewing and building marketing and content websites so they stay correct after launch.

A site does not stay correct because someone reviewed it once. It stays correct when every rule is an automated check, every check runs somewhere that can stop a bad deploy, and every check has been seen to fail. This skill teaches an agent to work that way.

It is written for Claude (Claude Code, Claude.ai, or the Agent SDK) using the Agent Skills format: a `SKILL.md` with reference files the agent reads only when it needs them. Nothing in it is tied to one framework, host or brand.

## What it does

The skill has two modes, and both use the same loop.

**Review.** Audit a live site, a branch, a single page, or an audit report a third party has sent you. The agent measures built output across every page and several widths, treats external findings as hypotheses to test, and reports a verdict, findings by severity with the measurement behind each one, and the claims that did not hold up.

**Build.** Start a new site, or add a page, feature, CMS collection or recurring content type to an existing one. The agent sets up check scaffolding before the first page: URL and host decisions, the deploy gates, security headers and a CSP, CMS schema checks, and a mobile and motion baseline.

The loop for every change:

1. Measure the built output, on every page.
2. Classify each finding as a defect, an owner's decision, or a deliberate choice.
3. Fix it at the source of truth.
4. Add a check that would have caught it, in a gate that can block the deploy if it must.
5. Break the real thing and watch the check fail.
6. Regenerate derived data and read the diff.
7. Ship, and confirm the live site serves the change.
8. Record it in a numbered ledger.

It covers SEO, accessibility (WCAG 2.2), performance, security and privacy, content and house style, responsive layout, CMS-edited content, and mobile, touch and motion.

## Install

### Claude Code

Clone into your personal skills folder so the skill is available in every project:

```bash
git clone https://github.com/AbhiDas-lab/Website-Builder-Skill.git ~/.claude/skills/website-review-build
```

Or into one project, so everyone working on that repository gets it:

```bash
git clone https://github.com/AbhiDas-lab/Website-Builder-Skill.git .claude/skills/website-review-build
```

The folder name should match the `name` in `SKILL.md` (`website-review-build`).

On Windows, a project inside a deeply nested or synced folder can push git past the 260-character path limit, and the clone fails with "Filename too long". Run `git config --global core.longpaths true`, or clone from a shorter path.

### Claude.ai and the Claude desktop app

Download the repository as a ZIP, make sure `SKILL.md` sits at the top level of the folder inside it, and upload it under Settings, Capabilities, Skills. Skills need to be enabled for your plan or organisation.

### Other agents

`SKILL.md` and the files in `references/` are plain Markdown. Any agent that can read files can follow them.

## Use

You do not need to name the skill. It triggers on requests such as:

- "Audit our website before launch."
- "Our SEO agency sent this report. Which of these should we act on?"
- "Is the contact page OK on mobile?"
- "We're building a microsite on Astro and Cloudflare. What should we set up first?"
- "Add a webinar banner the marketing team can update through the CMS."
- "Can we ship this branch?"

The agent reads the project's house profile (usually its `CLAUDE.md`) for site-specific rules: locale, punctuation, how the brand is written, trademarks, what is confidential. If there isn't one, it offers to start one from the template in `references/templates.md`.

## What's in the repository

| Path | Purpose |
| --- | --- |
| `SKILL.md` | The method: the loop, the deploy gates, how to write checks that hold, worst-case content, what an agent session cannot verify. |
| `references/audit-checklist.md` | The full check catalogue by area, each with the gate it belongs in and the pitfall that made it necessary. |
| `references/build-baseline.md` | Day-one setup for a new site. |
| `references/tooling-gotchas.md` | Browser, build, image and shell traps that make measurements lie. |
| `references/judgement-calls.md` | Things that look wrong and are right, and how to tell a defect from an editorial call. |
| `references/templates.md` | Ledger, review report, owner decision and house profile templates. |
| `scripts/title-width.mjs` | Pixel width of a page title as Google's desktop results render it. |
| `scripts/break-test.mjs` | Mutate a file, run a check, confirm it fails with the expected message, restore the file. |
| `evals/` | Three test prompts with assertions, plus a small fictional site to audit. |

## Scripts

Both need Node 18 or later and have no dependencies.

Measure a title against Google's roughly 600px desktop limit:

```bash
node scripts/title-width.mjs "Water testing and calibration · Example Labs"
```

See how much room a label has once a fixed brand suffix is paid for:

```bash
node scripts/title-width.mjs --budget " · Example Labs"
```

Confirm a check can actually fail. This lengthens a title in built output, runs the check, expects it to fail with a message containing "title", then restores the file and confirms the check passes again:

```bash
node scripts/break-test.mjs --file dist/index.html --find "<title>Home" --replace "<title>Home Home Home Home Home Home Home Home Home Home" --cmd "npm run verify" --expect "title"
```

Run `node scripts/break-test.mjs --help` for every option.

## Evals

`evals/evals.json` holds three scenarios: acting on a third-party SEO audit, planning a new microsite, and building a CMS-editable banner. Each has an expected outcome and a list of assertions to grade against.

The first scenario uses `evals/fixtures/`, a small built site for "Northfield Analytical Services" with deliberate faults, and an audit report about it that is partly wrong. The company, people, clients, partners, phone number and form id are all fictional. The domain uses the reserved `.example` top-level domain and the phone number is from Ofcom's range reserved for drama.

To run them by hand, start a session with the skill installed, paste each prompt from the repository root, and grade the answer against its assertions. The `skill-creator` skill can run them as a benchmark with and without this skill.

## Adapting it

Keep site-specific rules out of `SKILL.md`. Put them in the project's house profile, and turn each one into a check as you write it. The method stays the same across sites; the profile changes.

If you find a pitfall the checklist does not cover, add it under the right area in `references/audit-checklist.md` with the gate it belongs in and what went wrong without it.

## Licence

MIT. See [LICENSE](LICENSE).
