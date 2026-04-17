import Link from 'next/link'
import { Building2, Mail, Phone, MapPin } from 'lucide-react'

const footerLinks = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
  ],
  forBuyers: [
    { label: 'Search Properties', href: '/properties' },
    { label: 'Saved Properties', href: '/saved' },
    { label: 'Property Alerts', href: '/alerts' },
    { label: 'Home Loans', href: '/loans' },
  ],
  forAgents: [
    { label: 'Become an Agent', href: '/become-agent' },
    { label: 'Agent Dashboard', href: '/agent/dashboard' },
    { label: 'Pricing Plans', href: '/pricing' },
    { label: 'Agent Resources', href: '/resources' },
  ],
  cities: [
    { label: 'Mysuru', href: '/city/mysuru' },
    { label: 'Mangaluru', href: '/city/mangaluru' },
    { label: 'Hubli-Dharwad', href: '/city/hubli' },
    { label: 'Belgaum', href: '/city/belgaum' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">100acres</span>
            </Link>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Karnataka&apos;s most trusted real estate platform for Tier-2 and Tier-3 cities. 
              Every property verified by local agents.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:support@100acres.in" className="hover:text-primary">
                  support@100acres.in
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+918001234567" className="hover:text-primary">
                  +91 800 123 4567
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Bangalore, Karnataka, India</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-foreground">For Buyers</h4>
            <ul className="space-y-3">
              {footerLinks.forBuyers.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-foreground">For Agents</h4>
            <ul className="space-y-3">
              {footerLinks.forAgents.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Popular Cities */}
        <div className="mt-12 border-t border-border pt-8">
          <h4 className="mb-4 font-semibold text-foreground">Popular Cities</h4>
          <div className="flex flex-wrap gap-2">
            {footerLinks.cities.map((city) => (
              <Link
                key={city.href}
                href={city.href}
                className="rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {city.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
          <p>&copy; {new Date().getFullYear()} 100acres. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
