#!/usr/bin/env node
// Postbuild house rules. Runs inside the host's build; a non-zero exit stops the deploy.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
});

// Visible text: tags removed, dashes normalised, whitespace collapsed.
const text = (html) => html
  .replace(/<[^>]+>/g, ' ')
  .replace(/[–—]/g, '--')
  .replace(/\s+/g, ' ')
  .trim();

const errors = [];

for (const file of walk(DIST)) {
  const body = text(readFileSync(file, 'utf8'));

  // House style: no em dashes in visitor-facing text.
  if (body.includes('—')) errors.push(`${file}: em dash`);

  // British spelling.
  for (const us of ['color', 'center', 'analyze', 'organization']) {
    if (new RegExp(`\\b${us}\\b`).test(body)) errors.push(`${file}: US spelling "${us}"`);
  }
}

// Every news post shows who wrote it.
for (const file of walk(join(DIST, 'news'))) {
  if (file === join(DIST, 'news', 'index.html')) continue;
  const html = readFileSync(file, 'utf8');
  const m = html.match(/"author":\{"@type":"Person","name":"([^"]+)"\}/);
  if (!m) { errors.push(`${file}: no author in schema`); continue; }
  if (!html.includes(m[1])) errors.push(`${file}: author "${m[1]}" not shown on page`);
}

// The news grid is three columns; a part-filled last row looks broken.
const cards = (readFileSync(join(DIST, 'news', 'index.html'), 'utf8').match(/class="card"/g) || []).length;
if (cards % 3 !== 0) errors.push(`news/index.html: ${cards} cards leaves a part-filled row`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('house rules: ok');
