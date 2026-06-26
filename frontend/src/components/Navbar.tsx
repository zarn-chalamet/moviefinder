import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Film, MessageSquare, TrendingUp, Heart, Info,
  Menu, X, Globe, ChevronDown
} from 'lucide-react';
import useAppStore from '../store/appStore';
import { Language } from '../types';

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  { code: 'my', label: 'မြန်မာ', flag: '🇲🇲' },
];

export default function Navbar() {
  const { language, setLanguage, t, currentPage, setCurrentPage, isMobileMenuOpen, setMobileMenuOpen, savedMovies } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navItems = [
    { id: 'home' as const, label: t('nav.home'), icon: Film },
    { id: 'chat' as const, label: t('nav.chat'), icon: MessageSquare },
    { id: 'trending' as const, label: t('nav.trending'), icon: TrendingUp },
    { id: 'watchlist' as const, label: t('nav.watchlist'), icon: Heart, badge: savedMovies.length },
    { id: 'about' as const, label: t('nav.about'), icon: Info },
  ];

  const currentLang = languages.find((l) => l.code === language)!;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <motion.button
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-2 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gradient hidden sm:block">MovieFinder</span>
            </motion.button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    currentPage === item.id
                      ? 'text-white bg-primary-600/20'
                      : 'text-dark-400 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.badge ? (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neon-pink text-white text-xs flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  ) : null}
                  {currentPage === item.id && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Language Switcher & Mobile Menu */}
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <div className="relative">
                <motion.button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl glass-light hover:bg-white/10 transition-colors text-sm"
                  whileTap={{ scale: 0.95 }}
                >
                  <Globe className="w-4 h-4 text-primary-400" />
                  <span className="hidden sm:inline">{currentLang.flag}</span>
                  <span className="hidden lg:inline text-dark-300">{currentLang.label}</span>
                  <ChevronDown className={`w-3 h-3 text-dark-400 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-48 rounded-xl glass shadow-xl shadow-black/30 overflow-hidden"
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setLangOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                            language === lang.code
                              ? 'bg-primary-600/20 text-white'
                              : 'text-dark-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <span>{lang.label}</span>
                          {language === lang.code && (
                            <div className="ml-auto w-2 h-2 rounded-full bg-primary-500" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Toggle */}
              <motion.button
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 glass shadow-xl shadow-black/30 md:hidden"
          >
            <div className="p-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    currentPage === item.id
                      ? 'text-white bg-primary-600/20'
                      : 'text-dark-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {item.badge ? (
                    <span className="ml-auto w-6 h-6 rounded-full bg-neon-pink text-white text-xs flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
