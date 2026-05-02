import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function pickOne<T>(values: T[], seed = Date.now()) {
  const index = Math.abs(seed) % values.length;
  return values[index];
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function titleCase(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function initialsFromName(name: string) {
  const bits = name.trim().split(/\s+/).slice(0, 2);
  return bits.map((bit) => bit[0]?.toUpperCase() ?? "").join("") || "SM";
}

export function formatDelta(value: number, kind: "number" | "money" | "percent" = "number") {
  const prefix = value > 0 ? "+" : "";
  if (kind === "money") return `${prefix}${formatMoney(value)}`;
  if (kind === "percent") return `${prefix}${value.toFixed(1)}%`;
  return `${prefix}${Math.round(value).toLocaleString()}`;
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
