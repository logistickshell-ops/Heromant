import { LinesState, Point } from "./palmistryRules";

type Hand = "left" | "right";
type Direction = "up" | "down" | "left" | "right";
interface Vec { x: number; y: number }
interface Bounds { top: number; bottom: number; left: number; right: number; width: number; height: number; imageWidth: number; imageHeight: number; coverage: number }
interface GrayImage { values: number[][]; width: number; height: number }

const clamp = (value: number, min = 18, max = 482) => Math.max(min, Math.min(max, value));
const point = (x: number, y: number): Point => ({ x: clamp(x), y: clamp(y) });

function directionVector(direction: Direction): Vec {
  if (direction === "down") return { x: 0, y: 1 };
  if (direction === "left") return { x: -1, y: 0 };
  if (direction === "right") return { x: 1, y: 0 };
  return { x: 0, y: -1 };
}

function rotateClockwise(v: Vec): Vec { return { x: -v.y, y: v.x }; }
function rotateCounterClockwise(v: Vec): Vec { return { x: v.y, y: -v.x }; }

function rgbToSkin(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const spread = max - min;
  const warm = r > b * 1.08 && g > b * 0.9 && r > 65 && g > 38;
  const saturation = max === 0 ? 0 : spread / max;
  const hueLike = r >= g * 0.78 && r >= b * 1.08 && saturation < 0.78;
  return warm && hueLike && max > 45;
}

function buildGray(imageData: ImageData): GrayImage {
  const { data, width, height } = imageData;
  const values: number[][] = Array.from({ length: height }, () => Array<number>(width).fill(0));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      values[y][x] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
  }
  return { values, width, height };
}

function skinMask(imageData: ImageData): boolean[][] {
  const { data, width, height } = imageData;
  return Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => {
    const i = (y * width + x) * 4;
    return rgbToSkin(data[i], data[i + 1], data[i + 2]);
  }));
}

function maskBounds(mask: boolean[][]): Bounds | null {
  const height = mask.length;
  const width = mask[0]?.length ?? 0;
  let top = height; let left = width; let right = -1; let bottom = -1; let count = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!mask[y][x]) continue;
      count++;
      top = Math.min(top, y); bottom = Math.max(bottom, y);
      left = Math.min(left, x); right = Math.max(right, x);
    }
  }
  const coverage = width * height ? count / (width * height) : 0;
  if (right < 0 || coverage < 0.045 || coverage > 0.88) return null;
  return { top, bottom, left, right, width: right - left, height: bottom - top, imageWidth: width, imageHeight: height, coverage };
}

function countMask(mask: boolean[][], x1: number, y1: number, x2: number, y2: number): number {
  let total = 0;
  const width = mask[0].length;
  for (let y = Math.max(0, Math.floor(y1)); y < Math.min(mask.length, Math.ceil(y2)); y++) {
    for (let x = Math.max(0, Math.floor(x1)); x < Math.min(width, Math.ceil(x2)); x++) total += mask[y][x] ? 1 : 0;
  }
  return total;
}

function estimateFingerDirection(mask: boolean[][], bounds: Bounds): Direction {
  const { left, right, top, bottom, width, height } = bounds;
  const topBand = countMask(mask, left, top, right + 1, top + height * 0.2) / Math.max(1, width * height * 0.2);
  const bottomBand = countMask(mask, left, bottom - height * 0.2, right + 1, bottom + 1) / Math.max(1, width * height * 0.2);
  if (topBand >= bottomBand * 0.78) return "up";
  if (bottomBand >= topBand * 1.35) return "down";
  return height >= width ? "up" : "right";
}

function buildGrayIntegral(gray: GrayImage): number[][] {
  const integral = Array.from({ length: gray.height + 1 }, () => Array<number>(gray.width + 1).fill(0));
  for (let y = 1; y <= gray.height; y++) {
    let row = 0;
    for (let x = 1; x <= gray.width; x++) {
      row += gray.values[y - 1][x - 1];
      integral[y][x] = integral[y - 1][x] + row;
    }
  }
  return integral;
}

function areaMean(integral: number[][], x: number, y: number, radius: number): number {
  const h = integral.length - 1; const w = integral[0].length - 1;
  const x1 = Math.max(0, Math.floor(x - radius)); const y1 = Math.max(0, Math.floor(y - radius));
  const x2 = Math.min(w, Math.ceil(x + radius + 1)); const y2 = Math.min(h, Math.ceil(y + radius + 1));
  const area = Math.max(1, (x2 - x1) * (y2 - y1));
  return (integral[y2][x2] - integral[y1][x2] - integral[y2][x1] + integral[y1][x1]) / area;
}

function edgeStrength(gray: GrayImage, x: number, y: number): number {
  const px = (xx: number, yy: number) => gray.values[Math.max(0, Math.min(gray.height - 1, yy))][Math.max(0, Math.min(gray.width - 1, xx))];
  return Math.abs(px(x + 1, y) - px(x - 1, y)) + Math.abs(px(x, y + 1) - px(x, y - 1));
}

function creaseScore(gray: GrayImage, integral: number[][], x: number, y: number, normal: Vec): number {
  const cx = Math.round(x); const cy = Math.round(y);
  const center = areaMean(integral, cx, cy, 1.3);
  const ringA = areaMean(integral, cx + normal.x * 5, cy + normal.y * 5, 2.5);
  const ringB = areaMean(integral, cx - normal.x * 5, cy - normal.y * 5, 2.5);
  return ((ringA + ringB) / 2 - center) * 1.9 + edgeStrength(gray, cx, cy) * 0.18;
}

function quadratic(a: Point, b: Point, c: Point, t: number): Point {
  const u = 1 - t;
  return point(u * u * a.x + 2 * u * t * b.x + t * t * c.x, u * u * a.y + 2 * u * t * b.y + t * t * c.y);
}

function project(center: Point, thumbAxis: Vec, fingerAxis: Vec, across: number, along: number, xScale: number, yScale: number): Point {
  return point(center.x + thumbAxis.x * across * xScale + fingerAxis.x * along * yScale, center.y + thumbAxis.y * across * xScale + fingerAxis.y * along * yScale);
}

function buildPalmTemplate(hand: Hand, direction: Direction, bounds: Bounds | null): LinesState {
  const fingerAxis = directionVector(direction);
  const thumbAxis = hand === "right" ? rotateCounterClockwise(fingerAxis) : rotateClockwise(fingerAxis);
  const center = bounds ? point(((bounds.left + bounds.right) / 2 / bounds.imageWidth) * 500, ((bounds.top + bounds.bottom) / 2 / bounds.imageHeight) * 500) : point(250, 250);
  const scaleX = bounds ? Math.max(.68, Math.min(1.18, bounds.width / 290)) : 1;
  const scaleY = bounds ? Math.max(.68, Math.min(1.18, bounds.height / 430)) : 1;
  return {
    heart: { start: project(center, thumbAxis, fingerAxis, -142, 74, scaleX, scaleY), control: project(center, thumbAxis, fingerAxis, -34, 92, scaleX, scaleY), end: project(center, thumbAxis, fingerAxis, 82, 124, scaleX, scaleY) },
    head: { start: project(center, thumbAxis, fingerAxis, 112, 24, scaleX, scaleY), control: project(center, thumbAxis, fingerAxis, -14, -32, scaleX, scaleY), end: project(center, thumbAxis, fingerAxis, -158, -86, scaleX, scaleY) },
    life: { start: project(center, thumbAxis, fingerAxis, 118, 34, scaleX, scaleY), control: project(center, thumbAxis, fingerAxis, -82, -58, scaleX, scaleY), end: project(center, thumbAxis, fingerAxis, -18, -174, scaleX, scaleY) },
    fate: { start: project(center, thumbAxis, fingerAxis, -10, -176, scaleX, scaleY), control: project(center, thumbAxis, fingerAxis, 8, -38, scaleX, scaleY), end: project(center, thumbAxis, fingerAxis, 4, 112, scaleX, scaleY) },
  };
}

function traceLine(gray: GrayImage, integral: number[][], line: LinesState["heart"], radius: number): LinesState["heart"] {
  const samples: Point[] = [];
  let previous: Point | null = null;
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const base = quadratic(line.start, line.control, line.end, t);
    const before = quadratic(line.start, line.control, line.end, Math.max(0, t - .04));
    const after = quadratic(line.start, line.control, line.end, Math.min(1, t + .04));
    const tangent = { x: after.x - before.x, y: after.y - before.y };
    const length = Math.hypot(tangent.x, tangent.y) || 1;
    const normal = { x: -tangent.y / length, y: tangent.x / length };
    let best = base; let bestScore = -Infinity;
    for (let offset = -radius; offset <= radius; offset += Math.max(3, radius / 4)) {
      const candidate = { x: base.x + normal.x * offset, y: base.y + normal.y * offset };
      const px = (candidate.x / 500) * gray.width; const py = (candidate.y / 500) * gray.height;
      const score = creaseScore(gray, integral, px, py, normal) - (previous ? Math.hypot(candidate.x - previous.x, candidate.y - previous.y) * .035 : 0);
      if (score > bestScore) { bestScore = score; best = point(candidate.x, candidate.y); }
    }
    samples.push(best); previous = best;
  }
  return { start: samples[0], control: samples[5], end: samples[10] };
}

function refineLines(imageData: ImageData, template: LinesState): LinesState {
  const gray = buildGray(imageData);
  const integral = buildGrayIntegral(gray);
  const radius = Math.max(7, Math.round(gray.width * .025));
  return {
    heart: traceLine(gray, integral, template.heart, radius),
    head: traceLine(gray, integral, template.head, radius),
    life: traceLine(gray, integral, template.life, radius),
    fate: traceLine(gray, integral, template.fate, radius),
  };
}

export const defaultLinesForHand: Record<Hand, LinesState> = {
  left: buildPalmTemplate("left", "up", null),
  right: buildPalmTemplate("right", "up", null),
};

export function autoDetectLines(imageDataUrl: string, hand: Hand = "right"): Promise<LinesState | null> {
  return new Promise((resolve) => {
    const image = document.createElement("img");
    image.onload = () => {
      try {
        const cropSize = Math.min(image.naturalWidth || image.width, image.naturalHeight || image.height);
        if (cropSize < 180) { resolve(null); return; }
        const size = Math.min(512, cropSize);
        const canvas = document.createElement("canvas"); canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) { resolve(null); return; }
        const sx = ((image.naturalWidth || image.width) - cropSize) / 2;
        const sy = ((image.naturalHeight || image.height) - cropSize) / 2;
        ctx.drawImage(image, sx, sy, cropSize, cropSize, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size);
        const mask = skinMask(data);
        const bounds = maskBounds(mask);
        if (!bounds || bounds.width < size * .25 || bounds.height < size * .3) { resolve(null); return; }
        const direction = estimateFingerDirection(mask, bounds);
        const template = buildPalmTemplate(hand, direction, bounds);
        resolve(refineLines(data, template));
      } catch (error) {
        console.warn("Автоанализ ладони недоступен, используется ручная калибровка", error);
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = imageDataUrl;
  });
}
