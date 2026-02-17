import express from "express";
import { SitemapStream, streamToPromise } from "sitemap";
import Problem from "../models/Problem.js";

const router = express.Router();

/**
 * Generate dynamic sitemap with all problems
 * @route GET /sitemap.xml
 * @access Public
 */
router.get("/sitemap.xml", async (req, res) => {
  try {
    const hostname = process.env.SITE_URL || "https://www.leetcodepremium.xyz";

    const smStream = new SitemapStream({ hostname });

    // Static pages with priorities
    const staticPages = [
      { url: "/", changefreq: "daily", priority: 1.0 },
      { url: "/login", changefreq: "monthly", priority: 0.3 },
      { url: "/premium", changefreq: "weekly", priority: 0.8 },
      { url: "/dashboard", changefreq: "daily", priority: 0.7 },
      { url: "/freedashboard", changefreq: "daily", priority: 0.7 },
      { url: "/profile", changefreq: "weekly", priority: 0.5 },
      { url: "/resume-analyzer", changefreq: "monthly", priority: 0.6 },
    ];

    // Write static pages
    staticPages.forEach((page) => {
      smStream.write(page);
    });

    // Fetch all problems for dynamic URLs
    const problems = await Problem.find()
      .select("problemId title updatedAt")
      .lean();

    console.log(`Generating sitemap with ${problems.length} problems`);

    // Write dynamic problem pages
    problems.forEach((problem) => {
      smStream.write({
        url: `/problems/${problem.problemId}`,
        lastmod: problem.updatedAt,
        changefreq: "weekly",
        priority: 0.6,
      });
    });

    // End stream
    smStream.end();

    // Convert stream to XML
    const sitemap = await streamToPromise(smStream);

    // Send response
    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    res.send(sitemap.toString());
  } catch (err) {
    console.error("Error generating sitemap:", err);
    res.status(500).send("Error generating sitemap");
  }
});

/**
 * Generate robots.txt
 * @route GET /robots.txt
 * @access Public
 */
router.get("/robots.txt", (req, res) => {
  const hostname = process.env.SITE_URL || "https://www.leetcodepremium.xyz";

  const robotsTxt = `User-agent: *
Allow: /

# Disallow private pages
Disallow: /api/
Disallow: /auth/
Disallow: /profile
Disallow: /dashboard
Disallow: /freedashboard
Disallow: /payment-processing

# Sitemap location
Sitemap: ${hostname}/sitemap.xml
`;

  res.type("text/plain").send(robotsTxt);
});

export default router;
