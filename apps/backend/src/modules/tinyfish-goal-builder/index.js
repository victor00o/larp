export function buildTinyFishGoal({ task, propertyType, listing }) {
  const subject = listing.project_name || listing.address_or_block || listing.url || "subject property";
  const jsonContract =
    'Return strict JSON with keys: listing, public_data_references, duplicates, comparables, errors.';

  const common = [
    "Be source-aware and preserve source labels.",
    "Use only evidence you can actually retrieve.",
    jsonContract,
    "If evidence is missing, return empty arrays instead of prose.",
  ];

  if (task === "listing_extraction") {
    return [
      "Open the subject listing and extract normalized listing fields.",
      `Property type hint: ${propertyType}.`,
      ...common,
      `Subject: ${subject}`,
    ].join(" ");
  }

  if (task === "cross_site_screening") {
    return [
      "Find the same or highly similar property across other relevant listing sites.",
      propertyType === "hdb"
        ? "Prioritize block, town, flat type, area, price, image, and agent matching."
        : "Prioritize project name, address, area, bedrooms, price, image, and agent matching.",
      ...common,
      `Subject: ${subject}`,
    ].join(" ");
  }

  if (task === "public_data_retrieval") {
    return [
      propertyType === "hdb"
        ? "Retrieve HDB or data.gov.sg-oriented public references relevant to the subject flat."
        : "Retrieve URA-oriented public references relevant to the subject property.",
      "Return comparable-friendly normalized public data references.",
      ...common,
      `Subject: ${subject}`,
    ].join(" ");
  }

  return [
    "Retrieve listing details, cross-site candidates, duplicate evidence, and public reference data.",
    propertyType === "hdb"
      ? "Use HDB / data.gov.sg-oriented public sources."
      : "Use URA-oriented public sources.",
    ...common,
    `Subject: ${subject}`,
  ].join(" ");
}
