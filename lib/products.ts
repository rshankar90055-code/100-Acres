export interface SubscriptionPlan {
  id: string
  name: string
  nameKn: string
  description: string
  descriptionKn: string
  priceInCents: number
  interval: 'month' | 'year'
  features: string[]
  featuresKn: string[]
  maxListings: number
  featuredListings: number
  popular?: boolean
}

export interface FeaturedListingPackage {
  id: string
  name: string
  nameKn: string
  description: string
  descriptionKn: string
  priceInCents: number
  durationDays: number
  boostMultiplier: number
}

// Agent Subscription Plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    nameKn: 'ಸ್ಟಾರ್ಟರ್',
    description: 'Perfect for new agents getting started',
    descriptionKn: 'ಹೊಸ ಏಜೆಂಟ್‌ಗಳಿಗೆ ಪರಿಪೂರ್ಣ',
    priceInCents: 99900, // ₹999/month
    interval: 'month',
    features: [
      'Up to 10 property listings',
      'Basic lead management',
      'WhatsApp integration',
      'Email support',
    ],
    featuresKn: [
      '10 ಆಸ್ತಿ ಪಟ್ಟಿಗಳವರೆಗೆ',
      'ಮೂಲ ಲೀಡ್ ನಿರ್ವಹಣೆ',
      'WhatsApp ಏಕೀಕರಣ',
      'ಇಮೇಲ್ ಬೆಂಬಲ',
    ],
    maxListings: 10,
    featuredListings: 0,
  },
  {
    id: 'professional',
    name: 'Professional',
    nameKn: 'ಪ್ರೊಫೆಶನಲ್',
    description: 'For established agents with growing business',
    descriptionKn: 'ಬೆಳೆಯುತ್ತಿರುವ ವ್ಯಾಪಾರದೊಂದಿಗೆ ಸ್ಥಾಪಿತ ಏಜೆಂಟ್‌ಗಳಿಗೆ',
    priceInCents: 249900, // ₹2,499/month
    interval: 'month',
    features: [
      'Up to 50 property listings',
      'Advanced lead management',
      'WhatsApp + Call tracking',
      '2 Featured listings/month',
      'Priority support',
      'Analytics dashboard',
    ],
    featuresKn: [
      '50 ಆಸ್ತಿ ಪಟ್ಟಿಗಳವರೆಗೆ',
      'ಸುಧಾರಿತ ಲೀಡ್ ನಿರ್ವಹಣೆ',
      'WhatsApp + ಕಾಲ್ ಟ್ರ್ಯಾಕಿಂಗ್',
      '2 ವೈಶಿಷ್ಟ್ಯಗೊಳಿಸಿದ ಪಟ್ಟಿಗಳು/ತಿಂಗಳು',
      'ಆದ್ಯತೆ ಬೆಂಬಲ',
      'ವಿಶ್ಲೇಷಣೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    ],
    maxListings: 50,
    featuredListings: 2,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    nameKn: 'ಎಂಟರ್‌ಪ್ರೈಸ್',
    description: 'For agencies and top performers',
    descriptionKn: 'ಏಜೆನ್ಸಿಗಳು ಮತ್ತು ಉನ್ನತ ಪ್ರದರ್ಶಕರಿಗೆ',
    priceInCents: 499900, // ₹4,999/month
    interval: 'month',
    features: [
      'Unlimited property listings',
      'Premium lead management',
      'All communication channels',
      '10 Featured listings/month',
      'Dedicated account manager',
      'Advanced analytics',
      'API access',
      'Custom branding',
    ],
    featuresKn: [
      'ಅನಿಯಮಿತ ಆಸ್ತಿ ಪಟ್ಟಿಗಳು',
      'ಪ್ರೀಮಿಯಂ ಲೀಡ್ ನಿರ್ವಹಣೆ',
      'ಎಲ್ಲಾ ಸಂವಹನ ಚಾನೆಲ್‌ಗಳು',
      '10 ವೈಶಿಷ್ಟ್ಯಗೊಳಿಸಿದ ಪಟ್ಟಿಗಳು/ತಿಂಗಳು',
      'ಮೀಸಲಾದ ಖಾತೆ ವ್ಯವಸ್ಥಾಪಕ',
      'ಸುಧಾರಿತ ವಿಶ್ಲೇಷಣೆ',
      'API ಪ್ರವೇಶ',
      'ಕಸ್ಟಮ್ ಬ್ರ್ಯಾಂಡಿಂಗ್',
    ],
    maxListings: -1, // Unlimited
    featuredListings: 10,
  },
]

// Featured Listing Packages (one-time purchase)
export const FEATURED_PACKAGES: FeaturedListingPackage[] = [
  {
    id: 'boost-7',
    name: '7-Day Boost',
    nameKn: '7-ದಿನ ಬೂಸ್ಟ್',
    description: 'Feature your listing for 7 days',
    descriptionKn: '7 ದಿನಗಳವರೆಗೆ ನಿಮ್ಮ ಪಟ್ಟಿಯನ್ನು ವೈಶಿಷ್ಟ್ಯಗೊಳಿಸಿ',
    priceInCents: 29900, // ₹299
    durationDays: 7,
    boostMultiplier: 2,
  },
  {
    id: 'boost-15',
    name: '15-Day Boost',
    nameKn: '15-ದಿನ ಬೂಸ್ಟ್',
    description: 'Feature your listing for 15 days',
    descriptionKn: '15 ದಿನಗಳವರೆಗೆ ನಿಮ್ಮ ಪಟ್ಟಿಯನ್ನು ವೈಶಿಷ್ಟ್ಯಗೊಳಿಸಿ',
    priceInCents: 49900, // ₹499
    durationDays: 15,
    boostMultiplier: 3,
  },
  {
    id: 'boost-30',
    name: '30-Day Premium',
    nameKn: '30-ದಿನ ಪ್ರೀಮಿಯಂ',
    description: 'Maximum visibility for 30 days',
    descriptionKn: '30 ದಿನಗಳವರೆಗೆ ಗರಿಷ್ಠ ಗೋಚರತೆ',
    priceInCents: 79900, // ₹799
    durationDays: 30,
    boostMultiplier: 5,
  },
]

export function getSubscriptionPlan(id: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === id)
}

export function getFeaturedPackage(id: string): FeaturedListingPackage | undefined {
  return FEATURED_PACKAGES.find((pkg) => pkg.id === id)
}

export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceInCents / 100)
}
