import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
const probe = (f) => JSON.parse(execFileSync('ffprobe', ['-v','error','-show_streams','-show_format','-of','json',f]).toString());
const rows = [];
for (const dir of ['export/mp4','export/gif']) {
  for (const f of (await fs.readdir(dir)).sort()) {
    const p = `${dir}/${f}`;
    const st = await fs.stat(p);
    let info = '';
    try {
      const d = probe(p); const v = d.streams.find(s=>s.codec_type==='video');
      const dur = parseFloat(d.format.duration || v.duration || 0);
      info = `${v.width}x${v.height}  ${v.codec_name}  ${dur.toFixed(2)}s  ${v.nb_frames||'?'}f`;
    } catch(e){ info = 'PROBE FAILED'; }
    rows.push([p, (st.size/1048576).toFixed(2)+'MB', info, st.size > 5*1048576 ? 'OVER 5MB' : '']);
  }
}
for (const r of rows) console.log(r[0].padEnd(40), r[1].padStart(8), ' ', r[2], r[3]);
