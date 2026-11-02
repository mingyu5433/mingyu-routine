// 앱 아이콘(PNG)을 외부 의존성 없이 생성합니다. npm run dev / build 전에 자동 실행됩니다.
// 디자인: 강조색(#ff385c) 바탕 + 진행 링 + 체크 표시
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
const BG = [255, 56, 92];

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
const png = (size, rgba) => {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
};

const segDist = (px, py, ax, ay, bx, by) => {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};

function draw(size, pad, rounded) {
  const c = size / 2, r = size * (0.5 - pad), w = size * 0.085;
  const check = [[c - r * 0.42, c + r * 0.02], [c - r * 0.1, c + r * 0.34], [c + r * 0.46, c - r * 0.3]];
  const rr = size * 0.22;
  const SS = 4;
  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let bgA = 0, white = 0;
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const px = x + (sx + 0.5) / SS, py = y + (sy + 0.5) / SS;
      // 바탕 (favicon만 둥근 모서리)
      let inBg = true;
      if (rounded) {
        const qx = Math.max(rr - px, 0, px - (size - rr)), qy = Math.max(rr - py, 0, py - (size - rr));
        inBg = qx * qx + qy * qy <= rr * rr;
      }
      if (!inBg) continue;
      bgA++;
      // 진행 링: 12시 방향에서 시계 방향으로 290도는 흰색, 나머지는 반투명
      const d = Math.hypot(px - c, py - c);
      let wv = 0;
      if (Math.abs(d - (r - w / 2)) <= w / 2) {
        const ang = (Math.atan2(py - c, px - c) * 180 / Math.PI + 360) % 360;
        wv = ang >= 200 && ang < 270 ? 90 / 255 : 1;
      }
      // 체크 표시
      if (segDist(px, py, ...check[0], ...check[1]) <= w / 2 || segDist(px, py, ...check[1], ...check[2]) <= w / 2) wv = 1;
      white += wv;
    }
    const n = SS * SS, a = bgA / n, wf = bgA ? white / bgA : 0;
    const i = (y * size + x) * 4;
    out[i] = Math.round(BG[0] + (255 - BG[0]) * wf);
    out[i + 1] = Math.round(BG[1] + (255 - BG[1]) * wf);
    out[i + 2] = Math.round(BG[2] + (255 - BG[2]) * wf);
    out[i + 3] = Math.round(a * 255);
  }
  return png(size, out);
}

mkdirSync(OUT, { recursive: true });
const icons = [
  ['icon-192.png', 192, 0.24, false],
  ['icon-512.png', 512, 0.24, false],
  ['icon-maskable-512.png', 512, 0.32, false],
  ['apple-touch-icon.png', 180, 0.24, false],
  ['favicon.png', 64, 0.2, true],
];
for (const [name, size, pad, rounded] of icons) writeFileSync(join(OUT, name), draw(size, pad, rounded));
console.log(`icons → ${OUT}`);
