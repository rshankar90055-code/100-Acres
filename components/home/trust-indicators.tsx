import { 
  BadgeCheck, 
  Clock, 
  Shield, 
  Users, 
  MessageSquare,
  MapPin
} from 'lucide-react'

const trustFeatures = [
  {
    icon: BadgeCheck,
    title: '100% Verified Listings',
    description: 'Every property is physically verified by our local agents before going live.',
  },
  {
    icon: Clock,
    title: 'Real-Time Updates',
    description: 'Properties marked sold instantly. No more chasing already-sold listings.',
  },
  {
    icon: Shield,
    title: 'Trusted Local Agents',
    description: 'Work with verified agents who know your city inside out.',
  },
  {
    icon: Users,
    title: 'Direct Communication',
    description: 'Connect directly with property owners and agents. No middlemen.',
  },
  {
    icon: MessageSquare,
    title: 'Multi-Language Support',
    description: 'Available in Kannada and English for your convenience.',
  },
  {
    icon: MapPin,
    title: 'Local Intelligence',
    description: 'Get insights on water supply, safety, schools, and more for every area.',
  },
]

export function TrustIndicators() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Why Choose 100acres?
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            We&apos;re building the most trusted real estate platform for small cities 
            by combining technology with real human verification.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trustFeatures.map((feature, index) => (
            <div 
              key={index}
              className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
