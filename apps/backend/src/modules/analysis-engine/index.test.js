import test from "node:test";
import assert from "node:assert/strict";

import { buildDuplicateEvidence, scoreDuplicateCandidate } from "../duplicate-matcher/index.js";
import { analyzeComparables, computePsf, derivePricingVerdict } from "../comparable-analyzer/index.js";
import { runAnalysisEngine } from "./index.js";

test("computePsf returns 0 when data is missing", () => {
  assert.equal(computePsf(0, 1000), 0);
  assert.equal(computePsf(500000, 0), 0);
});

test("private duplicate scoring favors project-name matches", () => {
  const subject = {
    project_name: "The Avenir",
    address_or_block: "8 River Valley Close",
    price: 3280000,
    area_sqft: 1528,
    bedrooms: 3,
    flat_type: "",
    agent_name: "Cheryl Tan",
    image_urls: ["a.jpg"],
  };
  const candidate = {
    project_name: "Avenir",
    address_or_block: "River Valley Close",
    price: 3298000,
    area_sqft: 1518,
    bedrooms: 3,
    flat_type: "",
    agent_name: "Marcus Goh",
    image_urls: ["a.jpg"],
  };

  const scored = scoreDuplicateCandidate(subject, candidate, "private_residential");
  assert.ok(scored.match_score >= 0.55);
  assert.ok(scored.reason.some((item) => item.includes("project-name") || item.includes("address")));
});

test("hdb duplicate evidence uses block and flat-type cues", () => {
  const subject = {
    project_name: "",
    address_or_block: "211 Bishan Street 23",
    location: "Bishan",
    price: 798000,
    area_sqft: 1001,
    bedrooms: 3,
    flat_type: "4 ROOM",
    agent_name: "Jasmine Lim",
    image_urls: ["b.jpg"],
  };
  const candidates = [
    {
      url: "https://example.com/hdb",
      address_or_block: "Blk 211 Bishan St 23",
      price: 808000,
      area_sqft: 1001,
      flat_type: "4 ROOM",
      agent_name: "Jasmine Lim",
      image_urls: ["b.jpg"],
      listed_at: "2026-02-20",
    },
  ];

  const summary = buildDuplicateEvidence(subject, candidates, "hdb");
  assert.equal(summary.duplicates.length, 1);
  assert.ok(summary.confidence > 0.5);
});

test("pricing verdict can tilt overpriced with long days on market", () => {
  assert.equal(derivePricingVerdict(820, 780, "hdb", 60), "overpriced");
  assert.equal(derivePricingVerdict(730, 780, "hdb", 10), "underpriced");
});

test("analysis engine returns believable private mock outputs", () => {
  const listing = {
    project_name: "The Avenir",
    address_or_block: "8 River Valley Close",
    location: "River Valley",
    price: 3280000,
    area_sqft: 1528,
    bedrooms: 3,
    bathrooms: 2,
    flat_type: "",
    agent_name: "Cheryl Tan",
    image_urls: ["avenir-1.jpg", "avenir-2.jpg"],
  };

  const duplicateCandidates = [
    {
      url: "https://example.com/relist-1",
      project_name: "The Avenir",
      address_or_block: "8 River Valley Close",
      price: 3320000,
      area_sqft: 1528,
      bedrooms: 3,
      agent_name: "Cheryl Tan",
      image_urls: ["avenir-1.jpg"],
      listed_at: "2026-01-14",
    },
  ];

  const comparables = [
    { url: "1", project_name_or_block: "The Avenir", property_type: "private_residential", price: 3210000, area_sqft: 1507, psf: 2130, match_type: "same_project" },
    { url: "2", project_name_or_block: "The Avenir", property_type: "private_residential", price: 3175000, area_sqft: 1496, psf: 2122, match_type: "same_project" },
    { url: "3", project_name_or_block: "Irwell Hill Residences", property_type: "private_residential", price: 3030000, area_sqft: 1421, psf: 2132, match_type: "nearby" },
  ];

  const result = runAnalysisEngine({
    listing,
    propertyType: "private_residential",
    duplicateCandidates,
    comparables,
    sourceSummary: {
      listing_sources: [],
      public_data_sources: ["URA private residential transaction references"],
      notes: [],
    },
  });

  assert.equal(result.signals.subject_psf, 2147);
  assert.equal(result.signals.median_comparable_psf, 2130);
  assert.equal(result.signals.pricing_signal, "fair");
  assert.ok(result.explanation.includes("private residential"));
});
