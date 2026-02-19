/**
 * SEO Component
 *
 * Manages page-specific meta tags, Open Graph, Twitter Cards,
 * and JSON-LD structured data via react-helmet-async.
 */

import { Helmet } from 'react-helmet-async';
import { BASE_URL } from '@/lib/constants';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  path?: string;
  type?: 'website' | 'article';
  jsonLd?: Record<string, unknown>;
}

export default function SEO({
  title,
  description,
  keywords,
  path = '/',
  type = 'website',
  jsonLd,
}: SEOProps) {
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      {/* Primary */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${BASE_URL}/og-image.png`} />
      <meta property="og:site_name" content="Display Lab" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${BASE_URL}/og-image.png`} />

      {/* Canonical */}
      <link rel="canonical" href={url} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
