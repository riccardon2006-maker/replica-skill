// Turns dist-artifact/ into one HTML fragment for claude.ai Artifacts:
// no <html>/<head>/<body> (the host adds them), JS and CSS inlined.
import { readFileSync, writeFileSync } from 'node:fs';

const dir = new URL('../dist-artifact/', import.meta.url);
const html = readFileSync(new URL('index.html', dir), 'utf8');
const js = [...html.matchAll(/<script[^>]*src="\/?([^"]+)"[^>]*><\/script>/g)].map((m) => readFileSync(new URL(m[1], dir), 'utf8'));
const css = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="\/?([^"]+)"[^>]*>/g)].map((m) => readFileSync(new URL(m[1], dir), 'utf8'));
const out = `<title>Barline</title>
<meta name="description" content="Barline: a fast strength training log." />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
<style>:root{color-scheme:dark}html,body{background:#0e1013}
${css.join('\n')}</style>
<div id="root"></div>
<script type="module">${js.join('\n').replace(/<\/script/gi, '<\\/script')}</script>
`;
const dest = process.argv[2] ?? new URL('barline.html', dir).pathname;
writeFileSync(dest, out);
console.log(`wrote ${dest} (${(out.length / 1024).toFixed(0)} KB)`);
