import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import useAppStore from '../store/appStore';

export default function CTABanner() {
  const { t, setCurrentPage } = useAppStore();

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 via-dark-950 to-accent-600/20" />
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-0 left-0 w-80 h-80 bg-accent-500/10 rounded-full blur-[100px]"
      />

      <div className="relative max-w-4xl mx-auto px-4 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
            <span className="text-gradient">Ready to find your movie?</span>
          </h2>
          <p className="text-dark-400 text-lg max-w-xl mx-auto">
            Paste any video link and let AI do the magic. It's free, fast, and supports Thai, Burmese, and English.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <motion.button
            onClick={() => setCurrentPage('chat')}
            className="group relative flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold text-lg shadow-xl shadow-primary-600/30 hover:shadow-primary-600/50 transition-all overflow-hidden"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Sparkles className="w-6 h-6 relative z-10" />
            <span className="relative z-10">{t('hero.cta')}</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 text-sm text-dark-500"
        >
          <span className="flex items-center gap-1">✅ No sign-up required</span>
          <span className="flex items-center gap-1">✅ 100% free</span>
          <span className="flex items-center gap-1">✅ Works instantly</span>
        </motion.div>
      </div>
    </section>
  );
}
