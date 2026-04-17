import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Search, Phone, Home, ArrowRight } from 'lucide-react'

const steps = [
  {
    step: '01',
    icon: Search,
    title: 'Search Properties',
    description: 'Browse verified listings in your city. Filter by type, price, and more.',
  },
  {
    step: '02',
    icon: Phone,
    title: 'Connect with Agent',
    description: 'Request a callback or message on WhatsApp. Get a response within minutes.',
  },
  {
    step: '03',
    icon: Home,
    title: 'Visit & Finalize',
    description: 'Schedule a visit, inspect the property, and close the deal with confidence.',
  },
]

export function HowItWorks() {
  return (
    <section className="bg-primary/5 py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Finding your dream home is just three simple steps away
          </p>
        </div>

        {/* Steps */}
        <div className="relative mx-auto max-w-4xl">
          {/* Connection Line - Desktop */}
          <div className="absolute left-0 right-0 top-16 hidden h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />
          
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {/* Step Number */}
                <div className="relative mx-auto mb-6 flex h-32 w-32 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-primary/10" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-card shadow-lg">
                    <step.icon className="h-10 w-10 text-primary" />
                  </div>
                  <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {step.step}
                  </div>
                </div>

                {/* Content */}
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link href="/properties">
            <Button size="lg" className="gap-2">
              Start Your Search
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
