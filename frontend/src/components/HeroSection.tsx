import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Film } from 'lucide-react';
import useAppStore from '../store/appStore';

export default function HeroSection() {
  const { t, setCurrentPage } = useAppStore();

  return (
    <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-xs text-dark-300 mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              AI-Powered Movie Identification
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-4"
            >
              <span className="text-gradient">{t('hero.title')}</span>
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1] text-dark-300 mb-8"
            >
              {t('hero.subtitle')}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-dark-400 max-w-lg leading-relaxed mb-8"
            >
              {t('hero.description')}
            </motion.p>

            {/* Platform pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-2 mb-10"
            >
              {['TikTok', 'YouTube', 'Facebook', 'Instagram'].map((name, i) => (
                <motion.span
                  key={name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                  className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-xs text-dark-400"
                >
                  {name}
                </motion.span>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-3"
            >
              <button
                onClick={() => setCurrentPage('chat')}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-dark-950 font-semibold text-sm hover:bg-dark-200 transition-colors"
              >
                {t('hero.cta')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => setCurrentPage('about')}
                className="px-6 py-3 rounded-full border border-white/10 text-sm text-dark-200 hover:bg-white/5 hover:border-white/20 transition-colors"
              >
                {t('hero.cta2')}
              </button>
            </motion.div>

            {/* Languages */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="mt-10 flex items-center gap-6 text-xs text-dark-500"
            >
              <span>{t('about.hero.available')}</span>
              <div className="flex items-center gap-4 font-mono">
                <span className="hover:text-white transition-colors">EN</span>
                <div className="w-1 h-1 rounded-full bg-dark-700" />
                <span className="hover:text-white transition-colors">TH</span>
                <div className="w-1 h-1 rounded-full bg-dark-700" />
                <span className="hover:text-white transition-colors">MM</span>
              </div>
            </motion.div>
          </div>

          {/* ============================================
              Right — Demo Card
          ============================================ */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm"
              >
                {/* Chat header */}
                <div className="flex items-center gap-3 pb-5 border-b border-white/5">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">MovieFinder AI</p>
                    <p className="text-[11px] text-dark-500 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Online
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-5">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm bg-white/5 border border-white/5 text-sm text-dark-200">
                      🔗 https://tiktok.com/@movies/video/123
                    </div>
                  </div>

                  {/* AI response */}
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="px-4 py-3 rounded-2xl rounded-tl-sm border border-white/5 bg-white/[0.02] text-sm">
                        <p className="font-semibold text-primary-400 text-xs uppercase tracking-wider mb-1">
                          Found it
                        </p>
                        <p className="text-dark-200">
                          This is{' '}
                          <span className="text-white font-semibold">Inception (2010)</span>
                        </p>
                        <p className="text-dark-500 text-xs mt-1.5">
                          ⭐ 8.8 · Sci-Fi, Action · 148 min
                        </p>
                      </div>

                      {/* Mini movie card */}
                      <div className="flex gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                        <img
                          src="https://image.tmdb.org/t/p/w200/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg"
                          alt="Inception"
                          className="w-12 h-[72px] rounded-lg object-cover"
                        />
                        <div className="text-xs space-y-1.5">
                          <p className="font-semibold text-sm">Inception</p>
                          <p className="text-dark-500">Christopher Nolan</p>
                          <div className="flex gap-1.5">
                            <span className="px-2 py-0.5 rounded-full border border-white/10 text-[10px] text-dark-300">
                              Netflix
                            </span>
                            <span className="px-2 py-0.5 rounded-full border border-white/10 text-[10px] text-dark-300">
                              TrueID
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Subtle decorative corners */}
              <div className="absolute -top-3 -right-3 w-6 h-6 border-t border-r border-white/10 rounded-tr-lg" />
              <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b border-l border-white/10 rounded-bl-lg" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}