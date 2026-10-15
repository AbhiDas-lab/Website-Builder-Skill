---
name: website-review-build
description: A method for reviewing and building marketing and content websites so they stay correct after launch, distilled from a production site's audit history. Covers auditing an existing site or an external audit report (SEO, accessibility, performance, security and privacy, content style, responsive layout, CMS safety, mobile and motion), and building or changing a site so every rule is an automated check that runs where it can stop a bad deploy and has been seen to fail. Use this whenever the user asks to audit, review, QA or health-check a website or a page, sends an SEO or accessibility report to act on, plans or scaffolds a new site, microsite or landing page, adds a page, feature, CMS collection or event to a site, sets up build checks or CI for a site, or asks "is the site OK", "what's wrong with this page", "can we ship this", even when they don't say "audit".
---

# Reviewing and building websites that stay right

A site does not stay correct because someone reviewed it once. It stays correct when every rule is a check, every check runs somewhere that can stop a bad deploy, and every check has been seen to fail. Everything below serves that.

This is a method, not a brand guide. A site's own rules (its locale, punctuation, how it writes its name, partner trademarks, what is confidential, how contact details are shown) belong in a house profile for that project, usually its `CLAUDE.md`. Read the project's house profile before reviewing copy. If there is none, offer to start one (template in `references/templates.md`).

A house profile belongs to one site. Do not carry another project's rules, jurisdiction, timezone or brand into this one because they happen to be in your context. Ask for the locale, the legal jurisdiction (which privacy law applies), the timezone schedules run in and the audience, or state what you are assuming.

Two modes share one loop:

- **Review**: audit a live site, a branch, a page, or an external audit report someone has sent.
- **Build**: start a new site, or add a page, feature, CMS collection or recurring content type to an existing one.

## The loop, for every change

1. **Measure first, on built output, everywhere.** Build the site and read `dist/` (or the live site), every page, at several widths. A report that checked one URL misses the page where the real problem is. Treat any external audit as a set of hypotheses: in the project this method comes from, three of a report's four "must do" items failed measurement (it counted `alt=""` as missing, blamed card markup for anchors that came from two navs, and called present structured data absent).

2. **Classify what you found.** A *defect* gets fixed. An *editorial decision* (copy, layout trade-offs, a lone card in a grid's last row, which title wording to use) goes to the owner with measured options, not your preference. A *deliberate non-change* gets written down with its reason so the next reviewer does not reopen it. Read the code comment near anything that looks wrong before changing it; the reason is often there.

3. **Fix at the source of truth.** Never hand-edit generated files. Corrections that must survive regeneration go in a rules layer the generator applies, and that layer should throw if the text it anchors to disappears.

4. **Add a check that would have caught it**, in the right gate (next section), reading built output rather than a fixture. Then add a *control*: a nearby case that must not fire.

5. **Break-test the check.** Break the real thing (in source, or by mutating `dist/`), run the check, watch it fail with a useful message, restore, watch it pass. A check that cannot fail looks exactly like one that passes. If the mutation does not trip it, first confirm the mutation actually hit what the check reads, then fix the check. `scripts/break-test.mjs` does the mutate, run, restore cycle safely.

6. **Regenerate derived data and read the diff.** Image dimension tables, sitemap dates, search indexes and type files go stale silently. Drift you did not cause is real drift, not noise.

7. **Ship, and watch it land.** Find out what a push deploys before relying on it (on many hosts, a push to any branch is production). Branch, merge, push, then watch CI to the end and confirm the live site serves the change. Do not report success from a local build.

8. **Record it.** A numbered ledger row: what changed, why, which files, which check holds it. Record withdrawn findings and your own mistakes too. Format in `references/templates.md`.

## Gates: where each check lives

Most teams assume CI blocks a bad deploy. Often it does not: the host builds and deploys on push while CI runs alongside, and a CMS save triggers a deploy with no CI at all. Decide for each rule which gate it needs, and write that down next to the check.

| Gate | Blocks the deploy? | Put here |
| --- | --- | --- |
| **Build / postbuild** (runs in the host's build) | Yes | Anything that must never reach visitors: leaked secrets or personal data, banned punctuation or spelling, trademark form, whole email addresses, content too long for a fixed slot. Must be fast and need no browser. |
| **Static verify over `dist/`** (CI) | No | Links, titles, meta, structured data, sitemap, redirects, headers files, markup hygiene, counts, accessibility that can be read from HTML. |
| **Headless browser sweep** (CI) | No | Layout and overflow at many widths, truncation, target sizes, computed styles, behaviour (carousels, disclosures, embeds). |
| **Live check** (by hand, after dashboard changes) | No | What the deployed response actually carries, both directions: declared but not served, served but not declared. Dashboard rules can rewrite headers the repo never sees. |
| **Human on a real device** | No | Touch feel, sticky hover, iOS `:active`, safe areas, scroll and intersection behaviour. |

Two refinements:

- **Report, not failure, where failing would punish an editor.** If a CMS save produces something by construction (a fifth post in a four-card row, an upload at the wrong path), report it; a red build for a filing matter teaches people to ignore red builds. Language, leaks and bytes still fail.
- **Something CI catches that must never ship needs a build-time guard too.** If the browser sweep finds that over-long content breaks a layout, add a cheap build-time limit (characters, counts) so the bad version cannot deploy while CI is still running.

## How to write checks that hold

- **Read built output, not fixtures.** Checks that iterate a hand-kept list silently skip everything added later; in the source project, every CMS-authored blog post went unchecked that way. Drive structural checks off `dist/**/index.html`.
- **Read every reader-facing field**: body text, `<title>`, meta `content`, `alt`, `aria-label`, `title`, `placeholder`. Drift lives in the attributes nobody reads.
- **Compute, don't string-match.** Measure title width in pixels (`scripts/title-width.mjs`), compute contrast from the actual gradient alpha at the text's top edge, compare rendered geometry. A string match passes a different value with the same defect.
- **Check both directions.** File exists and page declares it; CMS config fields and content schema; headers declared and headers served; every source path in a mapping is actually tracked.
- **Match patterns, never paste the secret.** A blocklist of confidential terms that contains the terms is itself the leak. Pricing patterns need a figure beside the word so ordinary vocabulary passes.
- **Strip `<script>` and `<style>` before prose rules**, or JSON-LD `@type` and CSS `color` fail spelling checks. Check raw markup for punctuation, because shared text normalisers often rewrite dashes and spacing.
- **Measure coverage.** Instrument the assertion helper to record which assertions ran. One that never executes can never fail.
- **Leave slack.** Linux CI renders text 2 to 3% wider than Windows or macOS; a layout that fits by 1px locally fails in CI, and Android renders like CI. Leave 20px or more, and test the widths either side of every breakpoint, not only 375/768/1280.

## Worst-case content

Demo content is chosen, without anyone noticing, to look good. Before trusting any component that renders editable or future content (event slides, cards, breadcrumbs, titles, CMS fields), feed it plausible worst cases through the same data file the real content uses: the longest realistic name, a two-line subtitle, a count of 1, 3 or 5 against a grid of 2 or 4, a missing optional field, a title over the breadcrumb-split length. Do not commit the fixture. Then:

- what breaks visibly, fix in the component (let an optional line give way, wrap rather than truncate);
- what cannot give way, hold with a build-time limit and a clear error message;
- what is a design choice (orphan cards, a missing image), ask the owner.

In the source project this found text running 150px into a caption at every width and a breadcrumb dropping its space, neither visible with the real content of the day.

## What you cannot verify from an agent session

Agent and headless browsers render with `visibilityState` hidden: IntersectionObserver never fires, lazy images never load, animation timelines stay at zero. They will not scroll from a synthetic touch, and `focus()` in an unfocused document fires no focus events. So: never conclude anything about scroll-triggered behaviour, lazy loading or touch feel from a session. Stage the change, say plainly it is unconfirmed, and give the person one specific check to do (for lazy loading, an incognito window, because a normal reload paints from cache). More in `references/tooling-gotchas.md`.

## Review mode: what to deliver

Lead with the verdict. Then the findings, most severe first, each with the measurement behind it. Keep claims you could not reproduce out of the findings and in their own short list, with what you measured instead. Use the report format in `references/templates.md`. For every finding say which gate its check should live in. If the user asked only for a verdict, give it in a few lines and offer the full report.

When asked to act on a third-party audit, measure every claim before fixing anything, and report back which claims held, which did not, and what the audit missed.

## Build mode: what to set up

For a new site, set up the check scaffolding before the first page, because retrofitting it means auditing everything twice. `references/build-baseline.md` lists the day-one baseline: host and URL decisions (canonical form, duplicate origins off, 404 serving, immutable assets), the four check gates, security headers and CSP without `'unsafe-inline'`, CMS schema parity, the mobile and motion baseline, and the house profile.

For a new page or feature on an existing site, run the loop above, extend the existing checks rather than writing parallel ones, and run the worst-case pass on anything that renders editable content.

## Motion and touch, briefly

Default to less motion. Animate only where it gives feedback, keeps spatial continuity, shows a state change or hides a jarring change, and keep UI motion under 300ms. Reject scroll-reveal fades, counting numbers, marquees and entrance animations on every page view. Gate hover effects behind `(hover: hover) and (pointer: fine)`; give touch a `:active` press state; every motion needs a reduced-motion path and a fallback that shows content at once. Before proposing a transition between two things, confirm both things exist on both pages. Details in `references/audit-checklist.md` (Mobile, touch and motion).

## Reference files

Read the one you need, when you need it:

- `references/audit-checklist.md`: the full check catalogue by area (SEO, accessibility, performance, security and privacy, content style, layout, CMS, mobile and motion), each with what it catches, which gate, and the pitfall that made it necessary. Read before any review, and when adding checks.
- `references/build-baseline.md`: day-one setup for a new site. Read when starting or re-platforming a site.
- `references/tooling-gotchas.md`: tool and environment traps that cost hours. Read before trusting a browser measurement, image tooling, or a script with regex escapes.
- `references/judgement-calls.md`: decisions that look wrong and are right, and how to tell defects from editorial calls. Read before "fixing" something that seems odd.
- `references/templates.md`: ledger row, review report, owner decision, and house profile templates.

Scripts live in this skill's own `scripts/` folder, not in the project. Run them from there, or copy them into the project when you set up its checks; do not describe them as if a repository already has them. When you quote a measurement in a report, say how you got it. Node 18+, no dependencies:

- `scripts/title-width.mjs`: pixel width of a title in a Google desktop result, with a self-test against Chrome measurements. `node title-width.mjs "Page label · Brand" [--suffix " · Brand"]`.
- `scripts/break-test.mjs`: mutate a file, run a check command, confirm it fails with an expected message, restore the file whatever happens. Run with `--help`.
