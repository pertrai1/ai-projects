export function mean(xs: number[]): number {
  if (xs.length === 0) {
    return 0;
  }
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function variance(xs: number[]): number {
  if (xs.length === 0) {
    return 0;
  }
  const m = mean(xs);
  const v = xs.reduce((acc, x) => acc + (x - m) ** 2, 0) / (xs.length - 1);
  return v;
}
