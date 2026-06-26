import { motion } from 'framer-motion';
import {
  Link2, MessageSquare, Film, Globe, Subtitles,
  Sparkles, Download
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
    color: 'from-blue-500 to-cyan-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: MessageSquare,
    title: 'AI Chat',
    titleTh: 'AI แชท',
    titleMy: 'AI ချတ်',
    desc: 'Interactive conversation in English, Thai, or Burmese',
    descTh: 'สนทนาแบบอินเทอร์แอคทีฟในภาษาอังกฤษ ไทย หรือพม่า',
    descMy: 'အင်္ဂလိပ်၊ ထိုင်း သို့မဟုတ် မြန်မာဘာသာဖြင့် အပြန်အလှန် စကားပြောဆိုခြင်း',
    color: 'from-purple-500 to-pink-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Film,
    title: 'Full Movie Info',
    titleTh: 'ข้อมูลหนังครบ',
    titleMy: 'ရုပ်ရှင်အချက်အလက်အပြည့်',
    desc: 'Complete details with cast, ratings, trailers, and more',
    descTh: 'รายละเอียดครบพร้อมนักแสดง คะแนน ตัวอย่าง และอื่นๆ',
    descMy: 'သရုပ်ဆောင်၊ အဆင့်သတ်မှတ်ချက်၊ ကြိုတင်ကြည့်ရှုခွင့်နှင့် အခြားအရာများ',
    color: 'from-pink-500 to-rose-400',
    bg: 'bg-pink-500/10',
  },
  {
    icon: Globe,
    title: 'Watch & Download Links',
    titleTh: 'ลิงก์ดู & ดาวน์โหลด',
    titleMy: 'ကြည့်ရှုရန် & ဒေါင်းလုဒ်လင့်ခ်များ',
    desc: 'Links to Netflix, free streaming sites, torrents & more',
    descTh: 'ลิงก์ไปยัง Netflix เว็บดูฟรี ทอร์เรนต์ และอื่นๆ',
    descMy: 'Netflix, အခမဲ့ဆိုဒ်များ, torrent နှင့်အခြားလင့်ခ်များ',
    color: 'from-cyan-500 to-teal-400',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Download,
    title: 'Download Options',
    titleTh: 'ดาวน์โหลด',
    titleMy: 'ဒေါင်းလုဒ်',
    desc: 'Torrent & direct download links for offline viewing',
    descTh: 'ลิงก์ทอร์เรนต์และดาวน์โหลดตรงสำหรับดูออฟไลน์',
    descMy: 'အော့ဖ်လိုင်းကြည့်ရှုရန် Torrent နှင့် ဒေါင်းလုဒ်လင့်ခ်များ',
    color: 'from-purple-500 to-violet-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Subtitles,
    title: 'Subtitle Links',
    titleTh: 'ซับไตเติล',
    titleMy: 'စာတန်းထိုး',
    desc: 'Thai, Burmese & English subtitle download links',
    descTh: 'ลิงก์ดาวน์โหลดซับไทย พม่า และอังกฤษ',
    descMy: 'ထိုင်း၊ မြန်မာနှင့် အင်္ဂလိပ် စာတန်းထိုး ဒေါင်းလုဒ်လင့်ခ်များ',
    color: 'from-yellow-500 to-amber-400',
    bg: 'bg-yellow-500/10',
  },
];

export default function FeaturesSection() {
  const { language } = useAppStore();

  return (
    <section className="relative py-20 bg-dark-950 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url(/images/pattern-bg.jpg)', backgroundSize: 'cover' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light text-sm">
            <Sparkles className="w-4 h-4 text-neon-purple" />
            <span className="text-dark-300">Powerful Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black">
            <span className="text-gradient">Everything you need</span>
          </h2>
          <p className="text-dark-400 max-w-md mx-auto">
            Identify movies from social media clips with AI precision
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => {
            const title = language === 'th' ? feature.titleTh : language === 'my' ? feature.titleMy : feature.title;
            const desc = language === 'th' ? feature.descTh : language === 'my' ? feature.descMy : feature.desc;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group glass rounded-2xl p-6 hover:bg-white/[0.03] transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary-300 transition-colors">{title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
