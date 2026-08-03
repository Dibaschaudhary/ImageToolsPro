import { ImageTool, FAQItem, HowToStep } from '../types';

export function generateSoftwareApplicationSchema(tool: ImageTool) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.metaDescription,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any (Browser-based)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    browserRequirements: 'Requires JavaScript and HTML Canvas support',
    featureList: tool.tags.join(', '),
  };
}

export function generateHowToSchema(tool: ImageTool) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: tool.guideTitle,
    description: `Step-by-step instructions on how to use ${tool.name} for online image processing.`,
    step: tool.howToSteps.map((step: HowToStep) => ({
      '@type': 'HowToStep',
      position: step.step,
      name: step.title,
      text: step.description,
    })),
  };
}

export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ImageTools Pro',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://imagetoolspro.com',
    description: 'Free, fast, secure browser-based image tools for compressing, editing, converting, and optimizing images.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${typeof window !== 'undefined' ? window.location.origin : 'https://imagetoolspro.com'}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ImageTools Pro',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://imagetoolspro.com',
    logo: `${typeof window !== 'undefined' ? window.location.origin : 'https://imagetoolspro.com'}/favicon.svg`,
    sameAs: [],
  };
}
