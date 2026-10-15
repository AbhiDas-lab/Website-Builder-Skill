# Audit checklist

Every check here exists because its absence let something through on a real site. Gate key:

- **[P]** build or postbuild: fails the deploy
- **[S]** static check over built HTML (CI)
- **[B]** headless browser sweep (CI)
- **[L]** live response, by hand
- **[D]** a human on a real device

The pitfalls are the valuable part. They are how a reasonable-looking check ended up passing a broken page.

## Contents

1. SEO
2. Accessibility
3. Performance
4. Security and privacy
5. Content and house style
6. Layout and responsive
7. CMS-edited content
8. Mobile, touch and motion

---

## 1. SEO

**Title width in pixels [S].**
- Google cuts desktop titles at about 600px of 20px Arial, and character counts mislead: 45 characters measured 416px, while 61 characters measured 589px.
- Measure with `scripts/title-width.mjs`.
- Put the label first (`Label · Brand`) and design the label to `600 − suffix width`.
- Pitfall: a 60-character rule let an 82-character title through, and a character-based rule is how "INTERNATIONA" shipped cut off.

**Search title vs breadcrumb label [S].**
- If breadcrumbs derive from `<title>`, a search-tuned title changes the trail.
- Assert both directions: where a page overrides its search title the two differ, and everywhere else they are equal.
- Delete stale exemptions.

**Meta description length [S].**
- 100 to 155 characters, measured after decoding entities.
- Under about 70 characters, Google tends to rewrite it.
- Legal pages and the 404 are exempt.
- Pitfall: an audit measured descriptions with the title font and reported them all too long.

**Canonical and trailing slash, as one decision [S].**
- The canonical form must be what the origin serves without a redirect.
- Pitfall: a host's default slash handling added a 307 hop to every internal link (thousands of them, about 5x slower each).

**Duplicate origins [S].** Hosts often expose a preview or `*.workers.dev`-style copy by default when the setting is absent. Assert the setting is explicitly off.

**Sitemap [S].**
- Every `<loc>` resolves to a built page.
- `lastmod` comes from the files the copy actually lives in, not the build time. A date that changes every deploy teaches Google to ignore it.
- CMS posts take their date from frontmatter, and future-dated posts carry none.
- Pitfall: a route's date came from a list of source files, and a file the date tracker did not know about was silently skipped. The output stayed valid XML with the wrong date, so assert that every mapped source is tracked.

**Structured data [S].**
- JSON-LD carries no raw `<`. Escape it, so a `</script>` breakout is detectable exactly.
- Keep one Organization node, referenced by `@id`.
- Render BreadcrumbList from the same source as the visible trail, and assert they match name for name.
- A byline in schema must be visible in prose and agree with the meta.
- Check shape, not truthiness: `areaServed` is a Country node, not the string `'GB'`.
- Do not add Product schema without price or reviews, or VideoObject for click-to-load embeds Googlebot cannot see.
- Pitfall: an author check matched the name inside the JSON-LD itself and could never fail until `<script>` was stripped first.

**Legacy redirects [S].**
- Build the list from the Wayback Machine CDX index and from Search Console's 404 report. Neither is complete alone.
- Every rule is a 301, its target exists, and the target does not itself redirect.
- Every non-comment line has exactly three fields.
- Pitfall: an inserted rule glued onto a comment line was silently ignored.
- Discontinued items go to the honest category page.

**404 [S].**
- Needs both halves: the built page, and host config that serves it with a 404 status. One host returned an empty 404 body until configured.
- Mark it noindex, and make every link on it resolve.

**Internal links [S, fail].**
- Resolve every href after stripping the query and fragment, including PDFs, the favicon, the manifest and the feed.
- Controls: `/contact?x=1` must pass.
- A link from a published page to a scheduled post is invisible to a `dist` check, so check it at source.

**Icons and manifest [S].**
- A missing `/favicon.ico` or touch icon 404s into a full HTML page.
- Maskable icons need their own safe-zone artwork.
- Assert both directions: the file exists, and the page declares it at the right size.
- og:image is PNG or JPEG. Social scrapers do not reliably render WebP or SVG.

**Feed [S].** Exactly the published posts, nothing scheduled, and well-formed XML.

**Headings [S].**
- The `<h1>` is never styled smaller than the headings under it.
- Footer column headings that outnumber the content headings belong in `<nav aria-label>` landmarks instead.

**robots.txt [S].**
- Your own directives, plus an absolute sitemap URL.
- Hosts may prepend a managed block; leave it alone.

## 2. Accessibility

**Target size, WCAG 2.2 SC 2.5.8 [B].**
- Test at every viewport, applying both exceptions:
  - **Spacing:** a 24px circle centred on the target touches no other target.
  - **Inline in prose:** the nearest block holds words, not just separators.
- Skip targets covered by another element, and content inside a closed `<details>`. Chromium still lays that content out, which produced dozens of false failures.
- This check took four rounds before it could be trusted. Break-test it.

**Contrast, including over images and scrims [S/B].**
- Parse the gradient, take the alpha at the glyph box's top edge (measured, not guessed), composite over the real background, and compute the ratio.
- Pitfall: a photo-style dark scrim over cut-out images on white put white 12px text on light grey.
- Pitfall: 17px bold is not "large text". Large starts at 18.66px bold.

**Focus visibility [S].** A stretched link filling an `overflow:hidden` card has its outline clipped away. Use a negative `outline-offset`, and assert it.

**Accessible names [B].**
- Measure with `dom-accessibility-api` using the browser's computed `display`, not an agent's accessibility tree, which may name only direct text children.
- Put a whitespace text node between inline spans, so names do not depend on CSS.
- An `aria-label` overrides visible text and drifts from it.
- `alt=""` beside a visible label is correct (WCAG technique H67).
- Information graphics need alt text describing what they show. Read this off built pages, so CMS uploads are covered.

**`aria-hidden` [S].** A name check must strip aria-hidden subtrees first. Decorative glyphs inside a link, such as a ™ or an arrow, otherwise get announced.

**Keyboard parity.**
- Anything that reacts to the pointer reacts to focus too.
- A carousel or slideshow pauses while keyboard focus is inside it.

**Carousels, WCAG 2.2.2 [B].**
- Provide a pause control.
- Never auto-advance under reduced motion.
- The timer holds while the pointer or keyboard focus is inside, without changing the visitor's own play or pause choice.
- A dot, a swipe or a keyboard move into a hidden slide counts as the visitor taking over, and stops the timer.

**User preferences [B].**
- `prefers-reduced-motion`.
- `prefers-reduced-transparency`: translucent sticky headers go solid.
- Test each by emulating the media feature, reading after transitions finish, and including a control read without the setting, so the check can fail.

**Brand casing under `text-transform` [B].** An uppercase eyebrow destroys a mark's casing ("iPhone" becomes "IPHONE", "eBay" becomes "EBAY"), and only computed style shows it. String checks pass because the HTML is right.

## 3. Performance

**Layout shift [B].**
- Measure real boxes, not just missing `width`/`height` attributes.
- Pitfall: a `height` attribute beat CSS `aspect-ratio` and rendered an image at full height inside a 16:10 slot.

**Lazy loading [S].**
- Allowed only where the parent gives the image a box before it loads. An image with no box never intersects the viewport, so it never loads.
- Keep the first N images eager, with N measured at phone and desktop widths.
- Use `fetchpriority="high"` on the first hero only.
- A carousel uses one `<img>` with a swapped `src`, because `display:none` plus lazy never loads.

**Byte caps as tripwires [S].**
- Set the hero cap at a few times the median image.
- Cap per frame of a slideshow, not per post, because a reader pays per frame.
- Size images to 2x the slot they paint.
- Never write an optimised output larger than its input.

**Immutable caching [L].**
- Replacing a cached asset needs a new filename. A query string may not bust the cache.
- Check what status codes inherit the immutable header. 404s under an immutable path were cached for a year until an edge rule set `no-store` on 4xx.

**Header rules [L].**
- Some hosts merge header rules rather than letting the most specific win.
- Pitfall: a duplicated `Cache-Control` silently disabled caching, and a rule scoped to `/index.html` matched only the home page.
- Verify the served headers live.

**Render-blocking CSS budget per page [S].** A budget of about 1.5x the heaviest current page catches a heavy import landing in the shared layout.

**Fonts [P/S].**
- Subset only the display or label font, with a build check that every character on every built page is covered.
- Never subset the body font that carries CMS text.
- Preload with `crossorigin` even for same-origin fonts, or the file downloads twice.

**Third parties.**
- Load the bot-check widget on the first `focusin` or `pointerdown` inside the form. Both triggers are needed, because autofill can skip focus.
- Video and map embeds are click-to-load. While the frame loads, keep the poster and fade the frame in.
- Self-host artwork rather than hotlinking signed CDN URLs, which expire into blank boxes.

**Unpublished assets [P].**
- Prune scheduled posts' assets in postbuild.
- An orphan-asset sweep cannot see a file that a data entry points at but no page renders.

## 4. Security and privacy

**CSP without `'unsafe-inline'`.**
- Framework islands that hydrate from inline script build, deploy, and are then blocked in the browser. Emit external module scripts instead.
- [S] Every embed origin used is in `frame-src`. Remove unused origins by hand, because the check is one-directional.
- Do not add `strict-dynamic` to a host allowlist, because it voids the hosts.
- COEP breaks third-party thumbnails.

**Security headers file [P, warn].** Strip comments before scanning, because prose comments name every header.

**Secrets.**
- Secrets live as host secrets, never in the repo.
- [S] Form endpoint ids and keys never appear in `dist`.

**Bot protection.**
- Verify tokens server-side, with `siteverify` plus a hostname allowlist.
- A provider's own "enforced" toggle accepted a random string as a token. Test with a forged token.
- Answer a filled honeypot with a fake success.
- A server-side fetch sends no Referer, Origin or User-Agent, so forward them, or the first real enquiry lands in spam.

**Email harvesting [P].**
- No whole address in any built text file, including JS, XML and JSON.
- No `mailto:` in HTML. Assemble the link with script.
- Exempt `.well-known/security.txt`, whose `Contact` must be a real URI.

**Pasted URLs.**
- Strip everything from the `?`. LinkedIn share links carry the sharer's encoded member id in `rcm=`.
- Store video ids, not whole pasted links.

**Confidential data [P].**
- Use regex patterns, never the literal values. A first version pasted the very personal data it protected into a committed file.
- Read `dist`, not source, so provenance comments may name what was excluded.
- Controls must pass: "An annual maintenance contract is available on request" contains a pricing word but no price.

**CMS markdown [P].** Sanitise it at build, for example with `rehype-sanitize`.

**Dependencies.**
- Pin advisories with `overrides`.
- Never run `audit fix --force`, which can jump major versions.

**Legal pages [S].**
- A text change without a date change fails.
- Compare clauses in full. A 60-character prefix check let a disclaimer's meaning flip with a green build.
- The privacy policy matches the form's actual fields and processors.

**Analytics claims [L].** Verify with a browser user agent. Some edges inject analytics only for browser-like requests, so plain `curl` shows none.

## 5. Content and house style

The rules come from the project's house profile. These are the enforcement lessons.

**Punctuation and spelling [P].**
- Check raw HTML plus `<title>`, meta `content`, `alt`, `aria-label`, `title` and `placeholder`.
- Match spelling case-insensitively. A case-sensitive rule let every capitalised Americanism through for weeks.
- Match brand casing case-sensitively, because casing is what it guards.
- Strip `<script>` and `<style>` first.

**Trademarks and third-party marks [P].**
- The owner's styling and symbol on every occurrence the house profile requires, including attributes.
- Use word boundaries so longer words starting with a mark pass.

**Quoted owner text keeps its own spelling.**
- Document titles, slogans and partner excerpts are exempted by exact string, so a stray instance elsewhere still fails.
- Your own posts are not exempt.

**Consistency [S].**
- One label per action. All contact buttons say the same thing.
- Recompute hand-typed counts ("9 partners") from the rendered cards.
- Catch contradictory status claims with narrow patterns.

**Copy must be in HTML to be checked.** Copy inside a JS bundle escapes every check. Keep static copy on the page.

**Markup hygiene [S].**
- No duplicate `class`, `style` or `id` attributes. The browser keeps the first one.
- No custom property that is a colour in one file and a length in another. Text silently fell back to black.
- Grids collapse with `minmax(0,1fr)`, not a bare `1fr`, which cannot shrink below its content.

## 6. Layout and responsive [B]

**Overflow at 375, 768 and 1280, measuring both edges.**
- `scrollWidth` cannot see content pushed off the left of the page.
- Skip content inside x-scrolling containers.

**Ellipsis truncation.** Check at every viewport plus 320px. Truncation is not overflow, so the overflow check cannot see it.

**Breakpoint bands.**
- Add widths either side of every breakpoint.
- Pitfall: a stat wrapped from 861 to 1100px, and the nav folded from 1101 to 1130px, all between the standard sweep widths.

**Cross-OS slack.**
- Linux CI and Android set text 2 to 3% wider than Windows.
- Leave 20px or more. Never ship something that fits by a few pixels locally.

**Worst-case content.**
- Run the pass in SKILL.md on any component that renders editable content.
- Pitfall: a flex item under `white-space: nowrap` drops its leading space, so split labels ran together.

**Tall media.** Cap slides with `max-height` and `width:auto`, which scales rather than crops. A cropped photo still looks like a photo, so nobody reports it.

**Orphans.** Count cards against columns at each width, then ask the owner. It is a design decision.

## 7. CMS-edited content [S unless noted]

Treat the CMS as an untrusted author whose saves deploy.

**Schema parity, both directions.**
- A field the content schema rejects means the CMS saves and the next build fails.
- A field the CMS config omits is uneditable, and the CMS may delete it on the next save. In a single-file collection that deletes the key from every entry.

**No `required` on a field existing entries lack.** The CMS will refuse every save to those entries, even a typo fix elsewhere.

**Media roots.**
- The first root is often the default for fields that name none.
- Uploads keep their own filenames, so normalise them.

**Fallbacks.**
- Overlay files fall back field by field to generated data, so deleting a CMS file cannot blank a page.
- Seed scripts refuse to overwrite without `--force`.

**Schedules.**
- Compare scheduled dates in the editor's timezone, not the build machine's UTC.
- Draft and date are separate gates.
- Postbuild cannot see a scheduled post until it publishes, so check scheduled posts at source with the same rule functions.

**Reports vs failures.**
- Things a save produces by construction are reports.
- Bytes, language and leaks are failures.

**Commit races.**
- When a push is rejected, rebase onto the CMS commit.
- Never force-push.
- Preserve the editor's flags, such as pins.

## 8. Mobile, touch and motion

**Hover and touch [B].**
- Gate hover lifts and tints with `@media (hover: hover) and (pointer: fine)`. A tap leaves `:hover` stuck, including after the back button.
- Exception: hovers that open desktop menus, and data figures where a tap is how a reader inspects a value.
- Give touch an `:active` press state of `scale(0.97–0.985)` over 100–160ms.
- iOS applies `:active` only where a `touchstart` listener exists. Add one empty passive listener.
- Remove `-webkit-tap-highlight-color` only on controls that have their own press state. Text links keep the flash.
- Use `touch-action: manipulation` on links, buttons, summaries and labels.
- Use `user-select: none` on control labels only, never on body text.

**Carousels and heroes.**
- Use a native scroll-snap scroller (`scroll-snap-type: x mandatory`, `scroll-snap-stop: always`, `overscroll-behavior-x: contain`), not a transform strip. You get the platform's momentum for free, and focus brings hidden slides into view.
- Headless Chromium will not scroll from synthetic touch, so test with a sideways wheel pan.

**Inputs.** Make inputs 16px or larger, or iOS zooms on focus. Never disable zoom.

**Motion budget.**
- Under 300ms for UI.
- Ease-out for entering, never ease-in.
- Never scale from zero.
- Prefer transitions to keyframes for anything a user can interrupt.

**Motion that earns its place.**
- Press feedback.
- A disclosure growing open (`::details-content` plus `interpolate-size`).
- Content that would otherwise appear in one frame, with `@starting-style`.
- An embed fading in over its poster.
- A shared element between pages, but only when the same thing exists on both pages.

**Motion that does not earn its place.**
- Scroll-reveal fades.
- Counting numbers.
- Logo marquees.
- Parallax on heroes.
- Entrance animations on every page view.
- Animating core navigation.
- Moving data the user is reading.

**Fallbacks.**
- Every motion has a reduced-motion path.
- Every progressive feature (`@starting-style`, `::details-content`, view transitions) falls back to showing the content at once.
- View-transition names are unique per page. A duplicate cancels the whole transition.
