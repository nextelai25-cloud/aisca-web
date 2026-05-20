import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://aisca.lk', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://aisca.lk/register/associate', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://aisca.lk/register/school', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://aisca.lk/products/tshirt', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://aisca.lk/products/blazer-pin', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://aisca.lk/products/wristband', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]
}
