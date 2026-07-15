import { motion } from 'framer-motion';
import { Shield, Database, Cookie, Eye, Mail, ArrowLeft } from 'lucide-react';
import useAppStore from '../store/appStore';

export default function PrivacyPage() {
  const { t, setCurrentPage } = useAppStore();

  const sections = [
    {
      icon: Database,
      titleKey: 'privacy.section1.title',
      descKey: 'privacy.section1.desc',
    },
    {
      icon: Eye,
      titleKey: 'privacy.section2.title',
      descKey: 'privacy.section2.desc',
    },
    {
      icon: Cookie,
      titleKey: 'privacy.section3.title',
      descKey: 'privacy.section3.desc',
    },
    {
      icon: Shield,
      titleKey: 'privacy.section4.title',
      descKey: 'privacy.section4.desc',
    },
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setCurrentPage('home')}
          className="inline-flex items-center gap-2 text-sm text-dark-400 hover:text-white transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          {t('common.back')}
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-xs text-dark-300 mb-6">
            <Shield className="w-3.5 h-3.5 text-primary-400" strokeWidth={1.5} />
            {t('privacy.badge')}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[0.95] mb-6">
            {t('privacy.title')}
          </h1>

          <p className="text-lg text-dark-400 leading-relaxed mb-4">
            {t('privacy.subtitle')}
          </p>

          <p className="text-xs font-mono uppercase tracking-widest text-dark-500">
            {t('privacy.lastUpdated')}: October 2025
          </p>
        </motion.div>

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 mb-12"
        >
          <p className="text-sm text-dark-300 leading-relaxed">
            {t('privacy.intro')}
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-px bg-white/5 rounded-2xl overflow-hidden border border-white/5 mb-12">
          {sections.map((section, i) => (
            <motion.div
              key={section.titleKey}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-dark-950 p-6 sm:p-8"
            >
              <div className="flex gap-4">
                <section.icon
                  className="w-5 h-5 text-primary-400 flex-shrink-0 mt-1"
                  strokeWidth={1.5}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-base tracking-tight mb-2">
                    {t(section.titleKey)}
                  </h3>
                  <p className="text-sm text-dark-400 leading-relaxed whitespace-pre-line">
                    {t(section.descKey)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center"
        >
          <h3 className="font-semibold text-base tracking-tight mb-2">
            {t('privacy.contact.title')}
          </h3>
          <p className="text-sm text-dark-400 mb-4">
            {t('privacy.contact.desc')}
          </p>
          <a
            href="mailto:zarnn872@gmail.com"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm text-dark-200 hover:bg-white/5 hover:border-white/20 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
            zarnn872@gmail.com
          </a>
        </motion.div>
      </div>
    </div>
  );
}