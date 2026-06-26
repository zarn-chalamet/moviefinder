import { Language } from '../types';

type TranslationKeys = {
  [key: string]: string;
};

const translations: Record<Language, TranslationKeys> = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.chat': 'Find Movie',
    'nav.trending': 'Trending',
    'nav.watchlist': 'Saved',
    'nav.about': 'About',

    // Hero
    'hero.title': 'Find Any Movie',
    'hero.subtitle': 'from Social Media Clips',
    'hero.description': 'Paste a TikTok, Facebook, Instagram, or YouTube link — and let AI identify the movie for you in seconds.',
    'hero.cta': 'Start Finding Movies',
    'hero.cta2': 'Watch Demo',
    'hero.stats.movies': 'Movies Identified',
    'hero.stats.users': 'Happy Users',
    'hero.stats.languages': 'Languages',
    'hero.stats.cost': 'Free Forever',

    // Chat
    'chat.title': 'AI Movie Finder',
    'chat.placeholder': 'Paste a video link or describe a movie scene...',
    'chat.send': 'Send',
    'chat.welcome': "👋 Hi! I'm MovieFinder AI. Paste any TikTok, Facebook, Instagram, or YouTube link and I'll identify the movie for you!",
    'chat.welcome2': 'You can also describe a movie scene and I\'ll try to find it.',
    'chat.analyzing': 'Analyzing your request...',
    'chat.upload': 'Upload Screenshot',
    'chat.suggestions.title': 'Try asking:',

    // Movie
    'movie.rating': 'Rating',
    'movie.year': 'Year',
    'movie.runtime': 'Runtime',
    'movie.minutes': 'min',
    'movie.genre': 'Genre',
    'movie.director': 'Director',
    'movie.cast': 'Cast',
    'movie.overview': 'Overview',
    'movie.whereToWatch': 'Where to Watch',
    'movie.whereToDownload': 'Download Links',
    'movie.trailer': 'Watch Trailer',
    'movie.similar': 'Similar Movies',
    'movie.addWatchlist': 'Add to Watchlist',
    'movie.removeWatchlist': 'Remove from Watchlist',
    'movie.free': 'Free',
    'movie.subscription': 'Subscription',
    'movie.rent': 'Rent',
    'movie.buy': 'Buy',
    'movie.subtitles': 'Subtitles Available',
    'movie.externalLink': 'Opens external site',
    'movie.paidPlatforms': 'Paid Streaming Platforms',
    'movie.freePlatforms': 'Free Legal Streaming',
    'movie.freeMovieSites': 'Free Movie Sites',
    'movie.downloadLinks': 'Download Links',

    // Watchlist
    'watchlist.title': 'Saved Movies',
    'watchlist.empty': 'No saved movies yet. Start finding movies!',
    'watchlist.wantToWatch': 'Want to Watch',
    'watchlist.watching': 'Watching',
    'watchlist.watched': 'Watched',
    'watchlist.all': 'All',

    // Trending
    'trending.title': 'Trending Now',
    'trending.subtitle': 'Popular movies that everyone is talking about',

    // About
    'about.title': 'About MovieFinder',
    'about.description': 'An AI-powered tool built for Myanmar & Thai audiences to identify movies from social media clips.',
    'about.howItWorks': 'How It Works',
    'about.step1': 'Paste Link',
    'about.step1.desc': 'Copy any video link from TikTok, Facebook, Instagram, or YouTube',
    'about.step2': 'AI Analysis',
    'about.step2.desc': 'Our AI analyzes the video metadata and identifies the movie',
    'about.step3': 'Get Results',
    'about.step3.desc': 'Get complete movie info, streaming options, and subtitles',
    'about.features': 'Features',

    // Footer
    'footer.madeWith': 'Made with ❤️ for',
    'footer.audience': 'Myanmar & Thai movie lovers',
    'footer.rights': 'All rights reserved',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.retry': 'Try Again',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.search': 'Search',
    'common.back': 'Back',
  },
  th: {
    // Nav
    'nav.home': 'หน้าแรก',
    'nav.chat': 'หาหนัง',
    'nav.trending': 'กำลังฮิต',
    'nav.watchlist': 'บันทึก',
    'nav.about': 'เกี่ยวกับ',

    // Hero
    'hero.title': 'ค้นหาหนังทุกเรื่อง',
    'hero.subtitle': 'จากคลิปโซเชียลมีเดีย',
    'hero.description': 'วางลิงก์จาก TikTok, Facebook, Instagram หรือ YouTube แล้ว AI จะระบุชื่อหนังให้คุณภายในไม่กี่วินาที',
    'hero.cta': 'เริ่มค้นหาหนัง',
    'hero.cta2': 'ดูตัวอย่าง',
    'hero.stats.movies': 'หนังที่ระบุได้',
    'hero.stats.users': 'ผู้ใช้มีความสุข',
    'hero.stats.languages': 'ภาษา',
    'hero.stats.cost': 'ฟรีตลอดไป',

    // Chat
    'chat.title': 'AI หาหนัง',
    'chat.placeholder': 'วางลิงก์วิดีโอหรืออธิบายฉากหนัง...',
    'chat.send': 'ส่ง',
    'chat.welcome': '👋 สวัสดีค่ะ! ฉันคือ MovieFinder AI วางลิงก์จาก TikTok, Facebook, Instagram หรือ YouTube แล้วฉันจะหาหนังให้คุณ!',
    'chat.welcome2': 'คุณยังสามารถอธิบายฉากหนังแล้วฉันจะพยายามหาให้ค่ะ',
    'chat.analyzing': 'กำลังวิเคราะห์คำขอของคุณ...',
    'chat.upload': 'อัปโหลดภาพหน้าจอ',
    'chat.suggestions.title': 'ลองถาม:',

    // Movie
    'movie.rating': 'คะแนน',
    'movie.year': 'ปี',
    'movie.runtime': 'ความยาว',
    'movie.minutes': 'นาที',
    'movie.genre': 'ประเภท',
    'movie.director': 'ผู้กำกับ',
    'movie.cast': 'นักแสดง',
    'movie.overview': 'เรื่องย่อ',
    'movie.whereToWatch': 'ดูได้ที่ไหน',
    'movie.whereToDownload': 'ลิงก์ดาวน์โหลด',
    'movie.trailer': 'ดูตัวอย่าง',
    'movie.similar': 'หนังที่คล้ายกัน',
    'movie.addWatchlist': 'เพิ่มในรายการ',
    'movie.removeWatchlist': 'ลบจากรายการ',
    'movie.free': 'ฟรี',
    'movie.subscription': 'สมาชิก',
    'movie.rent': 'เช่า',
    'movie.buy': 'ซื้อ',
    'movie.subtitles': 'ซับไตเติลที่มี',
    'movie.externalLink': 'เปิดเว็บไซต์ภายนอก',
    'movie.paidPlatforms': 'แพลตฟอร์มเสียเงิน',
    'movie.freePlatforms': 'สตรีมมิ่งฟรี (ถูกกฎหมาย)',
    'movie.freeMovieSites': 'เว็บดูหนังฟรี',
    'movie.downloadLinks': 'ลิงก์ดาวน์โหลด',

    // Watchlist
    'watchlist.title': 'หนังที่บันทึกไว้',
    'watchlist.empty': 'ยังไม่มีหนังที่บันทึก เริ่มค้นหาหนังเลย!',
    'watchlist.wantToWatch': 'อยากดู',
    'watchlist.watching': 'กำลังดู',
    'watchlist.watched': 'ดูแล้ว',
    'watchlist.all': 'ทั้งหมด',

    // Trending
    'trending.title': 'กำลังมาแรง',
    'trending.subtitle': 'หนังยอดนิยมที่ทุกคนพูดถึง',

    // About
    'about.title': 'เกี่ยวกับ MovieFinder',
    'about.description': 'เครื่องมือ AI ที่สร้างขึ้นสำหรับคนไทยและพม่าเพื่อระบุหนังจากคลิปโซเชียลมีเดีย',
    'about.howItWorks': 'วิธีการทำงาน',
    'about.step1': 'วางลิงก์',
    'about.step1.desc': 'คัดลอกลิงก์วิดีโอจาก TikTok, Facebook, Instagram หรือ YouTube',
    'about.step2': 'AI วิเคราะห์',
    'about.step2.desc': 'AI ของเราวิเคราะห์ข้อมูลวิดีโอและระบุหนัง',
    'about.step3': 'ได้ผลลัพธ์',
    'about.step3.desc': 'รับข้อมูลหนังครบถ้วน ตัวเลือกสตรีมมิ่ง และซับไตเติล',
    'about.features': 'คุณสมบัติ',

    // Footer
    'footer.madeWith': 'สร้างด้วย ❤️ สำหรับ',
    'footer.audience': 'คนรักหนังไทยและพม่า',
    'footer.rights': 'สงวนลิขสิทธิ์',

    // Common
    'common.loading': 'กำลังโหลด...',
    'common.error': 'เกิดข้อผิดพลาด',
    'common.retry': 'ลองอีกครั้ง',
    'common.close': 'ปิด',
    'common.save': 'บันทึก',
    'common.cancel': 'ยกเลิก',
    'common.search': 'ค้นหา',
    'common.back': 'กลับ',
  },
  my: {
    // Nav
    'nav.home': 'ပင်မ',
    'nav.chat': 'ရုပ်ရှင်ရှာ',
    'nav.trending': 'ခေတ်စားနေသော',
    'nav.watchlist': 'သိမ်းထားသည်',
    'nav.about': 'အကြောင်း',

    // Hero
    'hero.title': 'ရုပ်ရှင်တိုင်းကို ရှာပါ',
    'hero.subtitle': 'ဆိုရှယ်မီဒီယာ ကလစ်များမှ',
    'hero.description': 'TikTok, Facebook, Instagram သို့မဟုတ် YouTube လင့်ခ်ကို ထည့်ပါ — AI က ရုပ်ရှင်ကို စက္ကန့်ပိုင်းအတွင်း ရှာပေးပါမည်။',
    'hero.cta': 'ရုပ်ရှင်ရှာစတင်ပါ',
    'hero.cta2': 'သရုပ်ပြကြည့်ပါ',
    'hero.stats.movies': 'ရှာတွေ့သောရုပ်ရှင်',
    'hero.stats.users': 'ကျေနပ်သောအသုံးပြုသူ',
    'hero.stats.languages': 'ဘာသာစကား',
    'hero.stats.cost': 'အမြဲတမ်းအခမဲ့',

    // Chat
    'chat.title': 'AI ရုပ်ရှင်ရှာဖွေသူ',
    'chat.placeholder': 'ဗီဒီယိုလင့်ခ် ထည့်ပါ သို့မဟုတ် ရုပ်ရှင်ဇာတ်ကွက်ကို ဖော်ပြပါ...',
    'chat.send': 'ပို့ရန်',
    'chat.welcome': '👋 မင်္ဂလာပါ! ကျွန်တော်က MovieFinder AI ပါ။ TikTok, Facebook, Instagram သို့မဟုတ် YouTube လင့်ခ်ကို ထည့်ပါ၊ ရုပ်ရှင်ကို ရှာပေးပါမယ်!',
    'chat.welcome2': 'ရုပ်ရှင်ဇာတ်ကွက်ကို ဖော်ပြပြီး ရှာခိုင်းလို့လည်း ရပါတယ်။',
    'chat.analyzing': 'သင့်တောင်းဆိုချက်ကို ခွဲခြမ်းစိတ်ဖြာနေပါသည်...',
    'chat.upload': 'ဖန်သားပြင်ဓာတ်ပုံတင်ပါ',
    'chat.suggestions.title': 'စမ်းကြည့်ပါ:',

    // Movie
    'movie.rating': 'အဆင့်သတ်မှတ်ချက်',
    'movie.year': 'ခုနှစ်',
    'movie.runtime': 'ကြာချိန်',
    'movie.minutes': 'မိနစ်',
    'movie.genre': 'အမျိုးအစား',
    'movie.director': 'ဒါရိုက်တာ',
    'movie.cast': 'မင်းသားမင်းသမီး',
    'movie.overview': 'အကျဉ်းချုပ်',
    'movie.whereToWatch': 'ဘယ်မှာကြည့်မလဲ',
    'movie.whereToDownload': 'ဒေါင်းလုဒ်လင့်ခ်များ',
    'movie.trailer': 'ကြိုတင်ကြည့်ရှုရန်',
    'movie.similar': 'ဆင်တူရုပ်ရှင်များ',
    'movie.addWatchlist': 'စာရင်းထဲထည့်ရန်',
    'movie.removeWatchlist': 'စာရင်းမှဖယ်ရှားရန်',
    'movie.free': 'အခမဲ့',
    'movie.subscription': 'စာရင်းသွင်း',
    'movie.rent': 'ငှားရမ်း',
    'movie.buy': 'ဝယ်ယူ',
    'movie.subtitles': 'စာတန်းထိုးရနိုင်',
    'movie.externalLink': 'ပြင်ပဝဘ်ဆိုဒ်ကိုဖွင့်ပါ',
    'movie.paidPlatforms': 'အခပေးပလက်ဖောင်းများ',
    'movie.freePlatforms': 'အခမဲ့တရားဝင်ကြည့်ရှုရန်',
    'movie.freeMovieSites': 'အခမဲ့ရုပ်ရှင်ဆိုဒ်များ',
    'movie.downloadLinks': 'ဒေါင်းလုဒ်လင့်ခ်များ',

    // Watchlist
    'watchlist.title': 'သိမ်းထားသည့်ရုပ်ရှင်များ',
    'watchlist.empty': 'သိမ်းထားသည့်ရုပ်ရှင်များ မရှိသေးပါ။ ရုပ်ရှင်ရှာစတင်ပါ!',
    'watchlist.wantToWatch': 'ကြည့်ချင်',
    'watchlist.watching': 'ကြည့်နေသည်',
    'watchlist.watched': 'ကြည့်ပြီး',
    'watchlist.all': 'အားလုံး',


    // Trending
    'trending.title': 'လူကြိုက်များနေသော',
    'trending.subtitle': 'လူတိုင်းပြောနေသော လူကြိုက်များရုပ်ရှင်များ',

    // About
    'about.title': 'MovieFinder အကြောင်း',
    'about.description': 'ဆိုရှယ်မီဒီယာ ကလစ်များမှ ရုပ်ရှင်ကို ခွဲခြား သိရှိရန် မြန်မာနှင့် ထိုင်းပရိသတ်များအတွက် တည်ဆောက်ထားသော AI စွမ်းဆောင်ရည် ကိရိယာ',
    'about.howItWorks': 'အလုပ်လုပ်ပုံ',
    'about.step1': 'လင့်ခ်ထည့်ပါ',
    'about.step1.desc': 'TikTok, Facebook, Instagram သို့မဟုတ် YouTube မှ ဗီဒီယိုလင့်ခ်ကို ကူးယူပါ',
    'about.step2': 'AI ခွဲခြမ်းစိတ်ဖြာ',
    'about.step2.desc': 'ကျွန်ုပ်တို့၏ AI သည် ဗီဒီယိုဒေတာကို ခွဲခြမ်းစိတ်ဖြာပြီး ရုပ်ရှင်ကို ခွဲခြားသည်',
    'about.step3': 'ရလဒ်ရယူပါ',
    'about.step3.desc': 'ရုပ်ရှင်အချက်အလက် အပြည့်အစုံ၊ ကြည့်ရှုနိုင်သည့်နေရာနှင့် စာတန်းထိုး ရယူပါ',
    'about.features': 'အင်္ဂါရပ်များ',

    // Footer
    'footer.madeWith': '❤️ ဖြင့်ဖန်တီးထားသည်',
    'footer.audience': 'မြန်မာနှင့်ထိုင်း ရုပ်ရှင်ချစ်သူများအတွက်',
    'footer.rights': 'မူပိုင်ခွင့်ရှိသည်',

    // Common
    'common.loading': 'ဖတ်ယူနေပါသည်...',
    'common.error': 'တစ်ခုခုမှားနေပါသည်',
    'common.retry': 'ထပ်ကြိုးစားပါ',
    'common.close': 'ပိတ်ရန်',
    'common.save': 'သိမ်းရန်',
    'common.cancel': 'ပယ်ဖျက်ရန်',
    'common.search': 'ရှာဖွေရန်',
    'common.back': 'နောက်သို့',
  },
};

export default translations;
