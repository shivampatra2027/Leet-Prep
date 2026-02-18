import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { Sparkles, ArrowRight } from "lucide-react";

const defaultSections = [
  {
    title: "Community",
    links: [
      { name: "Discussions", href: "/dashboard" },
      { name: "Discord Server", href: "/dashboard" },
      { name: "Contributing", href: "/dashboard" },
      { name: "Events", href: "/dashboard" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Documentation", href: "/dashboard" },
      { name: "API Reference", href: "/dashboard" },
      { name: "Blog", href: "/dashboard" },
      { name: "Changelog", href: "/dashboard" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Support", href: "/support" },
      { name: "Cookie Policy", href: "/privacy" },
    ],
  },
];

const defaultSocialLinks = [
  { icon: <FaInstagram className="size-5" />, href: "#", label: "Instagram" },
  { icon: <FaFacebook className="size-5" />, href: "#", label: "Facebook" },
  { icon: <FaTwitter className="size-5" />, href: "#", label: "Twitter" },
  { icon: <FaLinkedin className="size-5" />, href: "#", label: "LinkedIn" },
];

const defaultLegalLinks = [
  { name: "Privacy", href: "/privacy" },
  { name: "Support", href: "/support" },
  { name: "Sitemap", href: "/sitemap.xml" },
];

const Footer7 = ({
  logo = {
    url: "/",
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg",
    alt: "Leet.IO logo",
    title: "Leet-prep",
  },
  sections = defaultSections,
  description = "The best platform for  students/professionals to prepare for coding interviews. Built with love by students, for students.",
  socialLinks = defaultSocialLinks,
  copyright = "© 2025 -2026 Leet-Prep. All rights reserved.",
  legalLinks = defaultLegalLinks,
}) => {
  return (
    <footer className="relative overflow-hidden border-t bg-gradient-to-b from-background via-background to-background/60">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.04]" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-20 relative">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="flex flex-col gap-5 lg:col-span-1">
            <a href={logo.url} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-glow">
                L
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{logo.title}</p>
                <p className="text-xs text-muted-foreground">Interview prep, redesigned</p>
              </div>
            </a>
            <div className="inline-flex items-center gap-2 rounded-full bg-foreground/5 px-3 py-1 text-xs font-semibold text-muted-foreground w-fit border border-border/80">
              <Sparkles className="h-4 w-4 text-primary" />
              12k+ learners shipped offers
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  className="h-10 w-10 rounded-xl border bg-card/70 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:col-span-3">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx} className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground tracking-wide uppercase">
                  {section.title}
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a
                        href={link.href}
                        className="hover:text-primary transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="space-y-4 lg:col-span-1">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Stay updated
              </h4>
              <p className="text-sm text-muted-foreground">
                Weekly drops: fresh company patterns, system design drills, and release notes.
              </p>
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="you@tech.com"
                  className="flex-1 rounded-xl border bg-background/60 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform"
                >
                  Join
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              <p className="text-xs text-muted-foreground">
                No spam. Opt out anytime.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t mt-14 pt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border bg-background/70 px-3 py-1 text-xs font-semibold text-foreground/80">
              ISO interview-ready
            </span>
            <span className="rounded-full border bg-background/70 px-3 py-1 text-xs font-semibold text-foreground/80">
              Updated Feb 2026
            </span>
          </div>
          <p>{copyright}</p>
          <div className="flex flex-wrap gap-3">
            {legalLinks.map((link, idx) => (
              <a key={idx} href={link.href} className="hover:text-foreground transition-colors">
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer7 };
