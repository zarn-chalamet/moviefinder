import { motion } from 'framer-motion';
import {
  Link2,
  MessageSquare,
  Film,
  Globe,
  Subtitles,
  Download,
} from 'lucide-react';
import useAppStore from '../store/appStore';

const features = [
  {
    icon: Link2,
    title: 'URL Analysis',
    titleTh: 'วิเคราะห์ลิงก์',
    titleMy: 'URL ခွဲခြမ်းစိတ်ဖြာ',
    desc: 'Paste any link from TikTok, Facebook, Instagram, or YouTube',
    descTh: 'วางลิงก์จาก TikTok, Facebook, Instagram หรือ YouTube',
    descMy: 'TikTok, Facebook, Instagram သို့မဟုတ် YouTube မှ လင့်ခ်ထည့်ပါ',
  },
  {
    icon: MessageSquare,
    title: 'AI Chat',
    titleTh: 'AI แชท',
    titleMy: 'AI ချတ်',
    desc: 'Interactive conversation in English, Thai, or Burmese',
    descTh: 'สนทนาแบบอินเทอร์แอคทีฟในภาษาอังกฤษ ไทย หรือพม่า',
    descMy: 'အင်္ဂလိပ်၊ ထိုင်း သို့မဟုတ် မြန်မာဘာသာဖြင့် အပြန်အလှန် စကားပြောဆိုခြင်း',
  },
  {
    icon: Film,
    title: 'Full Movie Info',
    titleTh: 'ข้อมูลหนังครบ',
    titleMy: 'ရုပ်ရှင်အချက်အလက်အပြည့်',
    desc: 'Complete details with cast, ratings, trailers, and more',
    descTh: 'รายละเอียดครบพร้อมนักแสดง คะแนน ตัวอย่าง และอื่นๆ',
    descMy: 'သရုပ်ဆောင်၊ အဆင့်သတ်မှတ်ချက်၊ Trailer နှင့် အခြားအရာများ',
  },
  {
    icon: Globe,
    title: 'Streaming Links',
    titleTh: 'ลิงก์สตรีมมิ่ง',
    titleMy: 'ကြည့်ရှုရန် လင့်ခ်များ',
    desc: 'Find where to watch on Netflix, Disney+, and free sites',
    descTh: 'หาแหล่งรับชมบน Netflix, Disney+ และเว็บดูฟรี',
    descMy: 'Netflix, Disney+ နှင့် အခမဲ့ဆိုဒ်များတွင် ရှာဖွေပါ',
  },
  {
    icon: Download,
    title: 'Download Options',
    titleTh: 'ดาวน์โหลด',
    titleMy: 'ဒေါင်းလုဒ်',
    desc: 'Direct download links for offline viewing',
    descTh: 'ลิงก์ดาวน์โหลดตรงสำหรับดูออฟไลน์',
    descMy: 'အော့ဖ်လိုင်းကြည့်ရှုရန် ဒေါင်းလုဒ်လင့်ခ်များ',
  },
  {
    icon: Subtitles,
    title: 'Subtitle Links',
    titleTh: 'ซับไตเติล',
    titleMy: 'စာတန်းထိုး',
    desc: 'Thai, Burmese & English subtitle downloads',
    descTh: 'ดาวน์โหลดซับไทย พม่า และอังกฤษ',
    descMy: 'ထိုင်း၊ မြန်မာနှင့် အင်္ဂလိပ် စာတန်းထိုး ဒေါင်းလုဒ်များ',
  },
];

export default function FeaturesSection() {
  const { language, t } = useAppStore();

  return (
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
            {t('about.features.label')}
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-[-0.03em] leading-tight max-w-2xl">
            {t('about.features.title')}
          </h2>
        </motion.div>

        {/* Feature grid — matches About page card grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {features.map((feature, i) => {
            const title =
              language === 'th'
                ? feature.titleTh
                : language === 'my'
                  ? feature.titleMy
                  : feature.title;
            const desc =
              language === 'th'
                ? feature.descTh
                : language === 'my'
                  ? feature.descMy
                  : feature.desc;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-dark-950 p-8 hover:bg-white/[0.02] transition-colors group"
              >
                <feature.icon
                  className="w-5 h-5 text-dark-500 group-hover:text-primary-400 transition-colors mb-4"
                  strokeWidth={1.5}
                />
                <h3 className="font-semibold mb-2 text-base tracking-tight">
                  {title}
                </h3>
                <p className="text-sm text-dark-400 leading-relaxed">{desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}