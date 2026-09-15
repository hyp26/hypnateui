import React from 'react';

const SITE_URL = 'https://hypnate.in';

interface StructuredDataProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export const StructuredData: React.FC<StructuredDataProps> = ({ data }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
  />
);

export const OrganizationStructuredData: React.FC = () => (
  <StructuredData
    data={{
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Hypnate Solutions Pvt Ltd',
      url: SITE_URL,
    }}
  />
);

export const WebSiteStructuredData: React.FC = () => (
  <StructuredData
    data={{
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Hypnate',
      url: SITE_URL,
    }}
  />
);

export const SoftwareApplicationStructuredData: React.FC = () => (
  <StructuredData
    data={{
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Hypnate',
      url: SITE_URL,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
    }}
  />
);

export const FAQStructuredData: React.FC<{
  questions: Array<{ q: string; a: string }>;
}> = ({ questions }) => (
  <StructuredData
    data={{
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: a,
        },
      })),
    }}
  />
);

export const BlogPostingStructuredData: React.FC<{
  title: string;
  author: string;
  datePublished: string;
  image: string;
  url: string;
}> = ({ title, author, datePublished, image, url }) => (
  <StructuredData
    data={{
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: title,
      author: {
        '@type': 'Person',
        name: author,
      },
      datePublished,
      image,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Hypnate Solutions Pvt Ltd',
        url: SITE_URL,
      },
    }}
  />
);
