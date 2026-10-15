# Tooling gotchas

Each of these cost hours on a real project. Read this before trusting a measurement, an image pipeline, or a script that writes regexes.

## Browsers in agent sessions and CI

**Agent and headless browsers render hidden.** `document.visibilityState` is `hidden`, so:
- IntersectionObserver never fires.
- Lazy images never load.
- `document.timeline` stays at 0, so every transition reports its start value.

What to do:
- Call `document.getAnimations().forEach(a => a.finish())` before reading computed styles. Or wait past the transition, and include a control reading that proves the check can see a difference.
- Never conclude anything about scroll-triggered behaviour from a session.
- Pitfall: a site-wide lazy-loading ban was introduced on the strength of this artefact, and it was wrong.

**No scrolling from synthetic touch.**
- Headless Chromium will not scroll any element from `Input.synthesizeScrollGesture` with touch, or from dispatched touch events. Even scrollers that work on real phones stay put.
- Drive horizontal scrollers with a mouse-wheel pan (`gestureSourceType: 'mouse'`), which uses the same snap points and handlers.
- Say in the report that touch itself needs a device.

**Synthetic gestures need on-screen coordinates.** Scroll the element into view first; a position outside the viewport throws "Position out of bounds".

**Focus.**
- `element.focus()` in an unfocused document fires no focus events. Dispatch `focusin` to test the wiring.
- Keyboard-reachability tests can start from wherever an earlier click left focus. Focus a known element first, then Tab.

**Reading state too early.** CSS transitions take time even in tests.
- Pitfall: a header colour was read 150ms into a 200ms fade and came back as 0.996 opacity.
- Wait past the transition duration, or finish animations.

**Linux renders text wider.**
- CI's Linux Chromium sets text 2 to 3% wider than Windows, and Android does the same.
- A line that fits locally by 1px fails in CI. A slide that had 18px of room locally had −2px in CI.
- Leave 20px or more of slack, and treat CI layout failures as real.

**Accessibility tree tools.** Some agent tools name elements from direct text children only, so a correctly labelled link looks unnamed. Measure accessible names with `dom-accessibility-api` instead.

**`page.setContent` has an opaque origin.** `@font-face` then fails CORS silently and everything renders in a fallback font. Serve the page from a local HTTP server instead.

**Analytics.** Some edges inject the analytics beacon only for browser-like user agents, so plain `curl` reports none. Use a browser UA.

## Build and framework output

**Chunk names lie.** Bundlers name shared CSS and JS chunks after an arbitrary importer. `about.<hash>.css` on the home page is usually the global bundle, not "the About page's styles".

**Attribute serialisation.** Astro emits `alt=""` as a bare `alt`, so a naive regex counts it as missing.

**Helper names lie.** A file walker filtered to `.html` reported "no bundled scripts" because it never looked at `.js`. Read what a helper does before trusting its answer.

**Text normalisers hide what you are checking for.** A shared `text()` helper that collapses whitespace and rewrites em dashes to `--` makes punctuation checks see nothing. Check raw markup.

## Images

**sharp's lossless trap.** `png({ effort | quality | colours | dither })` silently switches to lossy palette mode.
- Verify pixel identity with a different decoder before writing the file.
- Composite transparent images onto their real background before comparing, or the RMSE is meaningless.
- A comparison of one source downscaled two ways proves nothing.

**Derived dimension tables go stale silently.** Regenerate after any asset change, and read the whole diff.

**Never write an "optimised" file larger than its input.** Check sizes before replacing anything.

## Scripts, shells and paths

**Escapes through generated code.**
- Non-raw Python strings turn `\b` into a backspace byte. The regex then reads correctly in the file and can never match.
- Heredocs and nested quoting can strip `\s`, `\d` and `\.` the same way.
- Find these with `cat -A` or a grep for `\x08`, never by reading the line.
- Build backslashes with `String.fromCharCode(92)` or edit with a script that reads its replacement from a file.

**Windows MAX_PATH (260 characters).** A long synced-folder path plus a temp suffix gives a bare file-not-found error on a directory that exists. Use a short temp path.

**PowerShell's `curl` is not curl.** Use `curl.exe`.

**Stash and restore.** When break-testing with `git stash` / `git checkout -- path`, a restore can reset files to the index rather than your working copy and lose uncommitted work. Commit the real change before break-testing, then restore from `HEAD`.

## Hosts and CDNs

**Dashboard rules override the repo.**
- A transform rule silently rewrote security headers for 11 days.
- Header rules may merge rather than the most specific one winning.
- Only a live check sees either.

**Immutable caching applies to errors too** unless an edge rule says otherwise. A query string may not bust the cache.

**Provider toggles lie.** A form provider's "bot check enforced" setting accepted a random string as a token. Verify server-side, and test with a forged token.

**Server-side fetches are header-less.** No Referer, Origin or User-Agent unless you forward them. Providers may spam-folder the request.
