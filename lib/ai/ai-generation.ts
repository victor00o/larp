"use client";

import type { GenerateType } from "@/lib/types";

export async function generateGameContent<T>(type: GenerateType, gameState: unknown) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type, gameState }),
  });

  if (!response.ok) {
    throw new Error(`Generation failed with status ${response.status}`);
  }

  return (await response.json()) as { data: T; fallbackUsed: boolean };
}
