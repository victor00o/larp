export const LISTING_PAGE_QUERY = `
{
  title
  listing {
    project_name
    address_or_block
    location
    district_or_town
    price_text
    bedrooms
    bathrooms
    area_sqft
    floor_level
    flat_type
    lease_commence_year
    description
    agent_name
    image_urls[]
  }
}
`.trim();

export const RESULT_PAGE_QUERY = `
{
  page_title
  results[] {
    title
    url
    project_name
    address_or_block
    district_or_town
    price_text
    bedrooms
    bathrooms
    area_sqft
    flat_type
  }
}
`.trim();
