export type ToolCategory =
  | 'compression-conversion'
  | 'editing-adjustments'
  | 'transforms'
  | 'security-watermark'
  | 'developer-utilities';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  step: number;
  title: string;
  description: string;
}

export interface ImageTool {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  category: ToolCategory;
  categoryName: string;
  iconName: string; // Lucide icon name string
  popular?: boolean;
  featured?: boolean;
  tags: string[];
  
  // SEO Metadata
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  
  // Content
  guideTitle: string;
  detailedGuideText: string; // 700-1000 words guide
  howToSteps: HowToStep[];
  faqs: FAQItem[];
  
  // Supported inputs/outputs
  acceptedFormats: string[];
  defaultOutputFormat: 'png' | 'jpeg' | 'webp';
}

export interface ProcessedImageHistory {
  id: string;
  toolId: string;
  toolName: string;
  timestamp: number;
  originalName: string;
  originalSize: number;
  processedSize: number;
  dataUrl?: string; // Stored thumbnail or data URL (capped size)
}

export interface ColorInfo {
  hex: string;
  rgb: string;
  percentage: number;
}

export interface ImageDimensionsInfo {
  width: number;
  height: number;
  aspectRatio: string;
  fileSizeFormatted: string;
  fileSizeBytes: number;
  mimeType: string;
  fileName: string;
  megaPixels: string;
  colorDepth: string;
  dominantColors: ColorInfo[];
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info';
}
