import { motion } from 'framer-motion';
import { ArrowRight, Link2, Sparkles, Film, Zap, Globe } from 'lucide-react';
import useAppStore from '../store/appStore';

export default function AboutPage() {
  const { t, setCurrentPage } = useAppStore();

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* HERO */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-xs text-dark-300 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            {t('about.badge')}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-[-0.04em] leading-[0.95] mb-8"
          >
            {t('about.hero.title1')}
            <br />
            <span className="text-gradient">{t('about.hero.title2')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-dark-400 max-w-2xl mx-auto leading-relaxed"
          >
            {t('about.hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex items-center justify-center gap-3"
          >
            <button
              onClick={() => setCurrentPage('chat')}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-dark-950 font-semibold text-sm hover:bg-dark-200 transition-colors"
            >
              {t('about.hero.tryNow')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => setCurrentPage('trending')}
              className="px-6 py-3 rounded-full border border-white/10 text-sm text-dark-200 hover:bg-white/5 hover:border-white/20 transition-colors"
            >
              {t('about.hero.browse')}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 flex items-center justify-center gap-6 text-xs text-dark-500"
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
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <p className="text-xs font-mono uppercase tracking-widest text-primary-400 mb-3">
              {t('about.howItWorks.label')}
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-[-0.03em] leading-tight max-w-2xl">
              {t('about.howItWorks.title')}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { num: '01', icon: Link2, titleKey: 'about.step1.title', descKey: 'about.step1.desc' },
              { num: '02', icon: Sparkles, titleKey: 'about.step2.title', descKey: 'about.step2.desc' },
              { num: '03', icon: Film, titleKey: 'about.step3.title', descKey: 'about.step3.desc' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group"
              >
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="font-mono text-xs text-dark-600">{step.num}</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <step.icon className="w-6 h-6 text-primary-400 mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold mb-2 tracking-tight">{t(step.titleKey)}</h3>
                <p className="text-dark-400 leading-relaxed text-sm">{t(step.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p className="text-xs font-mono uppercase tracking-widest text-primary-400 mb-3">
              {t('about.features.label')}
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-[-0.03em] leading-tight max-w-2xl">
              {t('about.features.title')}
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
            {[
              { icon: Zap, titleKey: 'about.feature1.title', descKey: 'about.feature1.desc' },
              { icon: Globe, titleKey: 'about.feature2.title', descKey: 'about.feature2.desc' },
              { icon: Film, titleKey: 'about.feature3.title', descKey: 'about.feature3.desc' },
              { icon: Sparkles, titleKey: 'about.feature4.title', descKey: 'about.feature4.desc' },
            ].map((f, i) => (
              <motion.div
                key={f.titleKey}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-dark-950 p-8 hover:bg-white/[0.02] transition-colors group"
              >
                <f.icon className="w-5 h-5 text-dark-500 group-hover:text-primary-400 transition-colors mb-4" strokeWidth={1.5} />
                <h3 className="font-semibold mb-2 text-base tracking-tight">{t(f.titleKey)}</h3>
                <p className="text-sm text-dark-400 leading-relaxed">{t(f.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p className="text-xs font-mono uppercase tracking-widest text-primary-400 mb-3">
              {t('about.principles.label')}
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-[-0.03em] leading-tight max-w-2xl">
              {t('about.principles.title')}
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-12">
            {[
              { titleKey: 'about.principle1.title', descKey: 'about.principle1.desc' },
              { titleKey: 'about.principle2.title', descKey: 'about.principle2.desc' },
              { titleKey: 'about.principle3.title', descKey: 'about.principle3.desc' },
            ].map((p, i) => (
              <motion.div
                key={p.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <h3 className="text-3xl font-bold tracking-[-0.03em] mb-3 text-gradient inline-block">
                  {t(p.titleKey)}
                </h3>
                <p className="text-dark-400 leading-relaxed">{t(p.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.04em] leading-[1.05] mb-8">
              {t('about.cta.title1')}
              <br />
              <span className="text-gradient">{t('about.cta.title2')}</span>
            </h2>

            <button
              onClick={() => setCurrentPage('chat')}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-dark-950 font-semibold hover:bg-dark-200 transition-colors"
            >
              {t('about.cta.button')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="mt-6 text-xs text-dark-500">
              {t('about.cta.free')}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}