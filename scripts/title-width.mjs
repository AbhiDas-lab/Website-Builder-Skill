#!/usr/bin/env node
/**
 * How wide a <title> renders in a Google desktop search result, in pixels.
 *
 * Why pixels: Google sets result titles in Arial at about 20px and cuts on
 * width, near 600px. Character counts mislead; 60 characters can be 470px of
 * lowercase or 590px of capitals.
 *
 * Every advance below was read from CanvasRenderingContext2D.measureText with
 * font '20px Arial, sans-serif' in Chrome. Summing advances ignores kerning,
 * and every kern in Arial is negative, so this model can only over-estimate:
 * it fails a title a few pixels early, never lets an over-long one through.
 * validate() checks that against titles measured in Chrome.
 *
 * Usage:
 *   node title-width.mjs "Page label · Brand"            width and verdict
 *   node title-width.mjs "Page label" --suffix " · Brand" label budget too
 *   node title-width.mjs --budget " · Brand"             room left for labels
 * Import: import { titleWidth, TITLE_BUDGET_PX } from './title-width.mjs'
 */

const W = {
  ' ': 5.557, '!': 5.557, '"': 7.1, '#': 11.123, $: 11.123, '%': 17.783, '&': 13.34,
  "'": 3.818, '(': 6.66, ')': 6.66, '*': 7.783, '+': 11.68, ',': 5.557, '-': 6.66,
  '.': 5.557, '/': 5.557, ':': 5.557, ';': 5.557, '<': 11.68, '=': 11.68, '>': 11.68,
  '?': 11.123, '@': 20.303, '[': 5.557, '\\': 5.557, ']': 5.557, '^': 9.385, _: 11.123,
  '`': 6.66, '{': 6.68, '|': 5.195, '}': 6.68, '~': 11.68,
  0: 11.123, 1: 11.123, 2: 11.123, 3: 11.123, 4: 11.123,
  5: 11.123, 6: 11.123, 7: 11.123, 8: 11.123, 9: 11.123,
  A: 13.34, B: 13.34, C: 14.443, D: 14.443, E: 13.34, F: 12.217, G: 15.557,
  H: 14.443, I: 5.557, J: 10, K: 13.34, L: 11.123, M: 16.66, N: 14.443,
  O: 15.557, P: 13.34, Q: 15.557, R: 14.443, S: 13.34, T: 12.217, U: 14.443,
  V: 13.34, W: 18.877, X: 13.34, Y: 13.34, Z: 12.217,
  a: 11.123, b: 11.123, c: 10, d: 11.123, e: 11.123, f: 5.557, g: 11.123,
  h: 11.123, i: 4.443, j: 4.443, k: 10, l: 4.443, m: 16.66, n: 11.123,
  o: 11.123, p: 11.123, q: 11.123, r: 6.66, s: 10, t: 5.557, u: 11.123,
  v: 10, w: 14.443, x: 10, y: 10, z: 10,
  '·': 6.66, '™': 20, '®': 14.736, '–': 11.123, '—': 20, '…': 20,
  '’': 4.443, '“': 6.66, '”': 6.66,
};

/** Arial's commonest advance. Unknown glyphs are charged this, erring wide. */
const DEFAULT_ADVANCE = 11.123;

/** Google's desktop title column before the ellipsis. */
export const TITLE_BUDGET_PX = 600;

/** Rendered width of `s` in 20px Arial, CSS pixels. */
export function titleWidth(s) {
  let w = 0;
  for (const ch of s) w += W[ch] ?? DEFAULT_ADVANCE;
  return w;
}

/** Room a page label has once a fixed suffix (" · Brand") is paid for. */
export const labelBudget = (suffix) => TITLE_BUDGET_PX - titleWidth(suffix);

/** Titles measured in Chrome with the same font (measureText), 9 October 2026. */
const GROUND_TRUTH = [
  ['Wholesale office furniture, Toronto · Example Supplies', 480.99],
  ['AVIATION SAFETY TRAINING COURSES · Example Academy', 563.82],
  ['Contact us · Example Co', 222.31],
  ['Typewriter maintenance, Yorkshire · Example & Sons Ltd', 505.06],
];
const KERN_SLACK_PX = 6;

/** Throws if the table has drifted from Chrome: never narrower, at most a little wider. */
export function validate() {
  for (const [s, expected] of GROUND_TRUTH) {
    const got = titleWidth(s);
    if (got < expected) throw new Error(`under-estimates "${s}": ${got.toFixed(2)}px here, ${expected}px in Chrome`);
    if (got - expected > KERN_SLACK_PX) throw new Error(`over-estimates "${s}" by ${(got - expected).toFixed(2)}px`);
  }
}

const isMain = (() => {
  try {
    return import.meta.url === new URL(`file://${process.argv[1].replace(/\\/g, '/').replace(/^([A-Za-z]:)/, '/$1')}`).href;
  } catch {
    return false;
  }
})();

if (isMain) {
  validate();
  const args = process.argv.slice(2);
  const flag = (name) => {
    const i = args.indexOf(name);
    return i >= 0 ? args.splice(i, 2)[1] : undefined;
  };
  const budgetFor = flag('--budget');
  const suffix = flag('--suffix') ?? '';
  if (budgetFor !== undefined) {
    console.log(`suffix "${budgetFor}" is ${titleWidth(budgetFor).toFixed(1)}px; a label has ${labelBudget(budgetFor).toFixed(1)}px of ${TITLE_BUDGET_PX}px`);
    process.exit(0);
  }
  if (!args.length) {
    console.log('usage: node title-width.mjs "Title" [--suffix " · Brand"] | --budget " · Brand"');
    process.exit(2);
  }
  let worst = 0;
  for (const label of args) {
    const full = label + suffix;
    const w = titleWidth(full);
    const over = w - TITLE_BUDGET_PX;
    worst = Math.max(worst, over);
    console.log(`${w.toFixed(1).padStart(6)}px  ${over > 0 ? `OVER by ${over.toFixed(1)}px` : `${(-over).toFixed(1)}px spare`}  ${full}`);
  }
  process.exit(worst > 0 ? 1 : 0);
}
