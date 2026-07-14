import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Menu, X, ChevronDown } from 'lucide-react';
import useAppStore from '../store/appStore';
import { Language } from '../types';

const languages: { code: Language; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'th', label: 'ไทย', short: 'TH' },
  { code: 'my', label: 'မြန်မာ', short: 'MM' },
];

export default function Navbar() {
  const { 
    language, setLanguage, t, currentPage, setCurrentPage, 
    isMobileMenuOpen, setMobileMenuOpen, savedMovies 
  } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navItems = [
    { id: 'home' as const, label: t('nav.home') },
    { id: 'chat' as const, label: t('nav.chat') },
    { id: 'trending' as const, label: t('nav.trending') },
    { id: 'watchlist' as const, label: t('nav.watchlist'), badge: savedMovies.length },
    { id: 'about' as const, label: t('nav.about') },
  ];

  const currentLang = languages.find((l) => l.code === language)!;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-dark-950/80 backdrop-blur-xl border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* ============================================
                Logo
            ============================================ */}
            <button
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold tracking-tight hidden sm:block">
                MovieFinder
              </span>
            </button>

            {/* ============================================
                Desktop Nav — Center
            ============================================ */}
            <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'text-white'
                      : 'text-dark-400 hover:text-white'
                  }`}
                >
                  {currentPage === item.id && (
                    <motion.div
                      layoutId="navBackground"
                      className="absolute inset-0 bg-white/5 rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    {item.label}
                    {item.badge ? (
                      <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-primary-500 text-white text-[10px] font-semibold flex items-center justify-center">
                        {item.badge}
                      </span>
                    ) : null}
                  </span>
                </button>
              ))}
            </div>

            {/* ============================================
                Right side
            ============================================ */}
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5 hover:border-white/20 transition-colors text-sm"
                >
                  <span className="font-mono text-xs text-dark-300">{currentLang.short}</span>
                  <ChevronDown className={`w-3 h-3 text-dark-500 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {langOpen && (
                    <>
                      {/* Click outside overlay */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setLangOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-40 rounded-xl bg-dark-900 border border-white/10 shadow-xl shadow-black/50 overflow-hidden z-50"
                      >
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setLanguage(lang.code);
                              setLangOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                              language === lang.code
                                ? 'text-white bg-white/5'
                                : 'text-dark-300 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span>{lang.label}</span>
                            <span className="font-mono text-xs text-dark-500">{lang.short}</span>
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" strokeWidth={1.5} />
                ) : (
                  <Menu className="w-5 h-5" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ============================================
          Mobile Menu
      ============================================ */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 bg-dark-950/95 backdrop-blur-xl border-b border-white/5 md:hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'text-white bg-white/5'
                      : 'text-dark-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="min-w-[20px] h-5 px-2 rounded-full bg-primary-500 text-white text-[10px] font-semibold flex items-center justify-center">
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