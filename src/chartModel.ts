export type AngleSegment = {
  start: { time: number; angle: number };
  end: { time: number; angle: number };
};

/** Linear motion cut at every modulo boundary. Never join 360° to 0°. */
export function angleSegments(
  from: number,
  to: number,
  fromAngle: number,
  toAngle: number,
  windowStart = from,
  windowEnd = to,
  maxCrossings = 128,
): { segments: AngleSegment[]; dense: boolean } {
  if (
    to <= from ||
    windowEnd <= windowStart ||
    to < windowStart ||
    from > windowEnd
  )
    return { segments: [], dense: false };
  const left = Math.max(from, windowStart);
  const right = Math.min(to, windowEnd);
  if (right <= left) return { segments: [], dense: false };
  const slope = (toAngle - fromAngle) / (to - from);
  const a = fromAngle + (left - from) * slope;
  const b = fromAngle + (right - from) * slope;
  const first = Math.floor(Math.min(a, b) / 360) + 1;
  const last = Math.ceil(Math.max(a, b) / 360) - 1;
  if (last - first + 1 > maxCrossings) return { segments: [], dense: true };
  const cuts = [0, 1];
  if (a !== b)
    for (let k = first; k <= last; k++) cuts.push((360 * k - a) / (b - a));
  cuts.sort((x, y) => x - y);
  const segments = cuts.slice(0, -1).map((u, index) => {
    const v = cuts[index + 1];
    const band = Math.floor((a + ((b - a) * (u + v)) / 2) / 360);
    const clamp = (value: number) => Math.max(0, Math.min(360, value));
    return {
      start: {
        time: left + (right - left) * u,
        angle: clamp(a + (b - a) * u - band * 360),
      },
      end: {
        time: left + (right - left) * v,
        angle: clamp(a + (b - a) * v - band * 360),
      },
    };
  });
  return { segments, dense: false };
}
