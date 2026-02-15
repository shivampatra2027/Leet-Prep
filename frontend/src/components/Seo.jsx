import { useEffect } from "react";

function setOrCreate(selector, attrs) {
  let el = document.querySelector(selector);
  if (!el) {
    const tag = attrs.rel ? "link" : "meta";
    el = document.createElement(tag);
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => {
    if (v !== undefined && v !== null) el.setAttribute(k, v);
  });
}

export default function Seo({
  title = "Leet-Prep | Company-wise LeetCode Practice",
  description = "Curated, company-wise coding interview problems with honest difficulty, analytics, and weekly focus lanes.",
  canonical,
  ogImage = "https://img.logo.dev/leetcode.com?token=public",
  schema,
}) {
  useEffect(() => {
    document.title = title;
    setOrCreate('meta[name="description"]', { name: "description", content: description });
    setOrCreate('link[rel="canonical"]', { rel: "canonical", href: canonical || window.location.href });

    // Open Graph
    setOrCreate('meta[property="og:title"]', { property: "og:title", content: title });
    setOrCreate('meta[property="og:description"]', { property: "og:description", content: description });
    setOrCreate('meta[property="og:type"]', { property: "og:type", content: "website" });
    setOrCreate('meta[property="og:url"]', { property: "og:url", content: canonical || window.location.href });
    setOrCreate('meta[property="og:image"]', { property: "og:image", content: ogImage });

    // Twitter
    setOrCreate('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    setOrCreate('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    setOrCreate('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    setOrCreate('meta[name="twitter:image"]', { name: "twitter:image", content: ogImage });

    // JSON-LD
    const scriptId = "ld-json-seo";
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = scriptId;
      document.head.appendChild(script);
    }
    if (schema) {
      script.textContent = JSON.stringify(schema);
    } else {
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Leet-Prep",
        url: canonical || window.location.href,
        sameAs: ["https://www.linkedin.com", "https://twitter.com"],
      });
    }
  }, [title, description, canonical, ogImage, schema]);

  return null;
}
