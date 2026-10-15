#!/usr/bin/env node
/**
 * Break-test a check: mutate one file, run the check, confirm it FAILS with
 * the message you expect, then restore the file whatever happened. Then run
 * the check again on the restored file and confirm it PASSES, so you know the
 * failure came from your mutation and not from something already broken.
 *
 * A check that cannot fail looks exactly like one that passes. This is how you
 * find out which one you have.
 *
 * Usage:
 *   node break-test.mjs --file dist/index.html --find "<title>Home" \
 *     --replace "<title>Home Home Home Home Home Home Home Home Home" \
 *     --cmd "npm run verify" --expect "renders" [--regex] [--all] [--no-control]
 *
 *   --file      the file to mutate (built output or source)
 *   --find      text to find (literal unless --regex)
 *   --replace   replacement text
 *   --cmd       the check command; non-zero exit means it failed
 *   --expect    a substring the failing output must contain (optional but
 *               recommended: a failure for the wrong reason is not a pass)
 *   --regex     treat --find as a regular expression
 *   --all       replace every occurrence, not just the first
 *   --no-control  skip the clean re-run (only if it is slow and you have just run it)
 *
 * If --find matches nothing, it stops before running anything: a mutation
 * that changes nothing proves nothing, and that is the commonest way a
 * break-test lies. Mutating source needs a rebuild inside --cmd
 * (for example "npm run build && npm run verify").
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
if (args.includes('--help') || !args.length) {
  console.log(readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0]);
  process.exit(0);
}
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const has = (name) => args.includes(name);
const file = opt('--file');
const find = opt('--find');
const replace = opt('--replace') ?? '';
const cmd = opt('--cmd');
const expect = opt('--expect');
if (!file || find === undefined || !cmd) {
  console.error('need --file, --find and --cmd (see --help)');
  process.exit(2);
}

const original = readFileSync(file);
const text = original.toString('utf8');
const pattern = has('--regex') ? new RegExp(find, has('--all') ? 'g' : '') : null;
const mutated = pattern
  ? text.replace(pattern, replace)
  : has('--all') ? text.split(find).join(replace) : text.replace(find, replace);
if (mutated === text) {
  console.error(`--find matched nothing in ${file}; nothing was mutated, nothing was run.`);
  process.exit(2);
}

const run = () => {
  const r = spawnSync(cmd, { shell: true, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { code: r.status ?? 1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
};

let broken;
try {
  writeFileSync(file, mutated);
  broken = run();
} finally {
  writeFileSync(file, original);
}

const failed = broken.code !== 0;
const said = expect === undefined || broken.out.includes(expect);
console.log(`mutated run: exit ${broken.code}${expect !== undefined ? `, expected message ${said ? 'present' : 'ABSENT'}` : ''}`);
if (!failed || !said) {
  console.log(broken.out.split('\n').slice(-25).join('\n'));
  console.log(failed
    ? 'RESULT: the check failed, but not with the expected message. It may be failing for another reason.'
    : 'RESULT: the check did NOT fail. Either it cannot see this, or the mutation missed what it reads.');
  process.exit(1);
}

if (!has('--no-control')) {
  const clean = run();
  console.log(`control run (restored): exit ${clean.code}`);
  if (clean.code !== 0) {
    console.log(clean.out.split('\n').slice(-25).join('\n'));
    console.log('RESULT: the check also fails on the restored file, so the failure above proves nothing yet.');
    process.exit(1);
  }
}
console.log('RESULT: the check fails on the mutation and passes without it. It is load-bearing.');
