import { PROPERTY_TYPES, SOURCE_FLOWS } from "../../../../../packages/shared/src/index.js";

function normalizeString(value) {
  return typeof value === "string" ? value : "";
}

function normalizeNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizeTinyFishListingDetails(rawListing = {}, fallbackUrl = "") {
  return {
    url: normalizeString(rawListing.url || fallbackUrl),
    portal: normalizeString(rawListing.portal),
    property_type:
      rawListing.property_type === PROPERTY_TYPES.HDB ? PROPERTY_TYPES.HDB : PROPERTY_TYPES.PRIVATE,
    project_name: normalizeString(rawListing.project_name),
    address_or_block: normalizeString(rawListing.address_or_block),
    location: normalizeString(rawListing.location),
    district_or_town: normalizeString(rawListing.district_or_town),
    price: normalizeNumber(rawListing.price),
    currency: normalizeString(rawListing.currency || "SGD"),
    bedrooms: normalizeNumber(rawListing.bedrooms),
    bathrooms: normalizeNumber(rawListing.bathrooms),
    area_sqft: normalizeNumber(rawListing.area_sqft),
    floor_level: normalizeString(rawListing.floor_level),
    flat_type: normalizeString(rawListing.flat_type),
    lease_commence_year:
      rawListing.lease_commence_year === null || rawListing.lease_commence_year === undefined
        ? null
        : normalizeNumber(rawListing.lease_commence_year),
    description: normalizeString(rawListing.description),
    agent_name: normalizeString(rawListing.agent_name),
    image_urls: normalizeArray(rawListing.image_urls).map((item) => normalizeString(item)),
  };
}

export function normalizeTinyFishPublicDataReferences(rawReferences = [], sourceFlow) {
  return normalizeArray(rawReferences).map((reference) => ({
    source_flow: sourceFlow,
    source: normalizeString(reference.source || (sourceFlow === SOURCE_FLOWS.HDB_RESALE ? "data.gov.sg / HDB" : "URA")),
    title: normalizeString(reference.title),
    url: normalizeString(reference.url),
    note: normalizeString(reference.note),
  }));
}

export function normalizeTinyFishComparables(rawComparables = [], propertyType) {
  return normalizeArray(rawComparables).map((item) => ({
    url: normalizeString(item.url),
    project_name_or_block: normalizeString(item.project_name_or_block),
    property_type: item.property_type === PROPERTY_TYPES.HDB ? PROPERTY_TYPES.HDB : propertyType,
    price: normalizeNumber(item.price),
    area_sqft: normalizeNumber(item.area_sqft),
    psf: normalizeNumber(item.psf),
    match_type: normalizeString(item.match_type || "public_record"),
  }));
}

export function normalizeTinyFishDuplicates(rawDuplicates = []) {
  return normalizeArray(rawDuplicates).map((item) => ({
    url: normalizeString(item.url),
    portal: normalizeString(item.portal),
    price: normalizeNumber(item.price),
    area_sqft: normalizeNumber(item.area_sqft),
    bedrooms: normalizeNumber(item.bedrooms),
    bathrooms: normalizeNumber(item.bathrooms),
    agent_name: normalizeString(item.agent_name),
    image_urls: normalizeArray(item.image_urls).map((url) => normalizeString(url)),
    listed_at: normalizeString(item.listed_at),
    project_name: normalizeString(item.project_name),
    address_or_block: normalizeString(item.address_or_block),
    flat_type: normalizeString(item.flat_type),
  }));
}
