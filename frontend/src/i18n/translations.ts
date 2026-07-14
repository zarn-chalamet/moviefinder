import { Language } from '../types';

type TranslationKeys = {
  [key: string]: string;
};

const translations: Record<Language, TranslationKeys> = {
  en: {
    // ============================================
    // NAVIGATION MENU (top navbar - keep short, 1-2 words max)
    // ============================================
    'nav.home': 'Home',                    // Homepage link
    'nav.chat': 'Find Movie',              // Link to AI chat page for finding movies
    'nav.trending': 'Trending',            // Link to trending movies page
    'nav.watchlist': 'Saved',              // Link to saved/bookmarked movies
    'nav.about': 'About',                  // Link to about page

    // ============================================
    // HERO SECTION (homepage - large headline, marketing tone)
    // ============================================
    'hero.title': 'Find Any Movie',                                          // Main headline - big, bold, catchy
    'hero.subtitle': 'from Social Media Clips',                              // Continuation of headline
    'hero.description': 'Paste a TikTok, Facebook, Instagram, or YouTube link — and let AI identify the movie for you in seconds.',  // Sub-description explaining what the app does
    'hero.cta': 'Start Finding Movies',                                      // Primary call-to-action button
    'hero.cta2': 'Watch Demo',                                               // Secondary button - show product demo
    'hero.stats.movies': 'Movies Identified',                                // Stat label - number of movies found
    'hero.stats.users': 'Happy Users',                                       // Stat label - number of users
    'hero.stats.languages': 'Languages',                                     // Stat label - supported languages count
    'hero.stats.cost': 'Free Forever',                                       // Stat label - pricing

    // ============================================
    // CHAT PAGE (AI chatbot conversation - friendly, conversational tone)
    // ============================================
    'chat.title': 'AI Movie Finder',                                         // Page title / header
    'chat.placeholder': 'Paste a video link or describe a movie scene...',   // Input field placeholder text
    'chat.send': 'Send',                                                     // Send message button
    'chat.welcome': "👋 Hi! I'm MovieFinder AI. Paste any TikTok, Facebook, Instagram, or YouTube link and I'll identify the movie for you!",  // First greeting from AI (friendly, warm)
    'chat.welcome2': 'You can also describe a movie scene and I\'ll try to find it.',  // Second welcome message with additional tip
    'chat.analyzing': 'Analyzing your request...',                           // Loading text while AI processes
    'chat.upload': 'Upload Screenshot',                                      // Button to upload image
    'chat.suggestions.title': 'Try asking:',                                 // Label above suggestion chips

    // ============================================
    // MOVIE INFO LABELS (movie detail cards - short, clear labels)
    // ============================================
    'movie.rating': 'Rating',                          // Star rating label
    'movie.year': 'Year',                              // Release year label
    'movie.runtime': 'Runtime',                        // Movie duration label
    'movie.minutes': 'min',                            // Abbreviation for minutes (e.g. "120 min")
    'movie.genre': 'Genre',                            // Movie category label
    'movie.director': 'Director',                      // Person who directed the film
    'movie.cast': 'Cast',                              // Actors/actresses label
    'movie.overview': 'Overview',                      // Movie synopsis section header
    'movie.whereToWatch': 'Where to Watch',            // Section showing streaming platforms
    'movie.whereToDownload': 'Download Links',         // Section showing download options
    'movie.trailer': 'Watch Trailer',                  // Button to play trailer video
    'movie.similar': 'Similar Movies',                 // Recommendations section
    'movie.addWatchlist': 'Add to Watchlist',          // Button to save movie
    'movie.removeWatchlist': 'Remove from Watchlist',  // Button to unsave movie
    'movie.free': 'Free',                              // Free content badge
    'movie.subscription': 'Subscription',              // Requires paid subscription badge
    'movie.rent': 'Rent',                              // Can be rented badge
    'movie.buy': 'Buy',                                // Can be purchased badge
    'movie.subtitles': 'Subtitles Available',          // Info about subtitle availability
    'movie.externalLink': 'Opens external site',       // Tooltip warning link goes outside app
    'movie.paidPlatforms': 'Paid Streaming Platforms', // Header for paid services group
    'movie.freePlatforms': 'Free Legal Streaming',     // Header for free legal services
    'movie.freeMovieSites': 'Free Movie Sites',        // Header for free movie sites (may be unofficial)
    'movie.downloadLinks': 'Download Links',           // Header for download options section

    // ============================================
    // WATCHLIST/SAVED MOVIES PAGE
    // ============================================
    'watchlist.title': 'Saved Movies',                                       // Page title
    'watchlist.subtitle': 'Your personal collection of movies to watch later.',
    'watchlist.empty': 'No saved movies yet. Start finding movies!',         // Empty state message
    'watchlist.wantToWatch': 'Want to Watch',                                // Filter/status - planned to watch
    'watchlist.watching': 'Watching',                                        // Filter/status - currently watching
    'watchlist.watched': 'Watched',                                          // Filter/status - already watched
    'watchlist.all': 'All',                                                  // Filter - show all

    // ============================================
    // TRENDING PAGE
    // ============================================
    'trending.title': 'Trending Now',                                        // Page title
    'trending.subtitle': 'Popular movies that everyone is talking about',    // Page subtitle
    'trending.badge': 'Popular right now',
    'trending.viewAll': 'View All Trending Movies',
    'trending.emptyGenre': 'No movies found for this genre.',
    'common.details': 'Details',
    'genre.all': 'All',
    'genre.action': 'Action',
    'genre.scifi': 'Sci-Fi',
    'genre.drama': 'Drama',
    'genre.thriller': 'Thriller',
    'genre.comedy': 'Comedy',
    'genre.animation': 'Animation',
    'genre.adventure': 'Adventure',

    // ============================================
    // ABOUT PAGE - HERO (big headlines, editorial/premium tone)
    // ============================================
    'about.badge': 'AI-powered movie identification',                        // Small badge above main headline
    'about.hero.title1': 'Never lose a movie',                               // Hero headline line 1 (big, bold statement)
    'about.hero.title2': 'to the algorithm.',                                // Hero headline line 2 (continues line 1, has gradient color)
    'about.hero.subtitle': 'Paste any movie clip from TikTok, Instagram, or YouTube. We identify it in seconds — with subtitles, streaming links, and more.',  // Hero description paragraph
    'about.hero.tryNow': 'Try it now',                                       // Primary CTA button
    'about.hero.browse': 'Browse trending',                                  // Secondary button
    'about.hero.available': 'Available in',                                  // Small text before language codes

    // ============================================
    // ABOUT PAGE - "HOW IT WORKS" SECTION
    // ============================================
    'about.howItWorks.label': 'How it works',                                // Small section label above title
    'about.howItWorks.title': 'Three steps. Under 10 seconds. Zero guesswork.', // Section headline (bold, confident)
    'about.step1.title': 'Paste',                                            // Step 1 title (single verb, action)
    'about.step1.desc': 'Drop a video link from TikTok, Instagram, Facebook, or YouTube.', // Step 1 explanation
    'about.step2.title': 'Analyze',                                          // Step 2 title (single verb)
    'about.step2.desc': 'Our AI examines audio, visuals, and metadata to identify the film.', // Step 2 explanation
    'about.step3.title': 'Watch',                                            // Step 3 title (single verb)
    'about.step3.desc': 'Get streaming links, subtitles, cast info, and recommendations.',   // Step 3 explanation

    // ============================================
    // ABOUT PAGE - "FEATURES" SECTION (what you get)
    // ============================================
    'about.features.label': 'What you get',                                  // Small section label
    'about.features.title': 'Built for people who watch a lot of movies.',   // Section headline
    'about.feature1.title': 'Instant identification',                        // Feature card 1 title
    'about.feature1.desc': 'AI recognizes films from just a few seconds of footage.',  // Feature 1 description
    'about.feature2.title': 'Streaming everywhere',                          // Feature card 2 title
    'about.feature2.desc': 'Find where to watch on Netflix, Disney+, Prime, and free sites.', // Feature 2 description
    'about.feature3.title': 'Subtitles included',                            // Feature card 3 title
    'about.feature3.desc': 'Download subtitles in Thai, Burmese, and English.',        // Feature 3 description
    'about.feature4.title': 'Smart recommendations',                         // Feature card 4 title
    'about.feature4.desc': "Get similar movies you'll actually want to watch.",        // Feature 4 description

    // ============================================
    // ABOUT PAGE - "PRINCIPLES" SECTION (values/philosophy)
    // ============================================
    'about.principles.label': 'Principles',                                  // Small section label
    'about.principles.title': 'What we care about.',                         // Section headline
    'about.principle1.title': 'Fast',                                        // Principle 1 (single word, gradient color)
    'about.principle1.desc': 'Under 10 seconds from paste to answer. Every time.',    // Principle 1 explanation
    'about.principle2.title': 'Free',                                        // Principle 2 (single word, gradient color)
    'about.principle2.desc': 'No subscription, no paywall, no premium tier.',         // Principle 2 explanation
    'about.principle3.title': 'Focused',                                     // Principle 3 (single word, gradient color)
    'about.principle3.desc': 'One job — identify movies — done exceptionally well.',  // Principle 3 explanation

    // ============================================
    // ABOUT PAGE - FINAL CTA (bottom of page)
    // ============================================
    'about.cta.title1': 'Stop scrolling.',                                   // CTA headline line 1 (bold command)
    'about.cta.title2': 'Start watching.',                                   // CTA headline line 2 (continues, gradient color)
    'about.cta.button': 'Find your movie',                                   // Main CTA button
    'about.cta.free': 'Free forever. No signup required.',                   // Small reassurance text below button

    // ============================================
    // FOOTER (bottom of every page)
    // ============================================
    'footer.tagline': 'Identify any movie from a social media clip in seconds.',  // Short brand tagline under logo
    'footer.product': 'Product',                                             // Footer column header - product links
    'footer.company': 'Company',                                             // Footer column header - company links
    'footer.poweredBy': 'Powered by',                                        // Footer column header - third-party services
    'footer.contact': 'Contact',                                             // Contact us link
    'footer.privacy': 'Privacy',                                             // Privacy policy link
    'footer.rights': 'All rights reserved.',                                 // Copyright text

    // ============================================
    // COMMON / SHARED (used across many pages)
    // ============================================
    'common.loading': 'Loading...',                                          // Loading state text
    'common.error': 'Something went wrong',                                  // Generic error message
    'common.retry': 'Try Again',                                             // Retry button after error
    'common.close': 'Close',                                                 // Close modal/dialog button
    'common.save': 'Save',                                                   // Save action button
    'common.cancel': 'Cancel',                                               // Cancel action button
    'common.search': 'Search',                                               // Search action
    'common.back': 'Back',                                                   // Back/return button

    // ============================================
    // MOVIE DETAIL PAGE (deep info about a specific movie)
    // ============================================
    'movie.findTitle': 'Find This Movie',                                    // Section header for finding where to watch
    'movie.findSubtitle': 'Search across popular platforms',                 // Subtitle for find section
    'movie.verifiedTitle': 'Verified Available',                             // Header for confirmed streaming platforms
    'movie.verifiedSubtitle': 'Confirmed streaming platforms in your region',// Explanation - verified/official platforms
    'movie.searchFreeTitle': 'Search Free Sites',                            // Header for free streaming section
    'movie.searchFreeSubtitle': 'Opens search — availability may vary',      // Warning that free results are search-based
    'movie.telegramTitle': 'Search on Telegram',                             // Header for Telegram channels section
    'movie.telegramSubtitle': 'Popular Myanmar channels',                    // Subtitle for Telegram section
    'movie.searchButton': 'Search',                                          // Search button label
    'movie.openChannel': 'Open',                                             // Open Telegram channel button
    'movie.notOnPremium': 'Not on premium platforms',                        // Warning - movie not on paid services
    'movie.notOnPremiumDesc': 'This movie is not currently on Netflix, Disney+, or other subscription services in your region. Try the free search options above.', // Long explanation for above warning
    'movie.copyTitle': 'Copy movie title',                                   // Tooltip on copy button
    'movie.copied': 'Copied!',                                               // Confirmation after copying
    'movie.searchTip': 'Tip: Copy the title above to search on any site',    // Helpful tip for users
    'movie.googleSearch': 'Search Google',                                   // Google search button
    'movie.saved': 'Saved',                                                  // Movie is in watchlist state
    'movie.saveMovie': 'Save Movie',                                         // Save to watchlist button
  },

  th: {
    // ============================================
    // NAVIGATION MENU (top navbar - keep short, 1-2 words max)
    // ============================================
    'nav.home': 'หน้าแรก',
    'nav.chat': 'หาหนัง',
    'nav.trending': 'มาแรง',
    'nav.watchlist': 'ที่บันทึกไว้',
    'nav.about': 'เกี่ยวกับเรา',

    // ============================================
    // HERO SECTION (homepage - large headline, marketing tone)
    // ============================================
    'hero.title': 'ตามหาหนังทุกเรื่อง',
    'hero.subtitle': 'จากคลิปบนโซเชียล',
    'hero.description': 'แค่แปะลิงก์ TikTok, Facebook, Instagram หรือ YouTube แล้วให้ AI ช่วยหาชื่อหนังให้คุณในไม่กี่วินาที',
    'hero.cta': 'เริ่มหาหนังเลย',
    'hero.cta2': 'ดูวิธีใช้งาน',
    'hero.stats.movies': 'หนังที่ค้นพบแล้ว',
    'hero.stats.users': 'ผู้ใช้ที่ประทับใจ',
    'hero.stats.languages': 'ภาษาที่รองรับ',
    'hero.stats.cost': 'ฟรีตลอดชีพ',

    // ============================================
    // CHAT PAGE (AI chatbot conversation - friendly, conversational tone)
    // ============================================
    'chat.title': 'AI ค้นหาหนัง',
    'chat.placeholder': 'แปะลิงก์วิดีโอ หรือพิมพ์อธิบายฉากหนังที่นึกออก...',
    'chat.send': 'ส่งเลย',
    'chat.welcome': '👋 สวัสดีครับ! ผมคือ MovieFinder AI แค่ส่งลิงก์จาก TikTok, Facebook, Instagram หรือ YouTube มา เดี๋ยวผมช่วยหาชื่อหนังให้ทันทีเลยครับ!',
    'chat.welcome2': 'หรือถ้าจำลิงก์ไม่ได้ ลองพิมพ์อธิบายฉากหนังที่พอจำได้มาให้ผมช่วยหาแทนก็ได้นะ',
    'chat.analyzing': 'กำลังวิเคราะห์คลิปให้คุณ รอสักครู่นะครับ...',
    'chat.upload': 'อัปโหลดภาพหน้าจอ',
    'chat.suggestions.title': 'ลองถามแบบนี้ดูสิ:',

    // ============================================
    // MOVIE INFO LABELS (movie detail cards - short, clear labels)
    // ============================================
    'movie.rating': 'คะแนนรีวิว',
    'movie.year': 'ปีที่ฉาย',
    'movie.runtime': 'ความยาว',
    'movie.minutes': 'นาที',
    'movie.genre': 'แนวหนัง',
    'movie.director': 'ผู้กำกับ',
    'movie.cast': 'นักแสดงนำ',
    'movie.overview': 'เรื่องย่อ',
    'movie.whereToWatch': 'ชี้เป้าช่องทางดู',
    'movie.whereToDownload': 'ลิงก์ดาวน์โหลด',
    'movie.trailer': 'ดูตัวอย่างหนัง',
    'movie.similar': 'หนังแนวเดียวกันที่คุณน่าจะชอบ',
    'movie.addWatchlist': 'บันทึกไว้ดูวันหลัง',
    'movie.removeWatchlist': 'ลบออกจากรายการบันทึก',
    'movie.free': 'ดูฟรี',
    'movie.subscription': 'ต้องสมัครสมาชิก',
    'movie.rent': 'เช่าหนัง',
    'movie.buy': 'ซื้อเก็บไว้',
    'movie.subtitles': 'มีซับไตเติล',
    'movie.externalLink': 'เปิดไปยังเว็บไซต์ภายนอก',
    'movie.paidPlatforms': 'แพลตฟอร์มสตรีมมิ่งแบบเสียเงิน',
    'movie.freePlatforms': 'สตรีมมิ่งฟรี (ถูกลิขสิทธิ์)',
    'movie.freeMovieSites': 'เว็บดูหนังฟรีทั่วไป',
    'movie.downloadLinks': 'ลิงก์ดาวน์โหลด',

    // ============================================
    // MOVIE DETAIL PAGE (deep info about a specific movie)
    // ============================================
    'movie.findTitle': 'ช่องทางรับชมหนังเรื่องนี้',
    'movie.findSubtitle': 'ค้นหาจากแพลตฟอร์มยอดนิยม',
    'movie.verifiedTitle': 'พร้อมสตรีมแน่นอน',
    'movie.verifiedSubtitle': 'ยืนยันแพลตฟอร์มที่มีให้ชมในพื้นที่ของคุณ',
    'movie.searchFreeTitle': 'ค้นหาจากเว็บดูหนังฟรี',
    'movie.searchFreeSubtitle': 'เปิดหน้าค้นหา (ความพร้อมของไฟล์อาจแตกต่างกันไปตามเว็บ)',
    'movie.telegramTitle': 'ค้นหาใน Telegram',
    'movie.telegramSubtitle': 'ช่อง Telegram พม่ายอดนิยม',
    'movie.searchButton': 'ค้นหาเลย',
    'movie.openChannel': 'เปิดช่อง',
    'movie.notOnPremium': 'ไม่มีในแพลตฟอร์มสตรีมมิ่งหลัก',
    'movie.notOnPremiumDesc': 'หนังเรื่องนี้ยังไม่มีให้รับชมบน Netflix, Disney+ หรือบริการรายเดือนอื่นๆ ในประเทศของคุณ ลองค้นหาจากตัวเลือกเว็บฟรีด้านบนดูนะครับ',
    'movie.copyTitle': 'คัดลอกชื่อหนัง',
    'movie.copied': 'คัดลอกสำเร็จแล้ว!',
    'movie.searchTip': 'เคล็ดลับ: คัดลอกชื่อหนังด้านบนไปเสิร์ชหาในเว็บอื่นๆ ได้ทันที',
    'movie.googleSearch': 'ค้นหาบน Google',
    'movie.saved': 'บันทึกแล้ว',
    'movie.saveMovie': 'บันทึกหนังเรื่องนี้',

    // ============================================
    // WATCHLIST/SAVED MOVIES PAGE
    // ============================================
    'watchlist.title': 'หนังที่บันทึกไว้',
    'watchlist.subtitle': 'คอลเลกชันหนังส่วนตัวของคุณที่จะดูในภายหลัง',
    'watchlist.empty': 'ยังไม่มีหนังที่บันทึกไว้เลย มาเริ่มหาหนังเรื่องโปรดกัน!',
    'watchlist.wantToWatch': 'อยากดู',
    'watchlist.watching': 'กำลังดูอยู่',
    'watchlist.watched': 'ดูจบแล้ว',
    'watchlist.all': 'ทั้งหมด',

    // ============================================
    // TRENDING PAGE
    // ============================================
    'trending.title': 'กำลังมาแรงตอนนี้',
    'trending.subtitle': 'หนังฮิตติดกระแสที่ใครๆ ก็กำลังพูดถึง',
    'trending.badge': 'กำลังเป็นที่นิยมตอนนี้',
    'trending.viewAll': 'ดูหนังมาแรงทั้งหมด',
    'trending.emptyGenre': 'ไม่พบหนังในหมวดนี้',
    'common.details': 'รายละเอียด',
    'genre.all': 'ทั้งหมด',
    'genre.action': 'แอ็กชัน',
    'genre.scifi': 'ไซไฟ',
    'genre.drama': 'ดราม่า',
    'genre.thriller': 'ระทึกขวัญ',
    'genre.comedy': 'คอมเมดี้',
    'genre.animation': 'แอนิเมชัน',
    'genre.adventure': 'ผจญภัย',

    // ============================================
    // ABOUT PAGE - HERO (big headlines, editorial/premium tone)
    // ============================================
    'about.badge': 'ระบบค้นหาชื่อหนังอัจฉริยะด้วย AI',
    'about.hero.title1': 'อย่าปล่อยให้หนังดีๆ',
    'about.hero.title2': 'ปลิวหายไปกับอัลกอริทึม',
    'about.hero.subtitle': 'แค่แปะลิงก์คลิปหนังจาก TikTok, Instagram หรือ YouTube เราจะช่วยค้นหาให้คุณในไม่กี่วินาที พร้อมชี้เป้าซับไตเติล ลิงก์สตรีมมิ่ง และข้อมูลอื่นๆ ครบครันภายในที่เดียว',
    'about.hero.tryNow': 'ลองใช้งานเลย',
    'about.hero.browse': 'ดูหนังกำลังฮิต',
    'about.hero.available': 'รองรับภาษา',

    // ============================================
    // ABOUT PAGE - "HOW IT WORKS" SECTION
    // ============================================
    'about.howItWorks.label': 'ขั้นตอนการใช้งาน',
    'about.howItWorks.title': '3 ขั้นตอนง่ายๆ ใน 10 วินาที เลิกนั่งเดาได้เลย',
    'about.step1.title': 'แปะลิงก์',
    'about.step1.desc': 'วางลิงก์วิดีโอที่คุณเจอจาก TikTok, Instagram, Facebook หรือ YouTube',
    'about.step2.title': 'วิเคราะห์',
    'about.step2.desc': 'AI ของเราจะเจาะลึกเสียง ภาพ และข้อมูลสแกนเพื่อระบุชื่อภาพยนตร์ที่ถูกต้อง',
    'about.step3.title': 'รับชม',
    'about.step3.desc': 'รับลิงก์สำหรับสตรีม ซับไตเติล รายชื่อนักแสดง และหนังแนะนำแนวเดียวกันที่คุณห้ามพลาด',

    // ============================================
    // ABOUT PAGE - "FEATURES" SECTION (what you get)
    // ============================================
    'about.features.label': 'ฟีเจอร์เด่นที่คุณจะได้รับ',
    'about.features.title': 'ออกแบบมาเพื่อคอหนังตัวจริงโดยเฉพาะ',
    'about.feature1.title': 'ค้นหาได้ทันที',
    'about.feature1.desc': 'AI อัจฉริยะสามารถจดจำและระบุภาพยนตร์ได้แม่นยำจากคลิปสั้นเพียงไม่กี่วินาที',
    'about.feature2.title': 'ชี้เป้าสตรีมมิ่งครบครัน',
    'about.feature2.desc': 'เช็กให้เสร็จสรรพว่าดูได้ที่ไหน ไม่ว่าจะเป็น Netflix, Disney+, Prime หรือเว็บดูหนังฟรี',
    'about.feature3.title': 'ซับไตเติลพร้อมสับ',
    'about.feature3.desc': 'ชี้เป้าดาวน์โหลดซับไตเติลภาษาไทย พม่า และอังกฤษ ได้อย่างสะดวกสบาย',
    'about.feature4.title': 'ระบบแนะนำอัจฉริยะ',
    'about.feature4.desc': 'คัดสรรหนังแนวเดียวกันที่คุณจะชอบและอยากดูต่อจริงๆ จากฐานข้อมูล',

    // ============================================
    // ABOUT PAGE - "PRINCIPLES" SECTION (values/philosophy)
    // ============================================
    'about.principles.label': 'หัวใจสำคัญของเรา',
    'about.principles.title': 'สิ่งที่เราให้ความสำคัญที่สุด',
    'about.principle1.title': 'รวดเร็ว',
    'about.principle1.desc': 'ใช้เวลาไม่ถึง 10 วินาทีนับตั้งแต่วางลิงก์จนได้คำตอบ แม่นยำทุกรอบ',
    'about.principle2.title': 'ฟรีจริง',
    'about.principle2.desc': 'ไม่มีเก็บค่าบริการรายเดือน ไม่มีระบบล็อกฟีเจอร์ ไม่มีระดับพรีเมียมให้รำคาญใจ',
    'about.principle3.title': 'โฟกัสตรงจุด',
    'about.principle3.desc': 'เราทำหน้าที่เดียวคือหาชื่อหนัง และเรามุ่งมั่นทำมันให้ได้ดีที่สุดในโลก',

    // ============================================
    // ABOUT PAGE - FINAL CTA (bottom of page)
    // ============================================
    'about.cta.title1': 'หยุดเลื่อนฟีดอย่างไร้จุดหมาย',
    'about.cta.title2': 'แล้วเริ่มดูหนังเรื่องที่ชอบกันเลย',
    'about.cta.button': 'ตามหาชื่อหนังเลย',
    'about.cta.free': 'ฟรีตลอดชีพ ไม่ต้องสมัครสมาชิกให้ยุ่งยาก',

    // ============================================
    // FOOTER (bottom of every page)
    // ============================================
    'footer.tagline': 'ค้นหาชื่อหนังจากคลิปบนโซเชียลมีเดียได้แม่นยำในไม่กี่วินาที',
    'footer.product': 'ผลิตภัณฑ์',
    'footer.company': 'เกี่ยวกับเรา',
    'footer.poweredBy': 'ขับเคลื่อนโดย',
    'footer.contact': 'ติดต่อเรา',
    'footer.privacy': 'นโยบายความเป็นส่วนตัว',
    'footer.rights': 'สงวนลิขสิทธิ์ทั้งหมด',

    // ============================================
    // COMMON / SHARED (used across many pages)
    // ============================================
    'common.loading': 'กำลังโหลด...',
    'common.error': 'เกิดข้อผิดพลาดบางอย่าง',
    'common.retry': 'ลองใหม่อีกครั้ง',
    'common.close': 'ปิด',
    'common.save': 'บันทึก',
    'common.cancel': 'ยกเลิก',
    'common.search': 'ค้นหา',
    'common.back': 'กลับ',
  },

  my: {
    // ============================================
    // NAVIGATION MENU (top navbar - keep short, 1-2 words max)
    // ============================================
    'nav.home': 'ပင်မစာမျက်နှာ',
    'nav.chat': 'ရုပ်ရှင်ရှာမယ်',
    'nav.trending': 'ခေတ်စားနေတာတွေ',
    'nav.watchlist': 'သိမ်းထားတာတွေ',
    'nav.about': 'အက်ပ်အကြောင်း',

    // ============================================
    // HERO SECTION (homepage - large headline, marketing tone)
    // ============================================
    'hero.title': 'ဘယ်ရုပ်ရှင်မဆို ရှာဖွေပါ',
    'hero.subtitle': 'ဆိုရှယ်မီဒီယာ ကလစ်တွေထဲကနေ',
    'hero.description': 'TikTok, Facebook, Instagram ဒါမှမဟုတ် YouTube လင့်ခ်ကို ကူးထည့်လိုက်ရုံနဲ့ AI က စက္ကန့်ပိုင်းအတွင်း ဘာရုပ်ရှင်လဲဆိုတာ တိတိကျကျ ရှာပေးပါလိမ့်မယ်။',
    'hero.cta': 'ရုပ်ရှင် စရှာကြစို့',
    'hero.cta2': 'နမူနာဗီဒီယိုကြည့်မယ်',
    'hero.stats.movies': 'ရှာဖွေပေးပြီးသမျှ ရုပ်ရှင်ပေါင်း',
    'hero.stats.users': 'ကျေနပ်အားရသူ စုစုပေါင်း',
    'hero.stats.languages': 'ဘာသာစကားများ',
    'hero.stats.cost': 'အမြဲတမ်း အခမဲ့',

    // ============================================
    // CHAT PAGE (AI chatbot conversation - friendly, conversational tone)
    // ============================================
    'chat.title': 'AI ရုပ်ရှင်ရှာဖွေရေး',
    'chat.placeholder': 'ဗီဒီယိုလင့်ခ် ထည့်ပါ သို့မဟုတ် ဇาတ်ကွက်ကို စာဖြင့် ရေးပြပါ...',
    'chat.send': 'ပို့မယ်',
    'chat.welcome': '👋 မင်္ဂလာပါဗျာ! ကျွန်တော်ကတော့ MovieFinder AI ဖြစ်ပါတယ်။ TikTok, Facebook, Instagram ဒါမှမဟုတ် YouTube က ကြည့်ချင်တဲ့ ဗီဒီယိုလင့်ခ်လေး ထည့်ပေးရုံနဲ့ ဘာရုပ်ရှင်လဲဆိုတာ အဖြေရှာပေးသွားမှာပါ!',
    'chat.welcome2': 'ရုပ်ရှင်ထဲက မှတ်မိတဲ့ ဇာတ်ကွက်လေးတွေကို စာနဲ့ ရေးပြပြီးတော့လည်း ရှာခိုင်းလို့ ရပါတယ်နော်။',
    'chat.analyzing': 'ဗီဒီယိုကို စစ်ဆေးနေပါတယ်... ခဏလေး စောင့်ပေးပါဗျာ...',
    'chat.upload': 'Screenshot တင်ပြီး ရှာမယ်',
    'chat.suggestions.title': 'ဒီလိုမျိုး မေးကြည့်နိုင်ပါတယ် -',

    // ============================================
    // MOVIE INFO LABELS (movie detail cards - short, clear labels)
    // ============================================
    'movie.rating': 'အဆင့်သတ်မှတ်ချက်',
    'movie.year': 'ထွက်ရှိသည့်နှစ်',
    'movie.runtime': 'ကြာချိန်',
    'movie.minutes': 'မိနစ်',
    'movie.genre': 'အမျိုးအစား',
    'movie.director': 'ဒါရိုက်တာ',
    'movie.cast': 'သရုပ်ဆောင်များ',
    'movie.overview': 'ဇာတ်လမ်းအကျဉ်း',
    'movie.whereToWatch': 'ဘယ်မှာကြည့်လို့ရမလဲ',
    'movie.whereToDownload': 'ဒေါင်းလုဒ်လင့်ခ်များ',
    'movie.trailer': 'Trailer ကြည့်မယ်',
    'movie.similar': 'သင်နှစ်သက်နိုင်မည့် ဆင်တူရုပ်ရှင်များ',
    'movie.addWatchlist': 'ကြည့်ချင်သည့်စာရင်းထဲ ထည့်မယ်',
    'movie.removeWatchlist': 'ကြည့်ချင်သည့်စာရင်းမှ ဖယ်မယ်',
    'movie.free': 'အခမဲ့ကြည့်နိုင်',
    'movie.subscription': 'အသင်းဝင်ရန်လို',
    'movie.rent': 'ငှားရမ်းကြည့်ရှု',
    'movie.buy': 'ဝယ်ယူကြည့်ရှု',
    'movie.subtitles': 'စာတန်းထိုး ပါဝင်မှု',
    'movie.externalLink': 'ပြင်ပဝဘ်ဆိုဒ်သို့ သွားမည်',
    'movie.paidPlatforms': 'အခပေး streaming ပလက်ဖောင်းများ',
    'movie.freePlatforms': 'တရားဝင် အခမဲ့ကြည့်ရှုနိုင်မည့်နေရာများ',
    'movie.freeMovieSites': 'အခမဲ့ ရုပ်ရှင်ဝဘ်ဆိုဒ်များ',
    'movie.downloadLinks': 'ဒေါင်းလုဒ်လင့်ခ်များ',

    // ============================================
    // MOVIE DETAIL PAGE (deep info about a specific movie)
    // ============================================
    'movie.findTitle': 'ရုပ်ရှင်ကြည့်ရှုနိုင်မည့်နေရာ',
    'movie.findSubtitle': 'နာမည်ကြီး ပလက်ဖောင်းများတွင် ရှာဖွေပါ',
    'movie.verifiedTitle': 'တရားဝင် ကြည့်ရှုနိုင်သည်',
    'movie.verifiedSubtitle': 'သင့်ဒေသတွင်း ကြည့်ရှုနိုင်သော တရားဝင် streaming ပလက်ဖောင်းများ',
    'movie.searchFreeTitle': 'အခမဲ့ဆိုဒ်များတွင် ရှာရန်',
    'movie.searchFreeSubtitle': 'ရှာဖွေမှုစာမျက်နှာကို ဖွင့်ပေးမည်ဖြစ်ပြီး ဇာတ်ကားရှိ/မရှိ ကွဲပြားနိုင်ပါသည်',
    'movie.telegramTitle': 'Telegram တွင် ရှာဖွေရန်',
    'movie.telegramSubtitle': 'နာမည်ကြီး မြန်မာ Telegram ချန်နယ်များ',
    'movie.searchButton': 'ရှာမယ်',
    'movie.openChannel': 'ချန်နယ်ဖွင့်ရန်',
    'movie.notOnPremium': 'Premium ပလက်ဖောင်းများတွင် မရှိပါ',
    'movie.notOnPremiumDesc': 'ဒီရုပ်ရှင်ကို လက်ရှိ သင့်ဒေသတွင်းရှိ Netflix, Disney+ သို့မဟုတ် အခြား အခပေးဝန်ဆောင်မှုများတွင် ကြည့်ရှု၍မရနိုင်ပါ။ အထက်ပါ အခမဲ့ရှာဖွေရေးလမ်းကြောင်းများကို စမ်းကြည့်ပေးပါဗျာ။',
    'movie.copyTitle': 'ရုပ်ရှင်ခေါင်းစဉ် ကူးယူမယ်',
    'movie.copied': 'ကူးယူပြီးပါပြီ!',
    'movie.searchTip': 'အကြံပြုချက် - အထက်ပါ ရုပ်ရှင်ခေါင်းစဉ်ကို ကူးယူပြီး မိမိကြိုက်နှစ်သက်ရာ ဝဘ်ဆိုဒ်များတွင် ရှာဖွေနိုင်ပါသည်',
    'movie.googleSearch': 'Google မှာ ရှာမယ်',
    'movie.saved': 'သိမ်းဆည်းပြီး',
    'movie.saveMovie': 'ရုပ်ရှင်ကို သိမ်းဆည်းမယ်',

    // ============================================
    // WATCHLIST/SAVED MOVIES PAGE
    // ============================================
    'watchlist.title': 'သိမ်းထားသော ရုပ်ရှင်များ',
    'watchlist.subtitle': 'နောက်မှကြည့်ရှုရန် သင့်ကိုယ်ပိုင် ရုပ်ရှင်စုဆောင်းမှု။',
    'watchlist.empty': 'သိမ်းထားတဲ့ ရုပ်ရှင်မရှိသေးပါဘူး။ အခုပဲ ရုပ်ရှင် စရှာကြည့်လိုက်ပါ!',
    'watchlist.wantToWatch': 'ကြည့်ချင်တာတွေ',
    'watchlist.watching': 'ကြည့်နေဆဲ',
    'watchlist.watched': 'ကြည့်ပြီးသား',
    'watchlist.all': 'အားလုံး',

    // ============================================
    // TRENDING PAGE
    // ============================================
    'trending.title': 'လောလောဆယ် ခေတ်စားနေတာတွေ',
    'trending.subtitle': 'လူပြောအများဆုံးနဲ့ လူကြိုက်အများဆုံး ရုပ်ရှင်များ',
    'trending.badge': 'အခုလက်ရှိ လူကြိုက်များနေသည်',
    'trending.viewAll': 'ခေတ်စားနေသော ရုပ်ရှင်အားလုံး ကြည့်မယ်',
    'trending.emptyGenre': 'ဒီအမျိုးအစားအတွက် ရုပ်ရှင်မတွေ့ပါ',
    'common.details': 'အသေးစိတ်',
    'genre.all': 'အားလုံး',
    'genre.action': 'အက်ရှင်',
    'genre.scifi': 'သိပ္ပံစိတ်ကူးယဉ်',
    'genre.drama': 'ဒရာမာ',
    'genre.thriller': 'သည်းထိတ်ရင်ဖို',
    'genre.comedy': 'ဟာသ',
    'genre.animation': 'ကာတွန်း',
    'genre.adventure': 'စွန့်စားခန်း',

    // ============================================
    // ABOUT PAGE - HERO (big headlines, editorial/premium tone)
    // ============================================
    'about.badge': 'AI သုံး ရုပ်ရှင်ရှာဖွေရေးစနစ်',
    'about.hero.title1': 'ကြည့်ချင်စရာ ရုပ်ရှင်တွေကို',
    'about.hero.title2': 'algorithm ထဲမှာ အပျောက်မခံပါနဲ့',
    'about.hero.subtitle': 'TikTok, Instagram သို့မဟုတ် YouTube က ရုပ်ရှင်ကလစ်လင့်ခ်ကို ကူးထည့်လိုက်ပါ။ စာတန်းထိုးများ၊ ကြည့်ရှုနိုင်မည့်လင့်ခ်များနှင့် အခြားအချက်အလက်များကို စက္ကန့်ပိုင်းအတွင်း ရှာဖွေပေးသွားမှာပါ။',
    'about.hero.tryNow': 'အခုပဲ စမ်းသုံးကြည့်မယ်',
    'about.hero.browse': 'ခေတ်စားနေတာတွေ ကြည့်မယ်',
    'about.hero.available': 'ရရှိနိုင်သော ဘာသာစကားများ -',

    // ============================================
    // ABOUT PAGE - "HOW IT WORKS" SECTION
    // ============================================
    'about.howItWorks.label': 'အလုပ်လုပ်ပုံအဆင့်ဆင့်',
    'about.howItWorks.title': '၃ ဆင့်တည်းနဲ့ ၁၀ စက္ကန့်အောက်။ ခန့်မှန်းနေစရာ မလိုတော့ဘူး။',
    'about.step1.title': 'လင့်ခ်ထည့်ပါ',
    'about.step1.desc': 'TikTok, Instagram, Facebook ဒါမှမဟုတ် YouTube က ဗီဒီယိုလင့်ခ်ကို ကူးထည့်ပါ။',
    'about.step2.title': 'ခွဲခြမ်းစိတ်ဖြာပါ',
    'about.step2.desc': 'ကျွန်ုပ်တို့၏ AI က အသံ၊ ရုပ်ပုံနှင့် မက်တာဒေတာများကို စစ်ဆေးပြီး ဘာရုပ်ရှင်လဲဆိုတာ တိကျစွာ အဖြေရှာပေးပါလိမ့်မယ်။',
    'about.step3.title': 'ကြည့်ရှုပါ',
    'about.step3.desc': 'ကြည့်ရှုနိုင်မည့် လင့်ခ်များ၊ စာတန်းထိုးများ၊ သရုပ်ဆောင်အချက်အလက်များနှင့် အကြံပြုချက်များကို ရယူလိုက်ပါ။',

    // ============================================
    // ABOUT PAGE - "FEATURES" SECTION (what you get)
    // ============================================
    'about.features.label': 'သင်ဘာတွေ ရရှိမလဲ',
    'about.features.title': 'ရုပ်ရှင် ဇာတ်လမ်းတွဲ အကြည့်များသူတွေအတွက် အထူးရည်ရွယ်ထုတ်လုပ်ထားပါတယ်',
    'about.feature1.title': 'ချက်ချင်း အဖြေရှာပေးနိုင်ခြင်း',
    'about.feature1.desc': 'စက္ကန့်အနည်းငယ်မျှသာရှိသော ဗီဒီယိုဖိုင်ကနေ ဘာရုပ်ရှင်လဲဆိုတာကို AI က တိကျစွာ မှတ်မိနိုင်ပါတယ်။',
    'about.feature2.title': 'နေရာစုံ ရှာဖွေပေးခြင်း',
    'about.feature2.desc': 'Netflix, Disney+, Prime နှင့် အခမဲ့ ဝဘ်ဆိုဒ်များထဲက ဘယ်မှာကြည့်လို့ရလဲဆိုတာ ရှာပေးပါတယ်။',
    'about.feature3.title': 'စာတန်းထိုးများ ပါဝင်ခြင်း',
    'about.feature3.desc': 'ထိုင်း၊ မြန်မာ နှင့် အင်္ဂလိပ် စာတန်းထိုးများကို အလွယ်တကူ ဒေါင်းလုဒ်ရယူနိုင်ပါတယ်။',
    'about.feature4.title': 'ဉာဏ်ရည်ထက်မြက်သော အကြံပြုချက်များ',
    'about.feature4.desc': 'သင် တကယ်နှစ်သက်မယ့် ဆင်တူရုပ်ရှင်ကောင်းတွေကို ညွှန်းဆိုပေးသွားမှာပါ။',

    // ============================================
    // ABOUT PAGE - "PRINCIPLES" SECTION (values/philosophy)
    // ============================================
    'about.principles.label': 'ကျွန်ုပ်တို့၏ ရည်မှန်းချက်များ',
    'about.principles.title': 'ကျွန်ုပ်တို့ အလေးအနက်ထားတဲ့ အရာများ',
    'about.principle1.title': 'မြန်ဆန်မှု',
    'about.principle1.desc': 'လင့်ခ်ထည့်ပြီး အဖြေရဖို့ ၁၀ စက္ကန့်အောက်ပဲ ကြာပါတယ်။ အမြဲတမ်း တိကျပါတယ်။',
    'about.principle2.title': 'လုံးဝအခမဲ့',
    'about.principle2.desc': 'လစဉ်ကြေး မလို၊ အခပေးစနစ် မရှိ၊ premium အဆင့်ခွဲခြားထားခြင်း မရှိပါ။',
    'about.principle3.title': 'အာရုံစိုက်မှု',
    'about.principle3.desc': 'ရုပ်ရှင်ရှာဖွေပေးခြင်း ဆိုတဲ့ အလုပ်တစ်ခုတည်းကိုပဲ အကောင်းဆုံး ဖြစ်အောင် အာရုံစိုက် လုပ်ဆောင်ပါတယ်။',

    // ============================================
    // ABOUT PAGE - FINAL CTA (bottom of page)
    // ============================================
    'about.cta.title1': 'လင့်ခ်တွေ လျှောက်ကြည့်ပြီး အချိန်မဖြုန်းပါနဲ့တော့။',
    'about.cta.title2': 'အခုပဲ စိတ်ကြိုက် ရုပ်ရှင်ကြည့်လိုက်ပါ။',
    'about.cta.button': 'ရုပ်ရှင် ရှာဖွေမယ်',
    'about.cta.free': 'အမြဲတမ်း အခမဲ့။ အကောင့်ဖွင့်ရန် မလိုပါ။',

    // ============================================
    // FOOTER (bottom of every page)
    // ============================================
    'footer.tagline': 'ဆိုရှယ်မီဒီယာ ကလစ်တွေထဲက ဘယ်ရုပ်ရှင်လဲဆိုတာကို စက္ကန့်ပိုင်းအတွင်း ရှာဖွေလိုက်ပါ။',
    'footer.product': 'ထုတ်ကုန်',
    'footer.company': 'ကုမ္ပဏီ',
    'footer.poweredBy': 'ပံ့ပိုးပေးထားသူ',
    'footer.contact': 'ဆက်သွယ်ရန်',
    'footer.privacy': 'ကိုယ်ရေးအချက်အလက် လုံခြုံမှု',
    'footer.rights': 'မူပိုင်ခွင့်အားလုံး ရရှိပြီးဖြစ်သည်။',

    // ============================================
    // COMMON / SHARED (used across many pages)
    // ============================================
    'common.loading': 'လုပ်ဆောင်နေပါသည်...',
    'common.error': 'တစ်စုံတစ်ခု မှားယွင်းနေပါသည်',
    'common.retry': 'ပြန်ကြိုးစားမယ်',
    'common.close': 'ပိတ်မယ်',
    'common.save': 'သိမ်းဆည်းမယ်',
    'common.cancel': 'ပယ်ဖျက်မယ်',
    'common.search': 'ရှာဖွေရန်',
    'common.back': 'နောက်သို့',
  },
};

export default translations;
