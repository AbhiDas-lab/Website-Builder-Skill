#!/usr/bin/env node
// CI checks over built pages. Runs in GitHub Actions.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PAGES = ['index.html', 'about/index.html', 'news/index.html'];

// Never publish these. Listed here so the check knows what to look for.
const CONFIDENTIAL = ['Priya Shah', '07700 900123', 'Calder Vale Water', 'Pennine Polytechnic', '£850'];

let failed = 0;
const fail = (msg) => { console.error('FAIL', msg); failed++; };

for (const page of PAGES) {
  const html = readFileSync(join('dist', page), 'utf8');

  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  if (!title) fail(`${page}: no <title>`);
  if (title.length > 60) fail(`${page}: title is ${title.length} characters (max 60)`);

  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  if (page.endsWith('/news/')) {
    // The news listing needs a real description, not a placeholder.
    if (desc.length < 70) fail(`${page}: description is ${desc.length} characters`);
  }

  for (const term of CONFIDENTIAL) {
    if (html.includes(term)) fail(`${page}: confidential term "${term}"`);
  }

  for (const [, href] of html.matchAll(/href="(\/[^"]*)"/g)) {
    const target = join('dist', href, href.endsWith('/') ? 'index.html' : '');
    if (!existsSync(target)) fail(`${page}: dead link ${href}`);
  }
}

if (failed) process.exit(1);
console.log(`verify: ${PAGES.length} pages ok`);
