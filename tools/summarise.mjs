/**
 * Condenses style/raw/*.json into a single readable digest for authoring the style file.
 * Usage: node tools/summarise.mjs > style/raw/digest.txt
 */
import fs from 'node:fs/promises';

const files = (await fs.readdir('style/raw')).filter((f) => f.endsWith('.json') && f !== 'digest.json');

const merge = (a, b) => { for (const [k, v] of Object.entries(b || {})) a[k] = (a[k] || 0) + v; return a; };
const top = (bag, n = 24) =>
  Object.entries(bag).sort((x, y) => y[1] - x[1]).slice(0, n);

const agg = {
  colors: {}, bgImages: {}, fonts: {}, fontSizes: {}, fontWeights: {}, letterSpacing: {},
  radii: {}, shadows: {}, filters: {}, borders: {}, transitions: {}, animations: {}, spacing: {},
};
const customProps = {};
const keyframes = {};
const fontFaces = new Set();
const samples = [];

for (const f of files) {
  const d = JSON.parse(await fs.readFile(`style/raw/${f}`, 'utf8'));
  for (const k of Object.keys(agg)) merge(agg[k], d[k]);
  Object.assign(customProps, d.customProps);
  Object.assign(keyframes, d.keyframes);
  (d.fontFaces || []).forEach((x) => fontFaces.add(x));
  samples.push({ page: f, sample: d.sample });
}

const sec = (t) => `\n\n######## ${t} ########`;
let out = '';

out += sec('CSS CUSTOM PROPERTIES (:root / body)');
const props = Object.entries(customProps).sort(([a], [b]) => a.localeCompare(b));
out += `\n(${props.length} total)\n` + props.map(([k, v]) => `${k}: ${v}`).join('\n');

for (const [name, n] of [['colors', 70], ['bgImages', 25], ['fonts', 12], ['fontSizes', 24], ['fontWeights', 10],
  ['letterSpacing', 12], ['radii', 20], ['shadows', 20], ['filters', 10], ['borders', 18],
  ['transitions', 30], ['animations', 20], ['spacing', 24]]) {
  out += sec(name.toUpperCase());
  out += '\n' + top(agg[name], n).map(([k, c]) => `${String(c).padStart(5)}×  ${k.slice(0, 300)}`).join('\n');
}

out += sec('@KEYFRAMES');
out += '\n' + Object.entries(keyframes).map(([k, v]) => `@keyframes ${k} { ${v.slice(0, 400)} }`).join('\n');

out += sec('@FONT-FACE');
out += '\n' + [...fontFaces].map((f) => f.slice(0, 300)).join('\n');

out += sec('NAMED SAMPLES');
for (const s of samples) {
  out += `\n-- ${s.page} --\n` + (s.sample || []).map((x) => JSON.stringify(x, null, 1)).join('\n');
}

console.log(out);
