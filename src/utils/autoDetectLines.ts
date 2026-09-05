import { LinesState, Point } from "./palmistryRules";

type Hand = "left" | "right";
type Direction = "up" | "down" | "left" | "right";

interface Vec {
  x: number;
  y: number;
}

interface Bounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

const clamp = (value: number, min = 20, max = 480) => Math.max(min, Math.min(max, value));

const point = (x: number, y: number): Point => ({ x: clamp(x), y: clamp(y) });

function rotateClockwise(v: Vec): Vec {
  return { x: -v.y, y: v.x };
}

function rotateCounterClockwise(v: Vec): Vec {
  return { x: v.y, y: -v.x };
}

function directionToVector(direction: Direction): Vec {
  switch (direction) {
    case "up":
      return { x: 0, y: -1 };
    case "down":
      return { x: 0, y: 1 };
    case "left":
      return { x: -1, y: 0 };
    case "right":
      return { x: 1, y: 0 };
  }
}

function project(center: Point, thumbAxis: Vec, fingerAxis: Vec, thumb: number, fingers: number): Point {
  return point(
    center.x + thumbAxis.x * thumb + fingerAxis.x * fingers,
    center.y + thumbAxis.y * thumb + fingerAxis.y * fingers
  );
}

function rgbToSkin(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  let hue = 0;

  if (diff !== 0) {
    if (max === r) hue = ((g - b) / diff + (g < b ? 6 : 0)) * 60;
    else if (max === g) hue = ((b - r) / diff + 2) * 60;
    else hue = ((r - g) / diff + 4) * 60;
  }

  const saturation = max === 0 ? 0 : diff / max;
  const value = max / 255;
  const softSkin = hue >= 0 && hue <= 55 && saturation >= 0.08 && saturation <= 0.78 && value >= 0.22;
  const warmBright = r > 95 && g > 55 && b > 35 && r > b && r >= g * 0.82 && Math.abs(r - g) > 8;
  return softSkin || warmBright;
}

function getSkinMask(imageData: ImageData): boolean[][] {
  const { data, width, height } = imageData;
  const mask: boolean[][] = [];

  for (let y = 0; y < height; y++) {
    mask[y] = [];
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      mask[y][x] = rgbToSkin(data[i], data[i + 1], data[i + 2]);
    }
  }

  return mask;
}

function getBounds(mask: boolean[][]): Bounds | null {
  const height = mask.length;
  const width = mask[0].length;
  let top = height;
  let bottom = 0;
  let left = width;
  let right = 0;
  let count = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!mask[y][x]) continue;
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
      left = Math.min(left, x);
      right = Math.max(right, x);
      count++;
    }
  }

  const coverage = count / (width * height);
  // Reject almost-empty frames and frames where the whole background is
  // classified as skin. In both cases manual calibration is safer.
  if (coverage < 0.06 || coverage > 0.92) return null;
  return { top, bottom, left, right, width: right - left, height: bottom - top };
}

function countMask(mask: boolean[][], x1: number, y1: number, x2: number, y2: number): number {
  const height = mask.length;
  const width = mask[0].length;
  let count = 0;

  const startX = Math.max(0, Math.floor(x1));
  const endX = Math.min(width, Math.ceil(x2));
  const startY = Math.max(0, Math.floor(y1));
  const endY = Math.min(height, Math.ceil(y2));

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      if (mask[y][x]) count++;
    }
  }

  return count;
}

function detectFingerDirection(mask: boolean[][], bounds: Bounds): Direction {
  const band = 0.24;
  const { left, right, top, bottom, width, height } = bounds;

  if (width >= height * 1.12) {
    const leftDensity = countMask(mask, left, top, left + width * band, bottom) / (width * band * height || 1);
    const rightDensity = countMask(mask, right - width * band, top, right, bottom) / (width * band * height || 1);
    return leftDensity <= rightDensity ? "left" : "right";
  }

  const topDensity = countMask(mask, left, top, right, top + height * band) / (width * height * band || 1);
  const bottomDensity = countMask(mask, left, bottom - height * band, right, bottom) / (width * height * band || 1);
  return topDensity <= bottomDensity ? "up" : "down";
}

function toGrayscale(imageData: ImageData): number[][] {
  const { data, width, height } = imageData;
  const gray: number[][] = [];

  for (let y = 0; y < height; y++) {
    gray[y] = [];
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      gray[y][x] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
  }

  return gray;
}

function sobel(gray: number[][]): number[][] {
  const height = gray.length;
  const width = gray[0].length;
  const edges: number[][] = [];
  const gx = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
  const gy = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];

  for (let y = 0; y < height; y++) {
    edges[y] = [];
    for (let x = 0; x < width; x++) {
      let sx = 0;
      let sy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = x + kx;
          const py = y + ky;
          if (px < 0 || px >= width || py < 0 || py >= height) continue;
          sx += gray[py][px] * gx[ky + 1][kx + 1];
          sy += gray[py][px] * gy[ky + 1][kx + 1];
        }
      }

      edges[y][x] = Math.sqrt(sx * sx + sy * sy);
    }
  }

  return edges;
}

function localContrast(gray: number[][], x: number, y: number): number {
  const height = gray.length;
  const width = gray[0].length;
  const center = gray[y][x];
  let ringTotal = 0;
  let ringCount = 0;
  for (let oy = -4; oy <= 4; oy++) {
    for (let ox = -4; ox <= 4; ox++) {
      if (Math.abs(ox) < 2 && Math.abs(oy) < 2) continue;
      const px = x + ox;
      const py = y + oy;
      if (px >= 0 && px < width && py >= 0 && py < height) {
        ringTotal += gray[py][px];
        ringCount++;
      }
    }
  }
  return ringCount ? ringTotal / ringCount - center : 0;
}

function refinePoint(gray: number[][], edges: number[][], candidate: Point, radius: number): Point {
  const size = edges.length;
  const cx = (candidate.x / 500) * size;
  const cy = (candidate.y / 500) * size;
  let bestX = cx;
  let bestY = cy;
  let bestScore = -1;

  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y++) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x++) {
      if (x < 0 || x >= size || y < 0 || y >= size) continue;
      const distance = Math.hypot(x - cx, y - cy);
      // Palm creases are usually darker than their immediate skin ring and
      // also produce an edge response. Combining both signals is more stable
      // than following the strongest global Sobel pixel (often a finger edge).
      const score = localContrast(gray, x, y) * 2.2 + edges[y][x] * 0.65 - distance * 2.2;
      if (score > bestScore) {
        bestScore = score;
        bestX = x;
        bestY = y;
      }
    }
  }

  return point((bestX / size) * 500, (bestY / size) * 500);
}

function buildAnatomicalLines(hand: Hand, fingerDirection: Direction, bounds: Bounds | null): LinesState {
  const center = point(250, 250);
  const fingerAxis = directionToVector(fingerDirection);
  // Palmar view, fingers up: the right thumb is on the viewer's left,
  // while the left thumb is on the viewer's right.
  const thumbAxis = hand === "right" ? rotateCounterClockwise(fingerAxis) : rotateClockwise(fingerAxis);

  const sizeScale = bounds
    ? clamp(Math.max(bounds.width, bounds.height) / 500, 0.78, 1.08)
    : 1;
  const across = sizeScale;
  const along = sizeScale;

  return {
    heart: {
      start: project(center, thumbAxis, fingerAxis, -142 * across, 74 * along),
      control: project(center, thumbAxis, fingerAxis, -34 * across, 92 * along),
      end: project(center, thumbAxis, fingerAxis, 82 * across, 124 * along),
    },
    head: {
      start: project(center, thumbAxis, fingerAxis, 112 * across, 24 * along),
      control: project(center, thumbAxis, fingerAxis, -14 * across, -32 * along),
      end: project(center, thumbAxis, fingerAxis, -158 * across, -86 * along),
    },
    life: {
      start: project(center, thumbAxis, fingerAxis, 118 * across, 34 * along),
      control: project(center, thumbAxis, fingerAxis, -82 * across, -58 * along),
      end: project(center, thumbAxis, fingerAxis, -18 * across, -174 * along),
    },
    fate: {
      start: project(center, thumbAxis, fingerAxis, -10 * across, -176 * along),
      control: project(center, thumbAxis, fingerAxis, 8 * across, -38 * along),
      end: project(center, thumbAxis, fingerAxis, 4 * across, 112 * along),
    },
  };
}

function refineLines(imageData: ImageData, lines: LinesState): LinesState {
  const gray = toGrayscale(imageData);
  const edges = sobel(gray);
  const radius = Math.max(10, Math.floor(imageData.width * 0.035));

  // Refine all points, but keep the search local so the anatomical template
  // remains a guardrail when the photo has shadows or background clutter.
  return {
    heart: {
      start: refinePoint(gray, edges, lines.heart.start, radius),
      control: refinePoint(gray, edges, lines.heart.control, radius),
      end: refinePoint(gray, edges, lines.heart.end, radius),
    },
    head: {
      start: refinePoint(gray, edges, lines.head.start, radius),
      control: refinePoint(gray, edges, lines.head.control, radius),
      end: refinePoint(gray, edges, lines.head.end, radius),
    },
    life: {
      start: refinePoint(gray, edges, lines.life.start, radius),
      control: refinePoint(gray, edges, lines.life.control, radius),
      end: refinePoint(gray, edges, lines.life.end, radius),
    },
    fate: {
      start: refinePoint(gray, edges, lines.fate.start, radius),
      control: refinePoint(gray, edges, lines.fate.control, radius),
      end: refinePoint(gray, edges, lines.fate.end, radius),
    },
  };
}

export const defaultLinesForHand: Record<Hand, LinesState> = {
  left: buildAnatomicalLines("left", "up", null),
  right: buildAnatomicalLines("right", "up", null),
};

export function autoDetectLines(imageDataUrl: string, hand: Hand = "right"): Promise<LinesState | null> {
  return new Promise((resolve) => {
    const img = document.createElement("img") as HTMLImageElement;

    img.onload = () => {
      try {
        const cropSize = Math.min(img.width, img.height);
        if (cropSize < 160) {
          resolve(null);
          return;
        }
        const canvas = document.createElement("canvas");
        // Keep analysis responsive on high-resolution phone photos while
        // retaining enough detail for local edge refinement.
        const analysisSize = Math.min(cropSize, 720);
        canvas.width = analysisSize;
        canvas.height = analysisSize;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }

        const sx = (img.width - cropSize) / 2;
        const sy = (img.height - cropSize) / 2;
        ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, analysisSize, analysisSize);

        const imageData = ctx.getImageData(0, 0, cropSize, cropSize);
        const mask = getSkinMask(imageData);
        const bounds = getBounds(mask);
        const direction = bounds ? detectFingerDirection(mask, bounds) : "up";
        const anatomical = buildAnatomicalLines(hand, direction, bounds);

        resolve(refineLines(imageData, anatomical));
      } catch (error) {
        console.error("Ошибка авто-определения:", error);
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = imageDataUrl;
  });
}
