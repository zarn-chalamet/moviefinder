import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import useAppStore from '../store/appStore';

export default function CTABanner() {
  const { t, setCurrentPage } = useAppStore();

  return (
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
            {t('hero.cta')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="mt-6 text-xs text-dark-500">
            {t('about.cta.free')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}