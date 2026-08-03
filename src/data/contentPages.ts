export interface PageContent {
  title: string;
  metaTitle: string;
  metaDescription: string;
  lastUpdated: string;
  sections: { heading?: string; content: string }[];
}

export const POLICY_PAGES: Record<string, PageContent> = {
  about: {
    title: 'About ImageTools Pro',
    metaTitle: 'About Us - Fast, Private, Browser-Based Image Tools | ImageTools Pro',
    metaDescription: 'Learn about ImageTools Pro: Our mission to provide powerful, 100% private, client-side browser image editing tools without cloud servers.',
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: 'Our Mission',
        content: `At ImageTools Pro, our mission is to empower developers, designers, content creators, photographers, and everyday web users with fast, secure, high-performance image editing utilities—completely free of charge and 100% private. We believe that simple tasks like compressing a photo, converting a file format, or watermarking a graphic should never require uploading personal files to mysterious remote servers.`
      },
      {
        heading: 'Why Browser-Based Client-Side Processing Matters',
        content: `Traditional online image converters upload your personal photos, business logos, or sensitive documents to third-party cloud servers. This exposes your files to privacy vulnerabilities, server data retention risks, and artificial bandwidth limitations. ImageTools Pro revolutionizes this experience by executing all image calculations locally inside your Web browser using JavaScript, the HTML5 Canvas API, and modern WebAssembly engines. Your files never touch a remote server, ensuring total privacy, instantaneous execution speed, and complete offline capability.`
      },
      {
        heading: 'Built for High Performance & Accessibility',
        content: `Designed with Next-generation web performance standards, ImageTools Pro delivers a clean, responsive, dark/light theme adaptable user experience that works seamlessly across desktop workstations, laptops, tablets, and smartphones. No account registration, software installation, or subscriptions are ever required.`
      }
    ]
  },
  contact: {
    title: 'Contact Us',
    metaTitle: 'Contact Us - Get in Touch with ImageTools Pro Team',
    metaDescription: 'Have questions, feature requests, or feedback for ImageTools Pro? Reach out to our dedicated technical team.',
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: 'We Would Love to Hear From You',
        content: `Whether you have a suggestion for a new browser-based image tool, encountered a bug, or want to collaborate with ImageTools Pro, our team is always eager to assist. Please fill out the contact form below or reach out to us via email.`
      },
      {
        heading: 'Direct Email Support',
        content: `For general inquiries, bug reports, and partnership proposals: support@imagetoolspro.com\nFor DMCA copyright requests: dmca@imagetoolspro.com`
      }
    ]
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    metaTitle: 'Privacy Policy - 100% Private Local Image Processing | ImageTools Pro',
    metaDescription: 'Read the ImageTools Pro Privacy Policy. Your images remain on your device and are never uploaded, stored, or transmitted to any server.',
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: '1. Zero Image Data Collection & Storage',
        content: `ImageTools Pro is fundamentally designed with a strict Privacy-First Architecture. All image processing operations—including compression, resizing, cropping, color adjustment, format conversion, and watermarking—take place strictly inside your Web browser sandbox using JavaScript and HTML5 Canvas API. We do NOT upload, collect, store, transmit, or inspect your images, photos, or files on any server.`
      },
      {
        heading: '2. Local Storage & Browser Preferences',
        content: `We utilize your Web browser local storage (localStorage) exclusively to store user settings, such as your preferred UI color mode (Dark Mode vs Light Mode), bookmarked favorite tools, and recent local processing activity history. This data remains on your local device and can be cleared at any time through your browser settings.`
      },
      {
        heading: '3. Web Analytics & Cookies',
        content: `We may use privacy-preserving website analytics services to gather aggregate, non-personally identifiable usage statistics (such as page views, browser types, and general country location) to optimize platform performance and site navigation. These analytics tools do not track personal identity or access local image files.`
      },
      {
        heading: '4. Third-Party Advertising Policy',
        content: `To keep ImageTools Pro 100% free for everyone, we display non-intrusive advertisements supplied by advertising partners like Google AdSense. Third-party ad vendors use cookies to serve ads based on user visits to this and other websites. Users may opt out of personalized advertising by visiting Google Ad Settings.`
      }
    ]
  },
  'terms-and-conditions': {
    title: 'Terms and Conditions',
    metaTitle: 'Terms & Conditions of Service | ImageTools Pro',
    metaDescription: 'Review the Terms and Conditions governing your use of the ImageTools Pro website and browser-based editing suite.',
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        content: `By accessing or using ImageTools Pro, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must discontinue using our website and tools immediately.`
      },
      {
        heading: '2. License and Permitted Use',
        content: `ImageTools Pro grants you a revocable, non-exclusive, non-transferable license to access and use our browser-based image utilities for personal, commercial, and educational purposes free of charge. You are solely responsible for ensuring you have the legal copyright or license to edit, modify, or convert any images uploaded into the browser.`
      },
      {
        heading: '3. Disclaimer of Warranties',
        content: `ImageTools Pro is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either express or implied. While we strive for absolute mathematical precision in image calculations, we do not guarantee uninterrupted availability or error-free outputs.`
      },
      {
        heading: '4. Limitation of Liability',
        content: `In no event shall ImageTools Pro, its operators, or affiliates be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our website or services.`
      }
    ]
  },
  disclaimer: {
    title: 'Disclaimer',
    metaTitle: 'General Legal Disclaimer | ImageTools Pro',
    metaDescription: 'Read the official disclaimer for ImageTools Pro regarding service availability, tool calculations, and third-party links.',
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: 'General Information Disclaimer',
        content: `The information and tools provided on ImageTools Pro are intended for general informational, educational, and image optimization purposes only. While every effort is made to maintain accurate browser calculations, users should independently verify critical production assets.`
      },
      {
        heading: 'No Server Transmission',
        content: `All image editing calculations occur locally on the user client device. ImageTools Pro assumes no responsibility for data loss resulting from hardware failure, browser crashes, or local device storage clearing.`
      }
    ]
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    metaTitle: 'Cookie Policy - How We Use Cookies | ImageTools Pro',
    metaDescription: 'Learn how ImageTools Pro uses essential local storage and privacy-compliant cookies for site functionality and advertising.',
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: 'What Are Cookies?',
        content: `Cookies are small text files stored on your computer or mobile device by your web browser when you visit websites. They help websites remember your preferences and improve user experience.`
      },
      {
        heading: 'How ImageTools Pro Uses Cookies',
        content: `ImageTools Pro uses essential browser localStorage to save your visual theme preference (Dark Mode/Light Mode) and bookmarked tools. We also work with privacy-compliant advertising networks (such as Google AdSense) that may place third-party cookies to serve relevant advertisements.`
      }
    ]
  },
  'dmca-policy': {
    title: 'DMCA & Copyright Policy',
    metaTitle: 'DMCA Copyright Policy | ImageTools Pro',
    metaDescription: 'ImageTools Pro respects intellectual property rights. Read our DMCA policy and copyright compliance guidelines.',
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: 'Copyright Compliance',
        content: `ImageTools Pro operates entirely client-side; no images uploaded by users are ever saved, stored, or hosted on our web servers. Therefore, ImageTools Pro does not host or distribute copyrighted media.`
      },
      {
        heading: 'Reporting Infringements',
        content: `If you believe that any material on our website infringes upon your copyright, please send a written DMCA notice to our designated agent at dmca@imagetoolspro.com containing your contact details and description of the copyrighted work.`
      }
    ]
  },
  'editorial-policy': {
    title: 'Editorial Policy',
    metaTitle: 'Editorial & Quality Policy | ImageTools Pro',
    metaDescription: 'Learn about our rigorous standards for technical content, tool documentation, and AdSense quality guidelines.',
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: 'Our Content Integrity Standards',
        content: `All educational articles, technical guides, and tool documentations published on ImageTools Pro are researched, written, and peer-reviewed by experienced web development and digital graphics professionals. We adhere strictly to Google AdSense content quality guidelines, providing thorough, original, and practical value in every article.`
      },
      {
        heading: 'Continuous Technical Updates',
        content: `Our technical documentation is regularly updated to reflect new web browser features, updated image compression algorithms, and emerging next-generation image formats like WebP and AVIF.`
      }
    ]
  }
};
