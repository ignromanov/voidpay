/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://voidpay.xyz',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/api/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/pay?*'], // Don't index individual invoice URLs
      },
    ],
    additionalSitemaps: [],
  },
  // Transform to add priority and changefreq
  transform: async (config, path) => {
    // Default values
    let priority = 0.7
    let changefreq = 'weekly'

    // Homepage gets highest priority
    if (path === '/') {
      priority = 1.0
      changefreq = 'daily'
    }

    // Create page
    if (path === '/create') {
      priority = 0.9
      changefreq = 'weekly'
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  },
}
