import React, { useState } from 'react';
import { POLICY_PAGES } from '../data/contentPages';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ShieldCheck, Mail, Send, CheckCircle2 } from 'lucide-react';

interface PolicyPageProps {
  pageSlug: string;
  onNavigate: (path: string) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ pageSlug, onNavigate, onShowToast }) => {
  // Map slugs like 'privacy', 'terms', 'about', 'contact'
  const keyMap: Record<string, string> = {
    about: 'about',
    contact: 'contact',
    privacy: 'privacy-policy',
    'privacy-policy': 'privacy-policy',
    terms: 'terms-and-conditions',
    'terms-of-service': 'terms-and-conditions',
    'terms-and-conditions': 'terms-and-conditions',
    disclaimer: 'disclaimer',
    'cookie-policy': 'cookie-policy',
    'dmca-policy': 'dmca-policy',
    'editorial-policy': 'editorial-policy',
  };

  const pageKey = keyMap[pageSlug] || 'about';
  const page = POLICY_PAGES[pageKey] || POLICY_PAGES['about'];

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      onShowToast('Missing Fields', 'Please fill in all contact form fields.', 'error');
      return;
    }
    setSubmitted(true);
    onShowToast('Message Sent', 'Thank you for contacting ImageTools Pro support.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <Breadcrumbs
        items={[{ label: page.title, path: `/${pageSlug}` }]}
        onNavigate={onNavigate}
      />

      <article className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> ImageTools Pro Official
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {page.title}
          </h1>
          <p className="text-xs text-slate-400">
            Last Updated: {page.lastUpdated}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          {page.sections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              {sec.heading && (
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {sec.heading}
                </h2>
              )}
              <p className="whitespace-pre-line">{sec.content}</p>
            </div>
          ))}
        </div>

        {/* Contact Form rendered on Contact page */}
        {pageKey === 'contact' && (
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Message Delivered!
                </h3>
                <p className="text-xs text-slate-500">
                  We appreciate your feedback and will respond shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 max-w-xl">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-500" /> Send Us a Message
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Message / Feedback / Bug Report
                  </label>
                  <textarea
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <Send className="w-4 h-4" /> Send Direct Message
                </button>
              </form>
            )}
          </div>
        )}
      </article>
    </div>
  );
};
