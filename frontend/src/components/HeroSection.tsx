import { motion } from 'framer-motion';
import { ArrowRight, Play, Search, Sparkles, Zap, Globe2 } from 'lucide-react';
import useAppStore from '../store/appStore';

export default function HeroSection() {
  const { t, setCurrentPage } = useAppStore();

  const stats = [
    { value: '50K+', label: t('hero.stats.movies'), icon: '🎬' },
    { value: '100K+', label: t('hero.stats.users'), icon: '👥' },
    { value: '3', label: t('hero.stats.languages'), icon: '🌍' },
    { value: '$0', label: t('hero.stats.cost'), icon: '✨' },
  ];

  const platforms = [
    { name: 'TikTok', icon: '🎵', color: 'from-pink-500 to-red-500' },
    { name: 'Facebook', icon: '📘', color: 'from-blue-600 to-blue-500' },
    { name: 'Instagram', icon: '📸', color: 'from-purple-500 to-pink-500' },
    { name: 'YouTube', icon: '▶️', color: 'from-red-600 to-red-500' },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(/images/hero-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/80 to-transparent" />

        {/* Animated orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/3 right-1/3 w-64 h-64 bg-neon-pink/5 rounded-full blur-[80px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light text-sm"
            >
              <Sparkles className="w-4 h-4 text-neon-cyan" />
              <span className="text-dark-300">AI-Powered Movie Identification</span>
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            </motion.div>

            {/* Title */}
            <div className="space-y-3">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight"
              >
                <span className="text-gradient">{t('hero.title')}</span>
              </motion.h1>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-dark-300"
              >
                {t('hero.subtitle')}
              </motion.h2>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-dark-400 max-w-lg leading-relaxed"
            >
              {t('hero.description')}
            </motion.p>

            {/* Platform badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="flex flex-wrap gap-3"
            >
              {platforms.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-sm text-dark-300"
                >
                  <span>{p.icon}</span>
                  <span>{p.name}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                onClick={() => setCurrentPage('chat')}
                className="group relative flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold text-lg shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 transition-all duration-300 overflow-hidden"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Search className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{t('hero.cta')}</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                onClick={() => setCurrentPage('about')}
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl glass hover:bg-white/10 text-white font-semibold text-lg transition-all duration-300"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Play className="w-5 h-5 text-primary-400" />
                <span>{t('hero.cta2')}</span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right - Demo Card */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Floating movie cards */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative glass rounded-3xl p-6 shadow-2xl shadow-primary-600/10"
              >
                {/* Chat simulation */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">MovieFinder AI</p>
                      <p className="text-xs text-neon-green flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                        Online
                      </p>
                    </div>
                  </div>

                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm bg-primary-600/30 text-sm">
                      🔗 https://tiktok.com/@movies/video/123
                    </div>
                  </div>

                  {/* AI response */}
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="space-y-3">
                      <div className="px-4 py-3 rounded-2xl rounded-tl-sm glass-light text-sm">
                        <p className="font-semibold text-neon-cyan">🎬 Found it!</p>
                        <p className="text-dark-300 mt-1">This is <span className="text-white font-semibold">Inception (2010)</span></p>
                        <p className="text-dark-400 text-xs mt-1">⭐ 8.8/10 · Sci-Fi, Action · 148 min</p>
                      </div>
                      {/* Mini movie card */}
                      <div className="flex gap-3 p-3 rounded-xl glass-light">
                        <img
                          src="https://image.tmdb.org/t/p/w200/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg"
                          alt="Inception"
                          className="w-14 h-20 rounded-lg object-cover"
                        />
                        <div className="text-xs space-y-1">
                          <p className="font-semibold">Inception</p>
                          <p className="text-dark-400">Christopher Nolan</p>
                          <div className="flex gap-1 mt-1">
                            <span className="px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green text-[10px]">Netflix</span>
                            <span className="px-2 py-0.5 rounded-full bg-neon-cyan/20 text-neon-cyan text-[10px]">TrueID</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Decorative elements */}
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-8 -right-8 w-16 h-16 border border-primary-500/20 rounded-xl"
              />
              <motion.div
                animate={{ rotate: [360, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-4 -left-4 w-12 h-12 border border-accent-500/20 rounded-lg"
              />
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="glass rounded-2xl p-5 text-center hover:bg-white/5 transition-colors group"
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl sm:text-3xl font-bold text-gradient">{stat.value}</div>
              <div className="text-xs text-dark-400 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Supported Languages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12 flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-2 text-dark-500 text-sm">
            <Globe2 className="w-4 h-4" />
            <span>Supported Languages</span>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1.5 rounded-full glass-light text-xs text-dark-300">🇬🇧 English</span>
            <span className="px-3 py-1.5 rounded-full glass-light text-xs text-dark-300">🇹🇭 ภาษาไทย</span>
            <span className="px-3 py-1.5 rounded-full glass-light text-xs text-dark-300">🇲🇲 မြန်မာ</span>
          </div>
        </motion.div>
      </div>

      {/* Features Strip */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-6 py-4 border-t border-white/5 text-xs text-dark-500">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-neon-cyan" />
              <span>AI Powered</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-dark-700" />
            <div className="flex items-center gap-1">
              <span>🎬</span>
              <span>50K+ Movies</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-dark-700 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1">
              <span>💯</span>
              <span>100% Free</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-dark-700 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1">
              <span>🔒</span>
              <span>No Sign-up Required</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
