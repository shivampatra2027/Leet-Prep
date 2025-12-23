import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

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
      { name: "Privacy Policy", href: "/dashboard" },
      { name: "Terms of Service", href: "/dashboard" },
      { name: "Cookie Policy", href: "/dashboard" },
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
  { name: "Privacy", href: "#" },
  { name: "Terms", href: "#" },
  { name: "Sitemap", href: "#" },
];

const Footer7 = ({
  logo = {
    url: "/",
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg",
    alt: "Leet.IO logo",
    title: "Leet.IO",
  },
  sections = defaultSections,
  description = "The best platform for KIIT students to prepare for coding interviews. Built with ❤️ by students, for students.",
  socialLinks = defaultSocialLinks,
  copyright = "© 2025 Leet.IO. All rights reserved.",
  legalLinks = defaultLegalLinks,
}) => {
  return (
    <footer className="bg-muted/30 border-t pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start">
          <div className="flex w-full flex-col gap-6 lg:items-start lg:max-w-sm">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <a href={logo.url} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                  L
                </div>
                <span className="text-xl font-bold text-foreground">{logo.title}</span>
              </a>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
            <ul className="flex items-center space-x-6">
              {socialLinks.map((social, idx) => (
                <li key={idx}>
                  <a 
                    href={social.href} 
                    aria-label={social.label}
                    className="w-8 h-8 rounded-full bg-background border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/20 transition-all"
                  >
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid w-full gap-8 grid-cols-2 md:grid-cols-3 lg:gap-12">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h4 className="font-bold text-foreground mb-6">{section.title}</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a href={link.href} className="hover:text-primary transition-colors">
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>{copyright}</p>
          <ul className="flex flex-col md:flex-row gap-2 md:gap-6">
            {legalLinks.map((link, idx) => (
              <li key={idx}>
                <a href={link.href} className="hover:text-foreground transition-colors">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export { Footer7 };
