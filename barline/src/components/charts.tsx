// Small SVG charts drawn from tokens. Each one carries a text summary for
// screen readers, since a picture of a line says nothing to them.

const W = 340;
const H = 160;
const PAD = { l: 36, r: 8, t: 8, b: 22 };

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

const short = (v: number) => (v >= 10000 ? `${Math.round(v / 1000)}k` : v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${Math.round(v * 10) / 10}`);

export function BarChart({ data, label }: { data: { x: string; y: number }[]; label: string }) {
  const max = niceMax(Math.max(0, ...data.map((d) => d.y)));
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const bw = iw / data.length;
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label}: ${data.map((d) => `${d.x} ${short(d.y)}`).join(', ')}`}>
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line className="grid" x1={PAD.l} x2={W - PAD.r} y1={PAD.t + ih * (1 - f)} y2={PAD.t + ih * (1 - f)} />
          <text x={PAD.l - 6} y={PAD.t + ih * (1 - f) + 4} textAnchor="end">
            {short(max * f)}
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const h = (d.y / max) * ih;
        return (
          <g key={i}>
            <rect className="bar" x={PAD.l + i * bw + bw * 0.18} y={PAD.t + ih - h} width={bw * 0.64} height={Math.max(h, 0)} rx={3} />
            {(data.length <= 8 || i % 2 === data.length % 2) && (
              <text x={PAD.l + i * bw + bw / 2} y={H - 6} textAnchor="middle">
                {d.x}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function LineChart({ data, label, unit }: { data: { x: number; y: number; tag: string }[]; label: string; unit: string }) {
  if (data.length === 0) return null;
  const ys = data.map((d) => d.y);
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  const span = hi - lo || Math.max(1, hi * 0.1);
  const min = lo - span * 0.15;
  const max = hi + span * 0.15;
  const x0 = data[0].x;
  const x1 = data[data.length - 1].x;
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const px = (x: number) => PAD.l + (x1 === x0 ? iw / 2 : ((x - x0) / (x1 - x0)) * iw);
  const py = (y: number) => PAD.t + ih - ((y - min) / (max - min)) * ih;
  const path = data.map((d, i) => `${i ? 'L' : 'M'}${px(d.x).toFixed(1)},${py(d.y).toFixed(1)}`).join(' ');
  return (
    <svg
      className="chart"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${label}: from ${short(data[0].y)} ${unit} on ${data[0].tag} to ${short(data[data.length - 1].y)} ${unit} on ${data[data.length - 1].tag}`}
    >
      {[0, 0.5, 1].map((f) => {
        const v = min + (max - min) * f;
        return (
          <g key={f}>
            <line className="grid" x1={PAD.l} x2={W - PAD.r} y1={py(v)} y2={py(v)} />
            <text x={PAD.l - 6} y={py(v) + 4} textAnchor="end">
              {short(v)}
            </text>
          </g>
        );
      })}
      <path className="line" d={path} />
      {data.map((d, i) => (
        <circle key={i} className="dot" cx={px(d.x)} cy={py(d.y)} r={3} />
      ))}
      <text x={PAD.l} y={H - 6}>
        {data[0].tag}
      </text>
      <text x={W - PAD.r} y={H - 6} textAnchor="end">
        {data[data.length - 1].tag}
      </text>
    </svg>
  );
}
