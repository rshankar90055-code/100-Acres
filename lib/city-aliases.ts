const CITY_SLUG_ALIASES: Record<string, string[]> = {
  mysuru: ['mysore'],
  mysore: ['mysuru'],
  mangaluru: ['mangalore'],
  mangalore: ['mangaluru'],
  shivamogga: ['shimoga'],
  shimoga: ['shivamogga'],
  hubballi: ['hubli'],
  hubli: ['hubballi'],
  belagavi: ['belgaum'],
  belgaum: ['belagavi'],
}

export function getCitySlugCandidates(slug: string) {
  return [slug, ...(CITY_SLUG_ALIASES[slug] || [])]
}
