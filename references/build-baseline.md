# Day-one baseline for a new site

Set this up before the first real page. Retrofitting it means auditing everything twice, and the first audit always finds things the checks would have caught. Each item says why, so you can judge when a project needs something different.

## 1. Decide the platform facts and write them down

Record these in the project's `CLAUDE.md` or README:

- **What a push deploys.**
  - On many hosts a push to any branch is a production deploy.
  - Find out, and write it down.
- **What runs before deploy and what runs alongside it.**
  - The host's build command is the only gate that can stop a deploy.
  - CI usually runs in parallel.
- **Where secrets live.**
  - In the host's secret store, never the repo.
  - Name each secret in the docs; never write its value.
- **URL form.**
  - Choose trailing slash or not, and make the canonical URL equal what the origin serves without a redirect.
  - Turn off the host's automatic slash redirect if it disagrees.
- **Duplicate origins.**
  - Explicitly disable preview or default subdomains that would serve a crawlable copy.
  - Do not rely on defaults, which are often "on" when the setting is absent.
- **404.** Configure the host to serve the built 404 page with a 404 status, and test it on the live site.
- **Ownership.**
  - Record who owns the domain, the host account, the CMS and repository access, the form provider, and any embedded channels such as YouTube.
  - These accounts should belong to the organisation, not to a person who may leave.
- **Analytics and consent.**
  - Decide whether there is analytics at all.
  - If there is, decide whether it needs a consent banner under the applicable privacy law, and say so in the privacy policy.
- **End of life.** For a campaign or programme site, decide what happens when it ends: redirect, archive, or keep it running. Write it down while people still remember.
- **Whether a CMS is needed at all.** A few updates a year by a developer may not justify one, and every CMS is a second author whose saves deploy.
- **Asset caching.**
  - If `/assets/*` is immutable for a year, every replaced asset needs a new filename.
  - Make sure 4xx responses under that path are not cached immutably.

## 2. Create the four check gates

| Script | Runs | Purpose |
| --- | --- | --- |
| `postbuild` (house rules) | In the host's build. Fails the deploy. | Things that must never ship: leaked secrets or personal data, house punctuation and spelling, trademark form, whole email addresses, content longer than a fixed slot holds. Fast, no browser, reads `dist/`. |
| `verify` | CI, after build | Static checks over every built page. |
| `verify:browser` | CI, after build | Headless sweep of every page at 375, 768 and 1280, plus the widths either side of each breakpoint. Covers overflow, truncation, target sizes, computed casing and behaviour. |
| `verify:live` | By hand, after any dashboard change | Served headers and responses compared with what the repo declares, in both directions. |

Ground rules for all four:

- Read built output, not fixtures.
- Each check has a control case that must not fire.
- Each check has been break-tested at least once (`scripts/break-test.mjs`).
- The CI job installs the same browser the sweep uses, and reports which gate each failure came from.

## 3. Security and privacy from the start

- **CSP.**
  - `script-src 'self'` with no `'unsafe-inline'`.
  - Never hydrate framework islands from inline script; emit external module scripts.
  - List each embed origin in `frame-src` and nothing more.
- **Security headers.** HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and frame-ancestors, in the host's headers file, with a postbuild warning if the file goes missing.
- **Forms.**
  - Use a server-side handler that verifies the bot-check token, with a hostname allowlist, and forwards the client's headers to the form provider.
  - Add a honeypot that gets a fake success.
  - Keep the form endpoint id in a secret.
- **Email addresses.**
  - Decide up front whether to obfuscate them.
  - If you do, enforce it at postbuild across every text file, or one stray address undoes it.
- **Confidential data.** Write the confidentiality patterns at postbuild before anyone pastes a client document into the CMS.

## 4. SEO scaffolding

- **Titles.**
  - Use a title template (`Label · Brand`).
  - Budget the label in pixels: `scripts/title-width.mjs --suffix " · Brand"` prints how much room a label has.
- **Sitemap.**
  - Take `lastmod` from the files each route's copy lives in, committed as data rather than read from git at build time. Shallow clones have no history.
  - Assert that every mapped source file is tracked.
- **Structured data.**
  - One Organization node referenced by `@id`.
  - BreadcrumbList rendered from the same source as the visible trail.
  - Escape every `<` in JSON-LD.
- **Redirects.**
  - For a site replacing an old one, pull old URLs from the Wayback Machine CDX index and Search Console's 404 report before launch.
  - Every redirect is a 301 to a page that exists.
- **Icons.** favicon.ico, an apple-touch-icon, manifest icons with maskable safe zones, and an og:image as PNG or JPEG.

## 5. CMS, if there is one

- **Schema parity.** The CMS field config and the content schema are checked against each other in both directions.
- **Required fields.** Never mark a field `required` if existing entries lack it.
- **Fallbacks.** CMS-owned files fall back field by field to code defaults, so deleting one cannot blank a page.
- **House rules.** House language and leak rules run at postbuild, because a CMS save deploys without review.
- **Scheduled posts.** Check them at source, because `dist` cannot see them yet.
- **Report or fail.** Decide per rule whether a violation is a report or a failure, and write down why.
- **Pasted links.** Any link field an editor fills: require `https`, strip everything from the `?` (tracking parameters, and share links that carry the sharer's id), allowlist the expected host where there is one, and give external links `rel="noopener"`. Store video ids, not whole URLs.
- **Plain text.** Render CMS fields as text, never as raw HTML (no `set:html` or `innerHTML` on editor input) unless the field is rich text that is sanitised at build.
- **Errors for the editor.** Write build errors for whoever will read them. Name the field, the value, the limit and what to do: "title is 61 characters; the banner holds 45. Shorten it." Not a stack trace.
- **Validation without time bombs.** Validation must not make a build fail just because time has passed. A schema that rejects past dates breaks the site on the day after the event, with no commit to blame. Expire content at render time instead.

## 6. Mobile, touch and motion baseline

- **Viewport.** `width=device-width, initial-scale=1`, and never `user-scalable=no`.
- **Inputs.** 16px or larger.
- **Hover.** All hover effects that move, raise or tint sit inside `@media (hover: hover) and (pointer: fine)`.
- **Press state.**
  - Every pressable control gets an `:active` state.
  - Add one empty passive `touchstart` listener so iOS applies it.
  - Remove the tap flash only on controls that have their own press state.
- **Taps.**
  - `touch-action: manipulation` on links, buttons, summaries and labels.
  - `user-select: none` on control labels only.
- **Reduced motion.** A global rule caps transitions and animations, and cross-document view transitions are turned off. Carousels never auto-advance under it.
- **Translucency.** Translucent sticky chrome goes solid under `prefers-reduced-transparency`.

## 7. Content components that will hold future content

For every component whose content will change later (events, promos, cards, breadcrumbs, titles):

- Run the worst-case content pass before launch.
- Let optional lines give way rather than overflow.
- Hold the parts that cannot give way with build-time limits that print which field is too long and by how much.
- Document those limits where the next author will look.

## 8. The house profile

Start the project's house profile (template in `templates.md`) and fill in what the owner has decided. Turn each enforceable rule into a postbuild or verify check as it is written, not later.

## 9. The ledger

Start a numbered ledger file on day one (format in `templates.md`). The first rows are usually the baseline itself.
