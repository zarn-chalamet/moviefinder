import { motion } from 'framer-motion';
import {
  Link2, Brain, CheckCircle, MessageSquare, Film, Globe, Upload,
  Bookmark, Subtitles, Sparkles, Zap, Shield, Smartphone
} from 'lucide-react';
import useAppStore from '../store/appStore';

export default function AboutPage() {
  const { t, setCurrentPage } = useAppStore();

  const steps = [
    {
      icon: Link2,
      title: t('about.step1'),
      description: t('about.step1.desc'),
      color: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/30',
    },
    {
      icon: Brain,
      title: t('about.step2'),
      description: t('about.step2.desc'),
      color: 'from-purple-500 to-pink-500',
      shadowColor: 'shadow-purple-500/30',
    },
    {
      icon: CheckCircle,
      title: t('about.step3'),
      description: t('about.step3.desc'),
      color: 'from-green-500 to-emerald-500',
      shadowColor: 'shadow-green-500/30',
    },
  ];

  const features = [
    { icon: Link2, title: 'URL Analysis', desc: 'Paste links from TikTok, Facebook, Instagram, YouTube', color: 'text-blue-400' },
    { icon: MessageSquare, title: 'AI Chat', desc: 'Interactive conversation about movies in 3 languages', color: 'text-purple-400' },
    { icon: Film, title: 'Full Movie Info', desc: 'Complete details, cast, ratings, and trailers', color: 'text-pink-400' },
    { icon: Globe, title: 'Watch & Download Links', desc: 'Links to Netflix, free sites, torrents & more', color: 'text-cyan-400' },
    { icon: Subtitles, title: 'Subtitles', desc: 'Thai, Burmese, and English subtitle downloads', color: 'text-yellow-400' },
    { icon: Upload, title: 'Screenshot Search', desc: 'Upload a screenshot and AI identifies the movie', color: 'text-orange-400' },
    { icon: Bookmark, title: 'Watchlist', desc: 'Save movies and track your watching progress', color: 'text-green-400' },
    { icon: Sparkles, title: 'Recommendations', desc: 'AI-powered similar movie suggestions', color: 'text-indigo-400' },
  ];

  const techStack = [
    { name: 'React 18', icon: '⚛️', desc: 'Frontend UI' },
    { name: 'TypeScript', icon: '🔷', desc: 'Type Safety' },
    { name: 'Spring Boot', icon: '🍃', desc: 'Backend API' },
    { name: 'Google Gemini', icon: '🤖', desc: 'AI Engine' },
    { name: 'TMDB', icon: '🎬', desc: 'Movie Data' },
    { name: 'Tailwind CSS', icon: '🎨', desc: 'Styling' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-4"
        >
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center mx-auto shadow-xl shadow-primary-600/30"
          >
            <Film className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-black">
            <span className="text-gradient">{t('about.title')}</span>
          </h1>
          <p className="text-dark-400 max-w-xl mx-auto text-lg leading-relaxed">
            {t('about.description')}
          </p>
          <div className="flex justify-center gap-3">
            <span className="px-3 py-1.5 rounded-full glass-light text-sm">🇬🇧 English</span>
            <span className="px-3 py-1.5 rounded-full glass-light text-sm">🇹🇭 ภาษาไทย</span>
            <span className="px-3 py-1.5 rounded-full glass-light text-sm">🇲🇲 မြန်မာ</span>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold text-center mb-10">{t('about.howItWorks')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="relative glass rounded-2xl p-8 text-center hover:bg-white/5 transition-all group"
              >
                {/* Step number */}
                <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-dark-900 text-primary-400 text-xs font-bold border border-primary-500/20">
                  Step {i + 1}
                </div>

                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-5 shadow-lg ${step.shadowColor} group-hover:scale-110 transition-transform`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{step.description}</p>

                {/* Connector arrow */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 text-dark-600 text-2xl">→</div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* The Problem */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-20"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="glass rounded-2xl p-8 border-red-500/10">
              <h3 className="text-lg font-bold text-red-400 mb-6 flex items-center gap-2">
                😫 Before MovieFinder
              </h3>
              <div className="space-y-4">
                {[
                  { emoji: '😫', text: 'See cool movie clip on FB/TikTok' },
                  { emoji: '❓', text: 'No movie name mentioned' },
                  { emoji: '🔍', text: 'Search Google with bad description' },
                  { emoji: '😤', text: "Can't find it. Give up." },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5"
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-sm text-dark-300">{item.text}</span>
                    {i < 3 && <span className="ml-auto text-dark-600">↓</span>}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* After */}
            <div className="glass rounded-2xl p-8 border-green-500/10">
              <h3 className="text-lg font-bold text-green-400 mb-6 flex items-center gap-2">
                😊 After MovieFinder
              </h3>
              <div className="space-y-4">
                {[
                  { emoji: '😊', text: 'See cool movie clip' },
                  { emoji: '🔗', text: 'Paste the link' },
                  { emoji: '🤖', text: 'AI identifies the movie in seconds' },
                  { emoji: '📋', text: 'Get full info + where to watch' },
                  { emoji: '🎉', text: 'Watch the movie!' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-green-500/5"
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-sm text-dark-300">{item.text}</span>
                    {i < 4 && <span className="ml-auto text-dark-600">↓</span>}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold text-center mb-10">{t('about.features')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="glass rounded-xl p-5 hover:bg-white/5 transition-all group"
              >
                <f.icon className={`w-6 h-6 ${f.color} mb-3 group-hover:scale-110 transition-transform`} />
                <h4 className="font-semibold text-sm mb-1">{f.title}</h4>
                <p className="text-xs text-dark-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold text-center mb-10">Tech Stack</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/5 transition-all"
              >
                <span className="text-2xl">{tech.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{tech.name}</p>
                  <p className="text-xs text-dark-400">{tech.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Key Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-16"
        >
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Lightning Fast', desc: 'AI identifies movies in under 3 seconds', color: 'from-yellow-500 to-orange-500' },
              { icon: Shield, title: '100% Free', desc: 'No hidden costs, no subscriptions needed', color: 'from-green-500 to-emerald-500' },
              { icon: Smartphone, title: 'Mobile First', desc: 'Beautiful experience on any device', color: 'from-blue-500 to-indigo-500' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="text-center glass rounded-2xl p-8 group hover:bg-white/5 transition-all"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold mb-1">{item.title}</h3>
                <p className="text-sm text-dark-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center space-y-6"
        >
          <h2 className="text-3xl font-black text-gradient">Ready to find your movie?</h2>
          <motion.button
            onClick={() => setCurrentPage('chat')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold text-lg shadow-xl shadow-primary-600/30 hover:shadow-primary-600/50 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-5 h-5" />
            {t('hero.cta')}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
