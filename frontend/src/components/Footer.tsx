import { Film, Mail, Globe } from 'lucide-react';
import { GithubIcon } from './icons/GithubIcon';
import useAppStore from '../store/appStore';

export default function Footer() {
  const { t, setCurrentPage } = useAppStore();

  // Consistent styling for ALL footer links (button + anchor)
  const linkClass = "block text-left text-sm text-dark-300 hover:text-white transition-colors leading-6";

  return (
    <footer className="border-t border-white/5 bg-dark-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* ============================================
            Main grid
        ============================================ */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-5 space-y-4">
            <button
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold tracking-tight">MovieFinder</span>
            </button>
            <p className="text-sm text-dark-400 max-w-xs leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-3 font-mono text-xs text-dark-500">
              <span>EN</span>
              <div className="w-1 h-1 rounded-full bg-dark-700" />
              <span>TH</span>
              <div className="w-1 h-1 rounded-full bg-dark-700" />
              <span>MM</span>
            </div>
          </div>

          {/* Navigation / Product */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-widest text-dark-500 mb-4">
              {t('footer.product')}
            </h4>
            <ul className="space-y-3">
              {[
                { label: t('nav.chat'), page: 'chat' as const },
                { label: t('nav.trending'), page: 'trending' as const },
                { label: t('nav.watchlist'), page: 'watchlist' as const },
              ].map((item) => (
                <li key={item.page}>
                  <button
                    onClick={() => setCurrentPage(item.page)}
                    className={linkClass}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-widest text-dark-500 mb-4">
              {t('footer.company')}
            </h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => setCurrentPage('about')}
                  className={linkClass}
                >
                  {t('nav.about')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('contact')}
                  className={linkClass}
                >
                  {t('footer.contact')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('privacy')}
                  className={linkClass}
                >
                  {t('footer.privacy')}
                </button>
              </li>
            </ul>
          </div>

          {/* Powered by */}
          <div className="col-span-2 md:col-span-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-dark-500 mb-4">
              {t('footer.poweredBy')}
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Google Gemini', url: 'https://gemini.google.com' },
                { name: 'TMDB', url: 'https://www.themoviedb.org' },
                { name: 'OpenSubtitles', url: 'https://www.opensubtitles.org' },
              ].map((api) => (
                <li key={api.name}>
                  <a
                    href={api.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {api.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ============================================
            Bottom bar
        ============================================ */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <p className="text-xs text-dark-500">
              © {new Date().getFullYear()} MovieFinder. {t('footer.rights')}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {/* Portfolio */}
            <a
              href="https://portfolio-template-bay-eight.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-dark-500 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Portfolio"
              title="Portfolio"
            >
              <Globe className="w-4 h-4" strokeWidth={1.5} />
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/zarn-chalamet/moviefinder"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-dark-500 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="GitHub"
              title="GitHub"
            >
              <GithubIcon className="w-4 h-4" strokeWidth={1.5} />
            </a>

            {/* Email */}
            <a
              href="mailto:zarnn872@gmail.com"
              className="p-2 rounded-lg text-dark-500 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Email"
              title="Email"
            >
              <Mail className="w-4 h-4" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}