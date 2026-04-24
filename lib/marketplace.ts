export const marketplaceCategories = [
  { value: 'car', label: 'Cars' },
  { value: 'bike', label: 'Bikes' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'appliance', label: 'Appliances' },
] as const

export type MarketplaceCategory = (typeof marketplaceCategories)[number]['value']

export const categoryLabels: Record<MarketplaceCategory, string> = {
  car: 'Cars',
  bike: 'Bikes',
  electronics: 'Electronics',
  appliance: 'Appliances',
}

export const marketplaceConditionOptions = [
  { value: 'new', label: 'Brand New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
] as const

export const vehicleFuelOptions = [
  'Petrol',
  'Diesel',
  'Electric',
  'Hybrid',
  'CNG',
] as const

export const vehicleTransmissionOptions = ['Manual', 'Automatic'] as const

export const subcategoriesByCategory: Record<MarketplaceCategory, string[]> = {
  car: ['Hatchback', 'Sedan', 'SUV', 'Luxury', 'Commercial'],
  bike: ['Scooter', 'Commuter', 'Sports Bike', 'Cruiser', 'Electric Bike'],
  electronics: ['Phone', 'Laptop', 'Tablet', 'TV', 'Camera', 'Gaming'],
  appliance: ['Refrigerator', 'Washing Machine', 'Air Conditioner', 'Microwave', 'Kitchen Appliance'],
}

export function getMarketplaceCategoryLabel(category: string | null | undefined) {
  if (!category) return 'Marketplace'
  return categoryLabels[category as MarketplaceCategory] || category
}

export function formatMarketplacePrice(price: number) {
  if (price >= 10000000) return `${(price / 10000000).toFixed(2)} Cr`
  if (price >= 100000) return `${(price / 100000).toFixed(2)} L`
  return price.toLocaleString('en-IN')
}

export function generateMarketplaceSlug(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
    '-' +
    Date.now().toString(36)
  )
}
