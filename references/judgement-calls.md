# Judgement calls

Some things look wrong and are right. Before "fixing" one, read the code comment near it and this list. When unsure, it is a question for the owner, not a change.

## Defect, decision, or deliberate?

- **Defect**: something is broken by any reasonable standard (overflow, a dead link, a leak, a contrast failure, a broken redirect). Fix it, add a check, break-test it.
- **Editorial decision**: copy wording, which title to use, an orphan card, whether a page needs an image, how many items a grid shows. Take it to the owner with measured options. For example, four candidate titles each with its pixel width. Record the answer so nobody reopens it.
- **Deliberate**: the code or ledger says why. Leave it, and record that you checked.

A finding from an external report is a hypothesis until you have measured it yourself.

## Patterns that look wrong but were right

**Trademark symbols follow the registration's scope.**
- A mark registered only in a class that does not cover what the page sells takes TM, not ®.
- Claiming registration outside its scope can be an offence.
- Third-party marks take their owner's styling on every occurrence, even against your house casing rules.

**The partner's own public source beats an internal deck** for launch dates, specifications and product figures. Record that provenance in a comment, because regenerated data loses it.

**Quoted titles, slogans and partner excerpts keep their owner's spelling.** Exempt them by exact string, so the same spelling anywhere else still fails.

**Some violations should be reports, not failures.** If a CMS save produces something by construction, failing the build turns an editorial save red for a filing matter the reader never sees. Leaks, language and bytes still fail.

**Missing security headers warn rather than fail**, so an unrelated content edit is not blocked. Check them live.

**`alt=""` on a logo next to its visible name is correct.** Adding alt text announces the name twice, and an `aria-label` drifts from the visible text.

**Two navs in the DOM can be deliberate.** A desktop nav and a compact nav both in HTML means duplicate anchors. Rendering one with script would hide navigation from crawlers.

**No Product or VideoObject schema** without a price, reviews, or a server-rendered video. Thin schema invites manual action, or simply nothing.

**Do not split a page before the content exists.** Three thin pages compete with each other.

**Do not set a charset response header on a host that merges header rules.** The meta charset in the first 1024 bytes already does it, and a site-wide header mislabels every asset.

**A small heading styled like an eyebrow can be load-bearing** for the document outline. Read the comment before restyling it.

**Many tap-target "failures" disappear** once WCAG 2.5.8's spacing and inline exceptions are applied properly.

**A reading site's manifest uses `display: "browser"`**, not `standalone`, which strips navigation and over-claims an app.

**Discontinued items redirect to the honest category page**, not a competitor's equivalent.

**A word-count target written before the content existed is stale, not breached.**

**An image's alt text transcribes what the image says**, even a competitor's figure printed in it. That is what a sighted reader sees.

## Recommending things you have not seen

Before recommending a design change, confirm the thing it depends on exists. For example, a shared-element transition from a blog card's image into the post needs the post to show that image. In one project it did not, and the recommendation had to be withdrawn after the user had approved it.

Say so as soon as you find out, rather than building something misleading to honour the plan.

## Your own errors

Record them in the ledger where they happened, rather than overwriting them. For example: "inferred a job title from the verb 'founded'; corrected to the source". The next reviewer learns more from the correction than from a clean history.
