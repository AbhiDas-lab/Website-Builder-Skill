# Templates

## Ledger

One file per project, for example `AUDIT-LEDGER.md`. Number rows forever and never reuse a number. If other sessions or people add rows, compute the next number from the file, never from memory.

```markdown
## Closed

| # | Finding and change | Files |
| --- | --- | --- |
| 41 | Titles over 600px were being cut in search results (measured: 7 of 52). Labels shortened; verify now measures every <title> in pixels and fails over budget. Break-tested by lengthening one title. | `src/pages/*.astro`, `scripts/verify.mjs` |

## Pending

| # | Item | Owner | Blocks |
| --- | --- | --- | --- |
| 44 | Data protection contact named in the privacy policy | Owner | Legal sign-off |

## Deliberately not doing

| # | Proposal | Why not |
| --- | --- | --- |
| 19 | Scroll-reveal fades on sections | Delays reading on an information site; nothing to explain or confirm |

## Withdrawn findings

| Claim | Source | What measurement showed |
| --- | --- | --- |
| "Structured data missing" | External SEO report | Present on all 51 pages |
```

Write a row when the change ships, not when it is planned. Each closed row names the check that now holds it, and how that check was break-tested.

## Review report

Lead with the verdict. Findings come most severe first, each backed by a measurement. In a terminal reply, a short version of this works. As a document, use all of it.

```markdown
# Review: <site or page>, <date>

**Verdict:** <one or two sentences: ship or not, and the one thing that matters most>

## Findings

| # | Severity | Where | What, measured | Fix | Check and gate |
| --- | --- | --- | --- | --- | --- |
| 1 | High | `/contact` | Form posts to the provider directly; a forged token is accepted (tested) | Verify the token server-side | verify:live forged-token test [L] |

## Needs a decision from you

- <question, with measured options>

## Claims I could not reproduce

- <claim>: <what I measured instead>

## Not checked, and why

- <for example: touch feel needs a real phone; here is the 2-minute check>
```

Severity:

- **High**: a leak, a security hole, broken core journeys, or legal exposure.
- **Medium**: SEO or accessibility failures on real pages, layout breaks at common widths.
- **Low**: polish.

## Owner decision

```markdown
**Decision needed:** <one line>

Options, measured:
1. <option> (<measurement, for example 512px of 600px>)  ← recommended, because <reason>
2. <option> (<measurement>)

If no answer: <what happens by default, if anything>
```

## House profile

Start this in the project's `CLAUDE.md`. Each rule should name the check that enforces it, or say plainly that it is left to review.

```markdown
## House profile

**Locale and spelling:** <e.g. British English: -ise, -our, -re>; exceptions: proper names, quoted titles.
**Punctuation:** <e.g. no em dashes in visitor-facing text; en dashes for ranges only>.
**Our own name:** <first mention and short form rules; where the full name is mandatory (titles, lockups)>.
**Third-party marks:** <list with exact styling and symbols; which carry the symbol on every occurrence>.
**Our marks:** <registered vs unregistered; TM vs ® and why>.
**Contact details:** <how emails and phones are shown; any obfuscation>.
**Confidential:** <categories never published: personal data, client names pending consent, pricing, cost inputs, partner documents marked confidential>.
**Claims:** <regulatory or medical wording limits; sources required for numbers>.
**Voice:** <company page vs named person, if relevant>.
**Enforced by:** <postbuild script and rule names>.
```
