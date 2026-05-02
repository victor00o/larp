import {
  createEmptyListingExtraction,
} from "./contracts.js";

function parsePrice(value) {
  const numeric = String(value || "").replace(/[^0-9.]/g, "");
  return numeric ? Number(numeric) : 0;
}

function normalizeString(value) {
  return typeof value === "string" ? value : "";
}

function normalizeNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizeAgentQLListingPage(url, payload = {}) {
  const listing = payload?.data?.listing || {};
  const base = createEmptyListingExtraction(url);

  return {
    ...base,
    project_name: normalizeString(listing.project_name || payload?.data?.title),
    address_or_block: normalizeString(listing.address_or_block),
    location: normalizeString(listing.location),
    district_or_town: normalizeString(listing.district_or_town),
    price: parsePrice(listing.price_text),
    bedrooms: normalizeNumber(listing.bedrooms),
    bathrooms: normalizeNumber(listing.bathrooms),
    area_sqft: normalizeNumber(listing.area_sqft),
    floor_level: normalizeString(listing.floor_level),
    flat_type: normalizeString(listing.flat_type),
    lease_commence_year:
      listing.lease_commence_year === undefined || listing.lease_commence_year === null
        ? null
        : normalizeNumber(listing.lease_commence_year),
    description: normalizeString(listing.description),
    agent_name: normalizeString(listing.agent_name),
    image_urls: normalizeArray(listing.image_urls).map((item) => normalizeString(item)),
  };
}

export function normalizeAgentQLResultPage(payload = {}) {
  const results = normalizeArray(payload?.data?.results);

  return results.map((item) => ({
    title: normalizeString(item.title),
    url: normalizeString(item.url),
    project_name: normalizeString(item.project_name),
    address_or_block: normalizeString(item.address_or_block),
    district_or_town: normalizeString(item.district_or_town),
    price: parsePrice(item.price_text),
    bedrooms: normalizeNumber(item.bedrooms),
    bathrooms: normalizeNumber(item.bathrooms),
    area_sqft: normalizeNumber(item.area_sqft),
    flat_type: normalizeString(item.flat_type),
  }));
}
