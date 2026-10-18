/**
 * Phase 3 — export/reel.mvp: all eight loops, ~3s each, cross-faded, 1080×1350.
 *   node tools/reel.mjs
 * Takes the middle 3s of each loop so every clip lands mid-gesture.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const CLIP = 3.0;      // seconds shown per loop
const XF   = 0.35;     // cross-fade length
const FPS  = 30;

const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });

const mp4s = (await fs.readdir('export/mp4')).filter((f) => f.endsWith('.mp4')).sort();
if (mp4s.length < 2) { console.error('need the mp4s first — run tools/export.mjs'); process.exit(1); }

const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'reel-'));

/* Each source is a 5s seamless loop. Take 3s starting at 1s so the clip
   sits inside the gesture rather than on the loop seam, and concatenate
   the loop with itself first so a cut never runs past the end.          */
const parts = [];
for (let i = 0; i < mp4s.length; i++) {
  const src = path.join('export/mp4', mp4s[i]);
  const out = path.join(tmp, `p${String(i).padStart(2, '0')}.mp4`);
  ff(['-stream_loop', '1', '-i', src, '-ss', '1.0', '-t', String(CLIP),
      '-r', String(FPS), '-c:v', 'libx264', '-crf', '17', '-preset', 'medium',
      '-pix_fmt', 'yuv420p', '-an', out]);
  parts.push(out);
}

/* chain xfades */
const inputs = parts.flatMap((p) => ['-i', p]);
let filter = '', prev = '0:v';
for (let i = 1; i < parts.length; i++) {
  const offset = (CLIP - XF) * i - (XF * 0) ;
  const label = i === parts.length - 1 ? 'out' : `x${i}`;
  filter += `[${prev}][${i}:v]xfade=transition=fade:duration=${XF}:offset=${(offset).toFixed(3)}[${label}];`;
  prev = label;
}
filter = filter.replace(/;$/, '');

ff([...inputs, '-filter_complex', filter, '-map', '[out]',
    '-c:v', 'libx264', '-profile:v', 'high', '-crf', '18', '-preset', 'slow',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-r', String(FPS),
    'export/reel.mp4']);

await fs.rm(tmp, { recursive: true, force: true });
const s = await fs.stat('export/reel.mp4');
console.log(`reel.mp4  ${(s.size/1048576).toFixed(2)}MB  (${mp4s.length} clips × ${CLIP}s, ${XF}s cross-fades)`);
