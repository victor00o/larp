import { createTraceStep } from "../../../../../packages/shared/src/index.js";
import { retrieveWithTinyFish, runTinyFishGoal, pollTinyFishRun } from "../../adapters/tinyfish/index.js";

export async function runTinyFishSync({ url, goal, propertyType, sourceFlow }) {
  return retrieveWithTinyFish({ url, goal, propertyType, sourceFlow });
}

export async function runTinyFishAsync({ url, goal }) {
  return runTinyFishGoal({ url, goal });
}

export async function streamTinyFishRun({ runId }) {
  const result = await pollTinyFishRun(runId);
  const trace = [
    createTraceStep("start_tinyfish_run", "completed", `Started TinyFish run ${runId}.`),
    createTraceStep(
      "await_tinyfish_completion",
      result.ok ? "completed" : "failed",
      result.ok ? `TinyFish run ${runId} completed.` : result.message
    ),
  ];

  return {
    ...result,
    trace,
  };
}
