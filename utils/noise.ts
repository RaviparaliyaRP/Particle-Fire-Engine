
// Simple Simplex-like noise for organic movement
export class SimplexNoise {
  private p: Uint8Array;

  constructor() {
    this.p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) this.p[i] = i;
    for (let i = 255; i > 0; i--) {
      const r = Math.floor(Math.random() * (i + 1));
      [this.p[i], this.p[r]] = [this.p[r], this.p[i]];
    }
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number, z: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = this.fade(x);
    const v = this.fade(y);

    const A = this.p[X] + Y;
    const AA = this.p[A & 255];
    const AB = this.p[(A + 1) & 255];
    const B = this.p[(X + 1) & 255] + Y;
    const BA = this.p[B & 255];
    const BB = this.p[(B + 1) & 255];

    return this.lerp(v, 
      this.lerp(u, this.grad(this.p[AA], x, y, 0), this.grad(this.p[BA], x - 1, y, 0)),
      this.lerp(u, this.grad(this.p[AB], x, y - 1, 0), this.grad(this.p[BB], x - 1, y - 1, 0))
    );
  }
}
