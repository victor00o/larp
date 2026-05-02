const runtimeConfig = window.SHADOW_MARKET_CONFIG || {};
const backendBaseUrl = runtimeConfig.backendBaseUrl || "http://localhost:4000";

const form = document.querySelector("#analyze-form");
const modeSelect = document.querySelector("#mode");
const propertyTypeSelect = document.querySelector("#propertyType");
const mockScenarioSelect = document.querySelector("#mockScenarioId");
const inputField = document.querySelector("#input");
const analyzeButton = document.querySelector("#analyze-button");
const resultContainer = document.querySelector("#result");
const traceContainer = document.querySelector("#trace");
const errorBanner = document.querySelector("#error-banner");
const statusLine = document.querySelector("#status-line");
const traceTemplate = document.querySelector("#trace-item-template");
const traceStepOrder = [
  "extract_listing",
  "classify_property",
  "retrieve_listing_details",
  "retrieve_public_data_references",
  "retrieve_duplicate_candidates",
  "retrieve_comparable_candidates",
  "retrieve_market_context",
  "score_duplicates",
  "analyze_comparables",
  "generate_explanation",
  "request_failed",
];

const stepCopy = {
  extract_listing: {
    label: "Retrieving Listing Details",
    pending: "Waiting to prepare the subject listing.",
    running: "Inspecting the subject listing and preparing extraction context.",
  },
  classify_property: {
    label: "Classifying Property Type",
    pending: "Waiting to determine whether the subject is private residential or HDB.",
    running: "Classifying the property and choosing the right downstream branch.",
  },
  retrieve_market_context: {
    label: "Retrieving Public Data References",
    pending: "Waiting to pull source-aware listing and public-market references.",
    running: "Gathering public references, likely relists, and comparable candidates.",
  },
  retrieve_listing_details: {
    label: "Retrieving Listing Details",
    pending: "Waiting to normalize the source listing page.",
    running: "Extracting normalized listing details.",
  },
  retrieve_public_data_references: {
    label: "Retrieving Public Data References",
    pending: "Waiting to gather market references.",
    running: "Collecting public-market references for the subject property.",
  },
  retrieve_duplicate_candidates: {
    label: "Searching Duplicate Candidates",
    pending: "Waiting to search for relists and portal duplicates.",
    running: "Searching for likely duplicate and relisted listings.",
  },
  retrieve_comparable_candidates: {
    label: "Analyzing Comparable Inputs",
    pending: "Waiting to gather comparable candidates.",
    running: "Collecting comparable candidate data for PSF analysis.",
  },
  score_duplicates: {
    label: "Searching Duplicate Candidates",
    pending: "Waiting to score likely relists.",
    running: "Scoring duplicate signals across address, price, area, and images.",
  },
  analyze_comparables: {
    label: "Analyzing Comparables",
    pending: "Waiting to compute subject vs comparable PSF context.",
    running: "Computing PSF context and pricing position.",
  },
  generate_explanation: {
    label: "Generating Verdict",
    pending: "Waiting to write the final summary.",
    running: "Writing the final verdict and evidence-backed explanation.",
  },
  request_failed: {
    label: "Request Failed",
    pending: "Waiting to retry.",
    running: "Request failed.",
  },
};

const loadingTrace = [
  {
    step: "extract_listing",
    status: "running",
    message: stepCopy.extract_listing.running,
  },
  {
    step: "classify_property",
    status: "pending",
    message: stepCopy.classify_property.pending,
  },
  {
    step: "retrieve_market_context",
    status: "pending",
    message: stepCopy.retrieve_market_context.pending,
  },
  {
    step: "score_duplicates",
    status: "pending",
    message: stepCopy.score_duplicates.pending,
  },
  {
    step: "analyze_comparables",
    status: "pending",
    message: stepCopy.analyze_comparables.pending,
  },
  {
    step: "generate_explanation",
    status: "pending",
    message: stepCopy.generate_explanation.pending,
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toTitleCase(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function propertyTypePayloadValue() {
  return propertyTypeSelect.value === "auto" ? null : propertyTypeSelect.value;
}

function showError(message) {
  errorBanner.textContent = message;
  errorBanner.classList.remove("hidden");
}

function hideError() {
  errorBanner.textContent = "";
  errorBanner.classList.add("hidden");
}

function setLoading(isLoading) {
  analyzeButton.disabled = isLoading;
  analyzeButton.textContent = isLoading ? "Analyzing..." : "Analyze listing";
}

function renderTrace(trace = []) {
  traceContainer.innerHTML = "";

  const orderedTrace = [...trace].sort((left, right) => {
    const leftIndex = traceStepOrder.indexOf(left.step);
    const rightIndex = traceStepOrder.indexOf(right.step);
    return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex);
  });

  orderedTrace.forEach((item) => {
    const copy = stepCopy[item.step] || {};
    const fragment = traceTemplate.content.cloneNode(true);
    fragment.querySelector(".trace-step").textContent = copy.label || item.step.replaceAll("_", " ");
    const statusNode = fragment.querySelector(".trace-status");
    statusNode.textContent = item.status;
    statusNode.classList.add(`status-${item.status}`);
    fragment.querySelector(".trace-message").textContent = item.message;
    traceContainer.appendChild(fragment);
  });
}

function renderEmptyState(message = "Run a private or HDB demo scenario to see the full analysis output.") {
  resultContainer.className = "result-surface empty-state";
  resultContainer.innerHTML = `
    <div class="empty-copy">
      <div class="empty-badge">Ready for demo</div>
      <h3>Awaiting a property to investigate</h3>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function verdictClass(signal) {
  if (signal === "underpriced") return "signal-underpriced";
  if (signal === "overpriced") return "signal-overpriced";
  return "signal-fair";
}

function renderSources(sourceSummary = {}) {
  const items = [
    ...(sourceSummary.listing_sources || []).map((source) => `Listing source: ${source}`),
    ...(sourceSummary.public_data_sources || []).map((source) => `Public data: ${source}`),
    ...(sourceSummary.notes || []),
  ];

  if (!items.length) {
    return `<div class="source-note">No source notes available.</div>`;
  }

  return items
    .map((item) => `<div class="source-note">${escapeHtml(item)}</div>`)
    .join("");
}

function renderDuplicateEvidence(duplicates = []) {
  if (!duplicates.length) {
    return `<ol class="evidence-list"><li>No strong duplicate or relist evidence was found in this run.</li></ol>`;
  }

  return `
    <ol class="evidence-list">
      ${duplicates
        .map(
          (item) => `
            <li>
              <strong>${escapeHtml(item.url)}</strong><br />
              Score ${escapeHtml(item.match_score)} | ${formatCurrency(item.price)} | ${escapeHtml(item.area_sqft)} sqft
              <br />${escapeHtml((item.reason || []).join(", ") || "Similarity evidence not specified")}
            </li>
          `
        )
        .join("")}
    </ol>
  `;
}

function renderComparables(comparables = []) {
  if (!comparables.length) {
    return `<div class="table-wrap"><table><thead><tr><th>Comparable</th><th>Type</th><th>Price</th><th>Area</th><th>PSF</th></tr></thead><tbody><tr><td colspan="5">No comparables available.</td></tr></tbody></table></div>`;
  }

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Comparable</th>
            <th>Match</th>
            <th>Price</th>
            <th>Area</th>
            <th>PSF</th>
          </tr>
        </thead>
        <tbody>
          ${comparables
            .map(
              (item) => `
                <tr>
                  <td>${escapeHtml(item.project_name_or_block || item.url)}</td>
                  <td>${escapeHtml(item.match_type)}</td>
                  <td>${formatCurrency(item.price)}</td>
                  <td>${escapeHtml(item.area_sqft)} sqft</td>
                  <td>${escapeHtml(item.psf)}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderCrossSiteSummary(summary = {}) {
  const priceRows = summary.price_by_site || [];
  const differences = summary.metadata_differences || [];

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Site</th>
            <th>Observed Price</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody>
          ${
            priceRows.length
              ? priceRows
                  .map(
                    (row) => `
                      <tr>
                        <td>${escapeHtml(row.site)}</td>
                        <td>${formatCurrency(row.price)}</td>
                        <td>${escapeHtml(row.url)}</td>
                      </tr>
                    `
                  )
                  .join("")
              : '<tr><td colspan="3">No cross-site listing comparisons available.</td></tr>'
          }
        </tbody>
      </table>
    </div>
    <div class="meta-row">
      <span class="meta-pill">Same-property confidence ${Math.round((summary.same_property_confidence || 0) * 100)}%</span>
      ${(summary.sites_compared || []).map((site) => `<span class="meta-pill">${escapeHtml(site)}</span>`).join("")}
    </div>
    ${
      differences.length
        ? `<ol class="evidence-list">${differences.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`
        : `<p class="result-subtitle">No major cross-site metadata differences were detected.</p>`
    }
  `;
}

function renderPricingRecommendation(recommendation = {}, signals = {}) {
  const action = recommendation.action ? recommendation.action.replaceAll("_", " ") : "keep current price";
  const hasRange =
    recommendation.suggested_price_low !== null &&
    recommendation.suggested_price_high !== null &&
    recommendation.suggested_adjustment_pct_low !== null &&
    recommendation.suggested_adjustment_pct_high !== null;

  return `
    <section class="recommendation-card ${verdictClass(signals.pricing_signal)}">
      <div class="verdict-eyebrow">Pricing recommendation</div>
      <div class="verdict-signal">${escapeHtml(toTitleCase(action))}</div>
      <p>${escapeHtml(recommendation.reasoning || "No pricing recommendation available yet.")}</p>
      ${
        hasRange
          ? `
            <div class="detail-grid">
              <div class="metric">
                <div class="metric-label">Adjustment Range</div>
                <div class="metric-value">${escapeHtml(recommendation.suggested_adjustment_pct_low)}% to ${escapeHtml(recommendation.suggested_adjustment_pct_high)}%</div>
              </div>
              <div class="metric">
                <div class="metric-label">Suggested Price Band</div>
                <div class="metric-value">${formatCurrency(recommendation.suggested_price_low)} to ${formatCurrency(recommendation.suggested_price_high)}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Liquidity Signal</div>
                <div class="metric-value">${escapeHtml(toTitleCase(signals.liquidity_signal || "n/a"))}</div>
              </div>
            </div>
          `
          : `
            <div class="meta-row">
              <span class="meta-pill">Liquidity ${escapeHtml(toTitleCase(signals.liquidity_signal || "n/a"))}</span>
              <span class="meta-pill">Premium / Discount ${escapeHtml(signals.premium_discount_pct || 0)}%</span>
            </div>
          `
      }
    </section>
  `;
}

function renderResult(result) {
  const listing = result.listing || {};
  const signals = result.signals || {};
  const crossSiteSummary = result.cross_site_summary || {};
  const pricingRecommendation = result.pricing_recommendation || {};
  const verdictSentence =
    signals.pricing_signal === "underpriced"
      ? "This listing looks cheap relative to its current comparable context."
      : signals.pricing_signal === "overpriced"
        ? "This listing looks stretched relative to its current comparable context."
        : "This listing looks broadly in line with its comparable context.";

  resultContainer.className = "result-surface";
  resultContainer.innerHTML = `
    <div class="result-layout">
      ${renderPricingRecommendation(pricingRecommendation, signals)}
      <div class="result-top">
        <section class="verdict-card ${verdictClass(signals.pricing_signal)}">
          <div class="verdict-eyebrow">Pricing verdict</div>
          <div class="verdict-signal">${escapeHtml(toTitleCase(signals.pricing_signal || "fair"))}</div>
          <div class="verdict-summary">${escapeHtml(verdictSentence)}</div>
          <p>${escapeHtml(result.explanation || "")}</p>
          <div class="confidence-meter">
            <div class="confidence-bar">
              <div class="confidence-fill" style="width: ${Math.max(0, Math.min(100, Math.round((signals.confidence || 0) * 100)))}%"></div>
            </div>
            <div class="confidence-copy">Confidence ${Math.round((signals.confidence || 0) * 100)}%</div>
          </div>
        </section>

        <section class="detail-card">
          <div class="detail-head">
            <div>
              <h3 class="result-title">${escapeHtml(listing.project_name || listing.address_or_block || "Subject property")}</h3>
              <p class="result-subtitle">${escapeHtml(listing.address_or_block || listing.location || listing.portal || "No location summary")}</p>
            </div>
            <div class="meta-row">
              <span class="meta-pill">${escapeHtml(listing.property_type || "unknown")}</span>
              <span class="meta-pill">${escapeHtml(listing.portal || "manual-input")}</span>
            </div>
          </div>

          <div class="detail-grid">
            <div class="metric">
              <div class="metric-label">Price</div>
              <div class="metric-value">${formatCurrency(listing.price)}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Area</div>
              <div class="metric-value">${escapeHtml(listing.area_sqft)} sqft</div>
            </div>
            <div class="metric">
              <div class="metric-label">Subject PSF</div>
              <div class="metric-value">${escapeHtml(signals.subject_psf)}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Median Comparable PSF</div>
              <div class="metric-value">${escapeHtml(signals.median_comparable_psf)}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Estimated Relist Count</div>
              <div class="metric-value">${escapeHtml(signals.estimated_relist_count)}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Estimated True DOM</div>
              <div class="metric-value">${escapeHtml(signals.estimated_true_days_on_market)} days</div>
            </div>
            <div class="metric">
              <div class="metric-label">Premium / Discount</div>
              <div class="metric-value">${escapeHtml(signals.premium_discount_pct || 0)}%</div>
            </div>
            <div class="metric">
              <div class="metric-label">Liquidity Signal</div>
              <div class="metric-value">${escapeHtml(toTitleCase(signals.liquidity_signal || "n/a"))}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Cross-site Consistency</div>
              <div class="metric-value">${escapeHtml(toTitleCase(signals.cross_site_consistency_signal || "n/a"))}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Bedrooms</div>
              <div class="metric-value">${escapeHtml(listing.bedrooms || 0)}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Bathrooms</div>
              <div class="metric-value">${escapeHtml(listing.bathrooms || 0)}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Flat Type / Floor</div>
              <div class="metric-value">${escapeHtml(listing.flat_type || listing.floor_level || "n/a")}</div>
            </div>
          </div>
        </section>
      </div>

      <div class="evidence-grid">
        <section class="evidence-card">
          <div class="block-header">
            <div>
              <h3>Source Summary</h3>
              <p>Shows which listing and public data sources informed the output.</p>
            </div>
          </div>
          <div class="source-stack">
            ${renderSources(result.source_summary)}
          </div>
        </section>

        <section class="evidence-card">
          <div class="block-header">
            <div>
              <h3>Duplicate / Relist Evidence</h3>
              <p>Potential relist chain used to estimate true time on market.</p>
            </div>
          </div>
          ${renderDuplicateEvidence(result.duplicates)}
        </section>
      </div>

      <section class="table-card">
        <div class="block-header">
          <div>
            <h3>Cross-Site Comparison</h3>
            <p>How the same or similar listing appears across other sites.</p>
          </div>
        </div>
        ${renderCrossSiteSummary(crossSiteSummary)}
      </section>

      <section class="table-card">
        <div class="block-header">
          <div>
            <h3>Comparable Pricing Context</h3>
            <p>Comparable candidates used to derive the median PSF context.</p>
          </div>
        </div>
        ${renderComparables(result.comparables)}
      </section>
    </div>
  `;
}

async function loadScenarios() {
  const response = await fetch(`${backendBaseUrl}/mock-scenarios`);
  const payload = await response.json();
  mockScenarioSelect.innerHTML = payload.scenarios
    .map(
      (scenario) => `
        <option value="${escapeHtml(scenario.id)}">${escapeHtml(scenario.label)}</option>
      `
    )
    .join("");
}

function buildPayload({ scenarioId } = {}) {
  const payload = {
    mode: modeSelect.value,
    mockScenarioId: scenarioId || mockScenarioSelect.value,
    input: inputField.value.trim(),
  };

  const propertyType = propertyTypePayloadValue();
  if (propertyType) {
    payload.propertyType = propertyType;
  }

  return payload;
}

async function runAnalysis(payload) {
  hideError();
  setLoading(true);
  statusLine.textContent = "Shadow Market is working through the property step by step...";
  renderTrace(loadingTrace);

  try {
    const response = await fetch(`${backendBaseUrl}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      const message = result?.error?.message || "Analysis failed.";
      throw new Error(message);
    }

    renderTrace(result.trace || []);
    renderResult(result);
    statusLine.textContent = "Analysis complete. The verdict, evidence, and trace are ready to inspect.";
  } catch (error) {
    statusLine.textContent = "The agent hit an error before it could finish the run.";
    renderTrace([
      {
        step: "request_failed",
        status: "failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    ]);
    renderEmptyState("Fix the request or try a mock scenario to continue the demo.");
    showError(error instanceof Error ? error.message : "Unexpected frontend error.");
  } finally {
    setLoading(false);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runAnalysis(buildPayload());
});

modeSelect.addEventListener("change", () => {
  const isMock = modeSelect.value === "mock";
  mockScenarioSelect.disabled = !isMock;
  statusLine.textContent = isMock
    ? "Mock mode is selected. Great for a stable guided demo."
    : "Live mode is selected. The agent will use live placeholders and available integrations.";
});

document.querySelectorAll("[data-scenario]").forEach((button) => {
  button.addEventListener("click", async () => {
    modeSelect.value = "mock";
    mockScenarioSelect.disabled = false;
    mockScenarioSelect.value = button.dataset.scenario;
    inputField.value = "";
    propertyTypeSelect.value =
      button.dataset.scenario === "hdb-bishan-4rm" ? "hdb" : "private_residential";
    statusLine.textContent =
      button.dataset.scenario === "hdb-bishan-4rm"
        ? "Launching the HDB resale demo flow."
        : "Launching the private residential demo flow.";
    await runAnalysis(buildPayload({ scenarioId: button.dataset.scenario }));
  });
});

await loadScenarios();
renderTrace(loadingTrace.map((item) => ({ ...item, status: "pending" })));
