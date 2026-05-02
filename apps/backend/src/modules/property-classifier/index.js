import { resolvePropertyRouting } from "../property-router/index.js";

export function classifyProperty({ input = "", overridePropertyType = null, listingMetadata = {} }) {
  return resolvePropertyRouting({
    input,
    overridePropertyType,
    listingMetadata,
  });
}
