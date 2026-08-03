import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  ShieldCheck,
  Zap,
  Lock,
  Star,
  ArrowRight,
  HelpCircle,
  Users,
  Sliders,
  Scaling,
  Crop,
  RotateCw,
  FileImage,
  Stamp,
  EyeOff,
  Sun,
  Code,
  Ruler,
  Download,
} from 'lucide-react';
import { IMAGE_TOOLS, TOOL_CATEGORIES } from '../data/toolsData';
import { AdSpace } from '../components/AdSpace';

interface HomePageProps {
  onNavigate: (path: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  favorites,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTools = IMAGE_TOOLS.filter((tool) => {
    const matchesCat = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesQuery =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const popularTools = IMAGE_TOOLS.filter((t) => t.popular);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Section - Clean Minimalist Style */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center space-y-6 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> 100% Client-Side Private Canvas Processing
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Fast, Private Image Tools Directly in Your Browser
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Compress, resize, convert, crop, and edit digital photos instantly. Zero server uploads, zero quality loss, and 100% free forever.
          </p>
        </div>

        {/* Hero Search Input */}
        <div className="max-w-xl mx-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a tool... (e.g. JPG to PNG, compress, crop)"
            className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Quick Launch Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium pt-2">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Popular:</span>
          {popularTools.slice(0, 5).map((t) => (
            <button
              key={t.id}
              onClick={() => onNavigate(`/tools/${t.slug}`)}
              className="px-3 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 transition-colors"
            >
              {t.name}
            </button>
          ))}
        </div>
      </section>

      {/* AdSpace Placement 1 */}
      <div>
        <AdSpace type="banner" />
      </div>

      {/* Main Tools Catalog & Category Filter */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              All Browser Image Tools ({filteredTools.length})
            </h2>
            <p className="text-xs text-slate-500">
              Select a category or click any tool card to launch instantly
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              All Tools
            </button>
            {TOOL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid - Clean Minimalist Card Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map((tool) => {
            const isFav = favorites.includes(tool.id);
            return (
              <div
                key={tool.id}
                className="group relative rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                      {tool.categoryName}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(tool.id);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-amber-500 transition-colors"
                      title={isFav ? 'Remove bookmark' : 'Bookmark tool'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                  </div>

                  <button
                    onClick={() => onNavigate(`/tools/${tool.slug}`)}
                    className="text-left w-full space-y-1.5"
                  >
                    <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {tool.shortDescription}
                    </p>
                  </button>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">100% Offline</span>
                  <button
                    onClick={() => onNavigate(`/tools/${tool.slug}`)}
                    className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    Launch <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Grid Section - Clean Minimalist Styling */}
      <section>
        <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Why Choose ImageTools Pro?
            </h2>
            <p className="text-xs text-slate-500">
              Built on modern browser technologies for security, speed, and privacy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Lock className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">100% Private Sandbox</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Your images never leave your local device memory. All editing calculations run locally inside JavaScript engines.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <Zap className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Hardware GPU Accelerated</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Utilizes your laptop or mobile phone GPU via HTML5 Canvas API for instantaneous processing speeds.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Full Offline Capability</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Install as a PWA app and run image tools seamlessly without an active internet connection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section>
        <div className="p-8 sm:p-10 rounded-2xl bg-slate-900 text-white space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" /> Loved by Web Developers & Creators
            </h2>
            <p className="text-xs text-slate-400">
              Trusted for privacy, simplicity, and rapid workflow execution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
            <div className="p-5 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
              <p className="italic">
                &quot;The client-side image compression tool saved us gigabytes of server bandwidth. Knowing our clients&apos; raw assets never touch remote servers gives us complete peace of mind.&quot;
              </p>
              <div className="font-bold text-white pt-2">— Sarah L., Senior Frontend Lead</div>
            </div>

            <div className="p-5 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
              <p className="italic">
                &quot;ImageTools Pro is my go-to suite for converting PNGs to WebP and generating inline Base64 Data URIs. It runs instantly inside my browser!&quot;
              </p>
              <div className="font-bold text-white pt-2">— David K., Full Stack Engineer</div>
            </div>

            <div className="p-5 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
              <p className="italic">
                &quot;Watermarking and resizing high-res photos before posting to client proof galleries takes seconds. Brilliant privacy-first tool.&quot;
              </p>
              <div className="font-bold text-white pt-2">— Elena R., Commercial Photographer</div>
            </div>
          </div>
        </div>
      </section>

      {/* Long-Form Informational Card */}
      <section>
        <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            The Future of Private, Browser-Based Image Processing
          </h2>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
            <p>
              In the early days of the Web, performing complex graphic manipulations—such as compressing a multi-megabyte JPEG, stripping EXIF camera metadata, or applying Gaussian blur filters—required heavy desktop software like Adobe Photoshop or server-side scripts built on ImageMagick.
            </p>
            <p>
              With the evolution of HTML5 Canvas APIs, WebAssembly, and modern hardware acceleration, web browsers now possess the computing capabilities needed to perform complex bitmap matrix transformations locally in browser memory.
            </p>
            <p>
              <strong>ImageTools Pro</strong> harnesses these web capabilities to deliver a complete, production-grade image editing suite. By keeping all processing inside your browser sandbox, you eliminate upload wait times, save mobile data, and protect your private data.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
