import { Film, Code2, MessageCircle, Heart } from 'lucide-react';
import useAppStore from '../store/appStore';

export default function Footer() {
  const { t, setCurrentPage } = useAppStore();

  return (
    <footer className="relative border-t border-white/5 bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gradient">MovieFinder</span>
            </div>
            <p className="text-sm text-dark-400 max-w-sm leading-relaxed">
              AI-powered movie identification from social media clips. Built for Myanmar & Thai audiences with love.
            </p>
            <div className="flex items-center gap-2 text-sm text-dark-500">
              <span>🇲🇲 🇹🇭 🇬🇧</span>
              <span>|</span>
              <span>{t('footer.madeWith')}</span>
              <span>{t('footer.audience')}</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-dark-300">Navigation</h4>
            <ul className="space-y-2">
              {[
                { label: t('nav.home'), page: 'home' as const },
                { label: t('nav.chat'), page: 'chat' as const },
                { label: t('nav.trending'), page: 'trending' as const },
                { label: t('nav.watchlist'), page: 'watchlist' as const },
                { label: t('nav.about'), page: 'about' as const },
              ].map((item) => (
                <li key={item.page}>
                  <button
                    onClick={() => setCurrentPage(item.page)}
                    className="text-sm text-dark-500 hover:text-primary-400 transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* APIs */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-dark-300">Powered By</h4>
            <ul className="space-y-2">
              {['Google Gemini AI', 'TMDB', 'YouTube', 'OpenSubtitles'].map((api) => (
                <li key={api}>
                  <span className="text-sm text-dark-500">{api}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-dark-600">
            © {new Date().getFullYear()} MovieFinder. {t('footer.rights')}.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-xs text-dark-500">
              Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> by MovieFinder Team
            </span>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg hover:bg-white/5 text-dark-500 hover:text-white transition-colors">
                <Code2 className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/5 text-dark-500 hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
