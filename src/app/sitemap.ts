import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://aisca.lk'
  const now = new Date()

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85
    },
    {
      url: `${baseUrl}/officials`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85
    },
    {
      url: `${baseUrl}/events`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85
    },
    {
      url: `${baseUrl}/join`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.90
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.80
    },
    {
      url: `${baseUrl}/register/associate`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.80
    },
    {
      url: `${baseUrl}/register/school`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.80
    },
    {
      url: `${baseUrl}/products/tshirt`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.80
    },
    {
      url: `${baseUrl}/products/blazer-pin`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.80
    },
    {
      url: `${baseUrl}/products/wristband`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.80
    },
    {
      url: `${baseUrl}/ideanet`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.90
    }
  ]
}
