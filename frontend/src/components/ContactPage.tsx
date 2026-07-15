import { motion } from 'framer-motion';
import { Mail, MessageCircle, ArrowLeft, ArrowRight, Bug, Lightbulb, HelpCircle } from 'lucide-react';
import { GithubIcon } from './icons/GithubIcon';
import useAppStore from '../store/appStore';

export default function ContactPage() {
  const { t, setCurrentPage } = useAppStore();

  const contactMethods = [
    {
      icon: Mail,
      titleKey: 'contact.method1.title',
      descKey: 'contact.method1.desc',
      action: 'zarnn872@gmail.com',
      href: 'mailto:zarnn872@gmail.com',
    },
    {
      icon: GithubIcon,
      titleKey: 'contact.method2.title',
      descKey: 'contact.method2.desc',
      action: 'GitHub Issues',
      href: 'https://github.com/zarn-chalamet/moviefinder/issues',
    },
  ];

  const reasons = [
    { icon: Bug, key: 'bug' },
    { icon: Lightbulb, key: 'feature' },
    { icon: HelpCircle, key: 'help' },
    { icon: MessageCircle, key: 'other' },
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
            <MessageCircle className="w-3.5 h-3.5 text-primary-400" strokeWidth={1.5} />
            {t('contact.badge')}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[0.95] mb-6">
            {t('contact.title1')} {' '}
            <span className="text-gradient">{t('contact.title2')}</span>
          </h1>

          <p className="text-lg text-dark-400 leading-relaxed max-w-xl">
            {t('contact.subtitle')}
          </p>
        </motion.div>

        {/* Reasons to contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <p className="text-xs font-mono uppercase tracking-widest text-primary-400 mb-4">
            {t('contact.reasons.label')}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
            {reasons.map((reason, i) => (
              <motion.div
                key={reason.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                className="bg-dark-950 p-5 hover:bg-white/[0.02] transition-colors group text-center"
              >
                <reason.icon
                  className="w-5 h-5 text-dark-500 group-hover:text-primary-400 transition-colors mx-auto mb-2"
                  strokeWidth={1.5}
                />
                <p className="text-xs text-dark-400 group-hover:text-white transition-colors">
                  {t(`contact.reasons.${reason.key}`)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-xs font-mono uppercase tracking-widest text-primary-400 mb-4">
            {t('contact.methods.label')}
          </p>
          <div className="space-y-3">
            {contactMethods.map((method, i) => (
              <motion.a
                key={method.titleKey}
                href={method.href}
                target={method.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="group flex items-center gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04] transition-all"
              >
                <div className="w-11 h-11 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-center flex-shrink-0">
                  <method.icon
                    className="w-5 h-5 text-primary-400"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm tracking-tight mb-0.5">
                    {t(method.titleKey)}
                  </h3>
                  <p className="text-xs text-dark-400 mb-1">
                    {t(method.descKey)}
                  </p>
                  <p className="text-sm font-mono text-dark-300 truncate">
                    {method.action}
                  </p>
                </div>
                <ArrowRight
                  className="w-4 h-4 text-dark-500 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0"
                  strokeWidth={1.5}
                />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Response time note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-dark-500 text-center mt-12"
        >
          {t('contact.responseTime')}
        </motion.p>
      </div>
    </div>
  );
}