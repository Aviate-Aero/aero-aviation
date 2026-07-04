import Image from "next/image"
import Link from "next/link"

const footerLinks = {
  platform: [
    { label: "Flight Performance", href: "/flight-intel/flightdata" },
    { label: "Dispatch", href: "/flight-intel/dispatch" },
    { label: "Flight Tracker", href: "/flight-intel/flight-tracker" },
    { label: "Aviation Intelligence", href: "/flight-intel/aviation-report" },
  ],
  company: [
    { label: "About", href: "/about-us" },
    { label: "Newsletter Subscription", href: "/newsletter-pricing" },
    { label: "HR Policy", href: "/hr-policy" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "/contact" },
  ],
}

export function FooterSection() {
  return (
    <footer className="px-6 py-16 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              <Image
                src="/logos/officialLogo.svg"
                alt="Aero Aviation"
                width={450}
                height={86}
                className="h-[96px] w-auto"
                priority
              />
            </Link>

            <p className="mt-4 text-sm text-zinc-500 max-w-xs">
              AI-powered aviation intelligence for the modern aerospace industry.
            </p>

            <Link
              href="/newsletter-pricing"
              className="mt-5 inline-flex rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-300 transition-colors hover:bg-sky-500/20 hover:text-sky-200"
            >
              Subscribe to Newsletter
            </Link>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-zinc-100 mb-4">
              Flight Core Intelligence
            </h4>

            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-zinc-100 mb-4">
              Company
            </h4>

            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Address */}
          <div className="col-span-2">
            <h4 className="font-heading text-sm font-semibold text-zinc-100 mb-4">
              Our Email
            </h4>

            <address className="not-italic text-sm text-zinc-500 space-y-1">
              <a
                href="mailto:info@aeroaviation.me"
                className="block hover:text-zinc-300 transition-colors"
              >
                info@aeroaviation.me
              </a>

              <h4 className="font-heading text-sm font-semibold text-zinc-100 mb-3 mt-5">
                Download our App:
              </h4>

              {/* Mobile apps */}
              <div className="flex items-center gap-2">
                {/* App Store - Coming Soon */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 cursor-not-allowed select-none">
                  <svg
                    className="w-4 h-4 shrink-0 text-zinc-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>

                  <span className="text-xs text-zinc-500">iOS</span>

                  <span className="text-[10px] px-1.5 py-px rounded-full bg-sky-200/15 border border-sky-500/25 text-sky-500 leading-none">
                    Soon
                  </span>
                </div>

                {/* Google Play - Linked */}
                <Link
                  href="https://play.google.com/store/apps/details?id=com.flightcoreintelligence.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download Aero Aviation Android app on Google Play"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 transition-colors hover:bg-zinc-800/80"
                >
                  <svg
                    className="w-4 h-4 shrink-0 text-zinc-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3.18 23.76c.3.17.64.22.99.14l12.12-6.99-2.55-2.55-10.56 9.4zm-1.1-20.4C2.03 3.6 2 3.85 2 4.12v15.76c0 .27.03.52.08.76l.06.06 8.83-8.83v-.2L2.08 3.3l-.06.06zM20.06 10.5l-2.5-1.44-2.85 2.85 2.85 2.85 2.5-1.44c.72-.41.72-1.4.05-1.81l-.05-.01zM3.18.24L15.3 7.23l-2.55 2.55L2.17.38C2.47.3 2.82.07 3.18.24z" />
                  </svg>

                  <span className="text-xs text-zinc-500">Android</span>
                </Link>
              </div>
            </address>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-600">
            © {new Date().getFullYear()} Aero Aviation. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
