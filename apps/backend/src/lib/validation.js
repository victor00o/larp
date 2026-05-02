import { MODES, PROPERTY_TYPES } from "../../../../packages/shared/src/index.js";
import { HttpError } from "./http-error.js";

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateAnalyzeRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "INVALID_JSON_BODY", "Request body must be a JSON object.");
  }

  const input = typeof body.input === "string" ? body.input.trim() : "";
  const mode = typeof body.mode === "string" ? body.mode.trim() : MODES.MOCK;
  const mockScenarioId =
    typeof body.mockScenarioId === "string" ? body.mockScenarioId.trim() : "private-orchard-condo";
  const propertyType =
    typeof body.propertyType === "string" ? body.propertyType.trim() : null;

  if (!Object.values(MODES).includes(mode)) {
    throw new HttpError(400, "INVALID_MODE", "mode must be either 'mock' or 'live'.", {
      allowed_modes: Object.values(MODES),
    });
  }

  if (mode === MODES.MOCK && !isNonEmptyString(mockScenarioId)) {
    throw new HttpError(400, "MISSING_MOCK_SCENARIO_ID", "mockScenarioId is required in mock mode.");
  }

  if (mode === MODES.LIVE && !isNonEmptyString(input)) {
    throw new HttpError(400, "MISSING_INPUT", "input is required in live mode.");
  }

  if (propertyType !== null && !Object.values(PROPERTY_TYPES).includes(propertyType)) {
    throw new HttpError(
      400,
      "INVALID_PROPERTY_TYPE",
      "propertyType must be either 'private_residential' or 'hdb'.",
      { allowed_property_types: Object.values(PROPERTY_TYPES) }
    );
  }

  return {
    input,
    mode,
    mockScenarioId,
    propertyType,
  };
}
