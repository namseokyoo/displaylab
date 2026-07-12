/**
 * SEO JSON-LD Structured Data
 *
 * WebApplication and SoftwareApplication schemas for Google Rich Results.
 */

import { BASE_URL } from '@/lib/constants';

/** WebApplication JSON-LD schema for the main site */
export const SITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Display Lab',
  description:
    'Professional display analysis tools for engineers and researchers, including gamut, color science, viewing angle, spectrum, HDR, and panel technology workflows.',
  url: BASE_URL,
  applicationCategory: 'ScienceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@type': 'Organization',
    name: 'SidequestLab',
  },
};

/** SoftwareApplication JSON-LD for individual tools */
export function toolJsonLd(name: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url: `${BASE_URL}${path}`,
    applicationCategory: 'ScienceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'SidequestLab',
    },
  };
}
