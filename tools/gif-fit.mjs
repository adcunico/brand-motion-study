/**
 * Re-encodes any GIF over the size budget from its matching MP4, stepping
 * down fps / palette size until it fits. Keeps 540px width and infinite loop.
 *   node tools/gif-fit.mjs [budgetMB]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const BUDGET = (+(process.argv[2] || 5)) * 1048576;
const ff = (a) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...a], { stdio: 'inherit' });

/* progressively cheaper settings; a little denoise before palettisation is
   what actually rescues the noisy ones — GIF cannot compress per-pixel grain */
const LADDER = [
  { fps: 20, colors: 160, denoise: 'smartblur=lr=1.0:ls=-0.25' },
  { fps: 16, colors: 128, denoise: 'smartblur=lr=1.4:ls=-0.35' },
  { fps: 14, colors: 96,  denoise: 'smartblur=lr=1.8:ls=-0.45' },
  { fps: 12, colors: 64,  denoise: 'smartblur=lr=2.2:ls=-0.55' },
];

for (const f of (await fs.readdir('export/gif')).filter((f) => f.endsWith('.gif')).sort()) {
  const gif = path.join('export/gif', f);
  let size = (await fs.stat(gif)).size;
  if (size <= BUDGET) { console.log(`${f.padEnd(30)} ${(size/1048576).toFixed(2)}MB  ok`); continue; }

  const mp4 = path.join('export/mp4', f.replace('.gif', '.mp4'));
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'giffit-'));
  let done = false;

  for (const s of LADDER) {
    const chain = `fps=${s.fps},scale=540:-1:flags=lanczos,${s.denoise}`;
    const pal = path.join(tmp, 'p.png');
    ff(['-i', mp4, '-vf', `${chain},palettegen=max_colors=${s.colors}:stats_mode=diff`, pal]);
    ff(['-i', mp4, '-i', pal,
        '-lavfi', `${chain}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`,
        '-loop', '0', gif]);
    size = (await fs.stat(gif)).size;
    if (size <= BUDGET) {
      console.log(`${f.padEnd(30)} ${(size/1048576).toFixed(2)}MB  re-encoded @ ${s.fps}fps / ${s.colors} colours`);
      done = true; break;
    }
  }
  if (!done) console.log(`${f.padEnd(30)} ${(size/1048576).toFixed(2)}MB  STILL OVER BUDGET`);
  await fs.rm(tmp, { recursive: true, force: true });
}
