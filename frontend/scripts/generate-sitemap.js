import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DOMAIN = 'https://leet-io-frontend.onrender.com';
const TODAY = new Date().toISOString().split('T')[0];

// Define your routes with their properties
const routes = [
  {
    path: '/',
    changefreq: 'daily',
    priority: '1.0',
    comment: 'Home Page'
  },
  {
    path: '/login',
    changefreq: 'monthly',
    priority: '0.7',
    comment: 'Login Page'
  },
  {
    path: '/premium',
    changefreq: 'weekly',
    priority: '0.8',
    comment: 'Premium Page'
  },
  {
    path: '/freedashboard',
    changefreq: 'daily',
    priority: '0.85',
    comment: 'Free Dashboard Page'
  },
  {
    path: '/dashboard',
    changefreq: 'daily',
    priority: '0.9',
    comment: 'Dashboard Page (Premium)'
  },
  {
    path: '/profile',
    changefreq: 'weekly',
    priority: '0.6',
    comment: 'Profile Page'
  }
];

// Generate sitemap XML
function generateSitemap() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
  xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
  xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';

  routes.forEach(route => {
    xml += '  \n';
    xml += `  <!-- ${route.comment} -->\n`;
    xml += '  <url>\n';
    xml += `    <loc>${DOMAIN}${route.path}</loc>\n`;
    xml += `    <lastmod>${TODAY}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '\n</urlset>';

  return xml;
}

// Write sitemap to file
function writeSitemap() {
  const sitemap = generateSitemap();
  const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

  try {
    fs.writeFileSync(outputPath, sitemap, 'utf8');
    console.log('✅ Sitemap generated successfully!');
    console.log(`📍 Location: ${outputPath}`);
    console.log(`📊 Total URLs: ${routes.length}`);
  } catch (error) {
    console.error('❌ Error writing sitemap:', error);
    process.exit(1);
  }
}

// Run the script
writeSitemap();
