import { Movie, StreamingProvider, Language } from '../types';

export const mockMovies: Movie[] = [
  {
    id: 27205,
    title: 'Inception',
    titleTh: 'จิตพิฆาตโลก',
    titleMy: 'အိပ်မက်ထဲသို့',
    year: '2010',
    rating: 8.8,
    voteCount: 35842,
    runtime: 148,
    genres: ['Sci-Fi', 'Action', 'Thriller'],
    overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
    overviewTh: 'หัวขโมยที่ขโมยความลับขององค์กรผ่านเทคโนโลยีแบ่งปันความฝัน ได้รับมอบหมายงานตรงข้ามในการปลูกฝังความคิดในจิตใจของ CEO',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy', 'Ken Watanabe'],
    tagline: 'Your mind is the scene of the crime.',
  },
  {
    id: 157336,
    title: 'Interstellar',
    titleTh: 'อินเตอร์สเตลลาร์ ทะยานดาวกู้โลก',
    titleMy: 'ကြယ်များကြား',
    year: '2014',
    rating: 8.7,
    voteCount: 33520,
    runtime: 169,
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    overviewTh: 'การผจญภัยของกลุ่มนักสำรวจที่ใช้หลุมหนอนที่เพิ่งค้นพบเพื่อก้าวข้ามข้อจำกัดของการเดินทางในอวกาศ',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK1DVfjko.jpg',
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
  },
  {
    id: 550,
    title: 'Fight Club',
    titleTh: 'ไฟท์คลับ ดิบดวลดิบ',
    titleMy: 'ရိုက်ပွဲကလပ်',
    year: '1999',
    rating: 8.4,
    voteCount: 28300,
    runtime: 139,
    genres: ['Drama', 'Thriller'],
    overview: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.",
    posterUrl: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/hZkgoQYus5dXo3H8T7CYV25zIWt.jpg',
    director: 'David Fincher',
    cast: ['Brad Pitt', 'Edward Norton', 'Helena Bonham Carter'],
    tagline: 'Mischief. Mayhem. Soap.',
  },
  {
    id: 680,
    title: 'Pulp Fiction',
    titleTh: 'เขย่าชีพจรเกินเดือด',
    titleMy: 'ပုံပြင်',
    year: '1994',
    rating: 8.5,
    voteCount: 26834,
    runtime: 154,
    genres: ['Crime', 'Thriller', 'Drama'],
    overview: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper.",
    posterUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
    director: 'Quentin Tarantino',
    cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson', 'Bruce Willis'],
    tagline: "Just because you are a character doesn't mean you have character.",
  },
  {
    id: 238,
    title: 'The Godfather',
    titleTh: 'เดอะ ก็อดฟาเธอร์',
    titleMy: 'ဂော့ဖာသာ',
    year: '1972',
    rating: 8.7,
    voteCount: 19750,
    runtime: 175,
    genres: ['Crime', 'Drama'],
    overview: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael, steps in to take care of the would-be killers.",
    posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
    director: 'Francis Ford Coppola',
    cast: ['Marlon Brando', 'Al Pacino', 'James Caan', 'Robert Duvall'],
    tagline: "An offer you can't refuse.",
  },
  {
    id: 155,
    title: 'The Dark Knight',
    titleTh: 'แบทแมน อัศวินรัตติกาล',
    titleMy: 'မှောင်မိုက်အာဇာနည်',
    year: '2008',
    rating: 9.0,
    voteCount: 31756,
    runtime: 152,
    genres: ['Action', 'Crime', 'Drama', 'Thriller'],
    overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911BytUr46KnO1o.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5ez.jpg',
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine', 'Gary Oldman'],
    tagline: 'Why so serious?',
  },
  {
    id: 603,
    title: 'The Matrix',
    titleTh: 'เดอะ เมทริกซ์',
    titleMy: 'မက်ထရစ်',
    year: '1999',
    rating: 8.7,
    voteCount: 25081,
    runtime: 136,
    genres: ['Sci-Fi', 'Action'],
    overview: "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.",
    posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg',
    director: 'Lana Wachowski, Lilly Wachowski',
    cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss', 'Hugo Weaving'],
    tagline: 'Welcome to the Real World.',
  },
  {
    id: 569094,
    title: 'Spider-Man: Across the Spider-Verse',
    titleTh: 'สไปเดอร์-แมน ข้ามจักรวาลแมงมุม',
    titleMy: 'ပင့်ကူလူသား',
    year: '2023',
    rating: 8.4,
    voteCount: 6840,
    runtime: 140,
    genres: ['Animation', 'Action', 'Adventure'],
    overview: "After reuniting with Gwen Stacy, Brooklyn's full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse.",
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    director: 'Joaquim Dos Santos',
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
    tagline: "It's how you wear the mask that matters.",
  },
  {
    id: 786892,
    title: 'Furiosa: A Mad Max Saga',
    titleTh: 'ฟูริโอซ่า: มหาสงคราม แม็ด แม็กซ์',
    titleMy: 'ဖျူရီရိုဆာ',
    year: '2024',
    rating: 7.6,
    voteCount: 4230,
    runtime: 148,
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    overview: "As the world fell, young Furiosa is snatched from the Green Place of Many Mothers and falls into the hands of a great Biker Horde led by the Warlord Dementus.",
    posterUrl: 'https://image.tmdb.org/t/p/w500/iADOJ8Zymht2JPMoy3R7xceZprc.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/shrwC6U8Bkst9c9KKOlMSRCdHkG.jpg',
    director: 'George Miller',
    cast: ['Anya Taylor-Joy', 'Chris Hemsworth', 'Tom Burke'],
    tagline: 'Fury begins.',
  },
  {
    id: 1184918,
    title: 'The Wild Robot',
    titleTh: 'หุ่นยนต์ผจญภัยในป่าใหญ่',
    titleMy: 'တောရိုင်း ရိုဘော့',
    year: '2024',
    rating: 8.3,
    voteCount: 3890,
    runtime: 101,
    genres: ['Animation', 'Sci-Fi', 'Family'],
    overview: "After a shipwreck, an intelligent robot called Roz is stranded on an uninhabited island. To survive the harsh environment, Roz bonds with the island's animals and cares for an orphaned baby goose.",
    posterUrl: 'https://image.tmdb.org/t/p/w500/wTnV3PCVW5O92JMrFvvrRcV39RU.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/v9acaWVVFdZT5yAU7J2QjwfhXyD.jpg',
    director: 'Chris Sanders',
    cast: ['Lupita Nyong\'o', 'Pedro Pascal', 'Kit Connor'],
    tagline: 'Made for the wild.',
  },
  {
    id: 346698,
    title: 'Barbie',
    titleTh: 'บาร์บี้',
    titleMy: 'ဘာဘီ',
    year: '2023',
    rating: 7.0,
    voteCount: 8320,
    runtime: 114,
    genres: ['Comedy', 'Adventure', 'Fantasy'],
    overview: "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans.",
    posterUrl: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/barbie-backdrop.jpg',
    director: 'Greta Gerwig',
    cast: ['Margot Robbie', 'Ryan Gosling', 'America Ferrera', 'Will Ferrell'],
    tagline: 'She\'s everything. He\'s just Ken.',
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    titleTh: 'ออปเพนไฮเมอร์',
    titleMy: 'အိုပင်ဟိုင်းမား',
    year: '2023',
    rating: 8.1,
    voteCount: 9120,
    runtime: 180,
    genres: ['Drama', 'History', 'Thriller'],
    overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxe0Eo398aPg0Eld.jpg',
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Robert Downey Jr.', 'Matt Damon'],
    tagline: 'The world forever changes.',
  },
];

const streamingProviders: StreamingProvider[] = [
  { platform: 'Netflix', type: 'subscription', isFree: false, price: '฿419/mo', country: 'TH', logo: '🔴', url: 'https://www.netflix.com' },
  { platform: 'Disney+', type: 'subscription', isFree: false, price: '฿399/mo', country: 'TH', logo: '🔵', url: 'https://www.disneyplus.com' },
  { platform: 'TrueID', type: 'free', isFree: true, price: 'Free', country: 'TH', logo: '🟢', url: 'https://www.trueid.net' },
  { platform: 'WeTV', type: 'subscription', isFree: false, price: '฿59/mo', country: 'TH', logo: '🟡', url: 'https://wetv.vip' },
  { platform: 'Viu', type: 'free', isFree: true, price: 'Free (with ads)', country: 'TH', logo: '🟣', url: 'https://www.viu.com' },
  { platform: 'iQIYI', type: 'subscription', isFree: false, price: '฿119/mo', country: 'TH', logo: '🟤', url: 'https://www.iq.com' },
  { platform: 'AIS Play', type: 'subscription', isFree: false, price: '฿199/mo', country: 'TH', logo: '🟠', url: 'https://aisplay.ais.co.th' },
  { platform: 'YouTube', type: 'rent', isFree: false, price: '฿139', country: 'TH', logo: '▶️', url: 'https://www.youtube.com' },
];

const freeDownloadSites = [
  { name: 'YTS', url: 'https://yts.mx', type: 'Torrent', quality: '720p-4K' },
  { name: '1337x', url: 'https://1337x.to', type: 'Torrent', quality: 'Various' },
  { name: 'RARBG', url: 'https://rarbg.to', type: 'Torrent', quality: '720p-4K' },
  { name: 'FMovies', url: 'https://fmovies.to', type: 'Stream', quality: 'HD' },
  { name: 'Soap2Day', url: 'https://soap2day.to', type: 'Stream', quality: 'HD' },
];

export { freeDownloadSites };

const suggestions: Record<Language, string[]> = {
  en: [
    'Where can I watch this in Thailand?',
    'Are Thai subtitles available?',
    'Show me similar movies',
    'Is it free to watch?',
    'Show me the trailer',
    'Who directed this movie?',
  ],
  th: [
    'ดูได้ที่ไหนในไทย?',
    'มีซับไทยไหม?',
    'แนะนำหนังคล้ายๆ',
    'ดูฟรีได้ไหม?',
    'ดูตัวอย่างหน่อย',
    'ใครกำกับหนังเรื่องนี้?',
  ],
  my: [
    'ထိုင်းမှာ ဘယ်မှာကြည့်လို့ရလဲ?',
    'ထိုင်းစာတန်းထိုးရှိလား?',
    'ဆင်တူရုပ်ရှင်ပြပါ',
    'အခမဲ့ကြည့်လို့ရလား?',
    'ကြိုတင်ကြည့်ခွင့်ပြပါ',
    'ဒီရုပ်ရှင်ကို ဘယ်သူဒါရိုက်လုပ်လဲ?',
  ],
};

function detectUrl(text: string): boolean {
  return /https?:\/\//i.test(text) || /tiktok|facebook|instagram|youtube|fb\.watch/i.test(text);
}

function getRandomMovie(): Movie {
  return mockMovies[Math.floor(Math.random() * mockMovies.length)];
}

function getRandomStreamingProviders(): StreamingProvider[] {
  const count = 2 + Math.floor(Math.random() * 3);
  const shuffled = [...streamingProviders].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function generateAIResponse(
  userMessage: string,
  language: Language
): {
  reply: string;
  movie?: Movie;
  streaming?: StreamingProvider[];
  suggestions: string[];
} {
  const isUrl = detectUrl(userMessage);
  const movie = getRandomMovie();
  const streaming = getRandomStreamingProviders();

  if (isUrl) {
    const replies: Record<Language, string> = {
      en: `🎬 **I found it!** This is **${movie.title} (${movie.year})**!\n\nDirected by ${movie.director}, this ${movie.genres.join('/')} movie has a rating of ⭐ ${movie.rating}/10.\n\n📝 *${movie.overview}*\n\n🎭 **Cast:** ${movie.cast?.join(', ')}\n\n${movie.tagline ? `💬 "${movie.tagline}"` : ''}`,
      th: `🎬 **เจอแล้ว!** นี่คือ **${movie.title} (${movie.year})**!\n\nกำกับโดย ${movie.director} หนัง${movie.genres.join('/')}เรื่องนี้ได้คะแนน ⭐ ${movie.rating}/10\n\n📝 *${movie.overviewTh || movie.overview}*\n\n🎭 **นักแสดง:** ${movie.cast?.join(', ')}\n\n${movie.tagline ? `💬 "${movie.tagline}"` : ''}`,
      my: `🎬 **ရှာတွေ့ပါပြီ!** ဒါက **${movie.title} (${movie.year})** ဖြစ်ပါတယ်!\n\nဒါရိုက်တာ ${movie.director}၊ ဒီ ${movie.genres.join('/')} ရုပ်ရှင်သည် ⭐ ${movie.rating}/10 ရမှတ်ရရှိပါသည်။\n\n📝 *${movie.overview}*\n\n🎭 **မင်းသား/သမီး:** ${movie.cast?.join(', ')}`,
    };

    return {
      reply: replies[language],
      movie,
      streaming,
      suggestions: suggestions[language].slice(0, 4),
    };
  }

  // Text-based queries
  const lowerMsg = userMessage.toLowerCase();

  if (lowerMsg.includes('dream') || lowerMsg.includes('ฝัน') || lowerMsg.includes('အိပ်မက်')) {
    const inception = mockMovies.find((m) => m.id === 27205)!;
    const replies: Record<Language, string> = {
      en: `🎬 Based on your description, I think this could be **Inception (2010)**!\n\nA thief who enters people's dreams — directed by Christopher Nolan and starring Leonardo DiCaprio.\n\n⭐ Rating: ${inception.rating}/10\n🎭 Genre: ${inception.genres.join(', ')}\n⏱️ Runtime: ${inception.runtime} minutes`,
      th: `🎬 จากคำอธิบายของคุณ ฉันคิดว่านี่น่าจะเป็น **Inception (จิตพิฆาตโลก) (2010)**!\n\nหัวขโมยที่เข้าไปในความฝันของคน กำกับโดย Christopher Nolan นำแสดงโดย Leonardo DiCaprio\n\n⭐ คะแนน: ${inception.rating}/10\n🎭 ประเภท: Sci-Fi, Action, Thriller\n⏱️ ความยาว: ${inception.runtime} นาที`,
      my: `🎬 သင့်ဖော်ပြချက်အရ ဒါက **Inception (2010)** ဖြစ်နိုင်ပါတယ်!\n\nလူတွေရဲ့ အိပ်မက်ထဲ ဝင်ရောက်သော သူခိုး — Christopher Nolan ဒါရိုက်တာနှင့် Leonardo DiCaprio ပါဝင်။\n\n⭐ အဆင့်: ${inception.rating}/10`,
    };

    return {
      reply: replies[language],
      movie: inception,
      streaming: getRandomStreamingProviders(),
      suggestions: suggestions[language].slice(0, 4),
    };
  }

  if (lowerMsg.includes('space') || lowerMsg.includes('อวกาศ') || lowerMsg.includes('star') || lowerMsg.includes('wormhole')) {
    const interstellar = mockMovies.find((m) => m.id === 157336)!;
    const replies: Record<Language, string> = {
      en: `🎬 This sounds like **Interstellar (2014)**!\n\nA group of explorers travel through a wormhole in space — directed by Christopher Nolan.\n\n⭐ Rating: ${interstellar.rating}/10\n⏱️ Runtime: ${interstellar.runtime} minutes\n\n💬 "${interstellar.tagline}"`,
      th: `🎬 นี่น่าจะเป็น **Interstellar (ทะยานดาวกู้โลก) (2014)**!\n\nกลุ่มนักสำรวจเดินทางผ่านหลุมหนอนในอวกาศ กำกับโดย Christopher Nolan\n\n⭐ คะแนน: ${interstellar.rating}/10\n⏱️ ความยาว: ${interstellar.runtime} นาที`,
      my: `🎬 ဒါက **Interstellar (2014)** နှင့်တူပါတယ်!\n\nအာကာသထဲ wormhole မှတဆင့် ခရီးသွားသော စူးစမ်းသူအဖွဲ့ — Christopher Nolan ဒါရိုက်တာ။\n\n⭐ အဆင့်: ${interstellar.rating}/10`,
    };

    return {
      reply: replies[language],
      movie: interstellar,
      streaming: getRandomStreamingProviders(),
      suggestions: suggestions[language].slice(0, 4),
    };
  }

  // Generic movie response
  const replies: Record<Language, string> = {
    en: `🤔 Based on your description, I think this might be **${movie.title} (${movie.year})**!\n\n⭐ Rating: ${movie.rating}/10\n🎭 Genre: ${movie.genres.join(', ')}\n🎬 Director: ${movie.director}\n⏱️ Runtime: ${movie.runtime} minutes\n\n📝 *${movie.overview}*\n\nIs this the movie you're looking for? If not, try giving me more details about the scene you saw!`,
    th: `🤔 จากคำอธิบายของคุณ ฉันคิดว่านี่อาจเป็น **${movie.title} (${movie.year})**!\n\n⭐ คะแนน: ${movie.rating}/10\n🎭 ประเภท: ${movie.genres.join(', ')}\n🎬 ผู้กำกับ: ${movie.director}\n⏱️ ความยาว: ${movie.runtime} นาที\n\n📝 *${movie.overviewTh || movie.overview}*\n\nนี่ใช่หนังที่คุณหาอยู่ไหม? ถ้าไม่ใช่ ลองให้รายละเอียดเพิ่มเติมเกี่ยวกับฉากที่คุณเห็นนะคะ!`,
    my: `🤔 သင့်ဖော်ပြချက်အရ ဒါက **${movie.title} (${movie.year})** ဖြစ်နိုင်ပါတယ်!\n\n⭐ အဆင့်: ${movie.rating}/10\n🎭 အမျိုးအစား: ${movie.genres.join(', ')}\n🎬 ဒါရိုက်တာ: ${movie.director}\n⏱️ ကြာချိန်: ${movie.runtime} မိနစ်\n\n📝 *${movie.overview}*\n\nဒါ သင်ရှာနေတဲ့ ရုပ်ရှင်ဟုတ်ပါသလား? မဟုတ်ရင် သင်မြင်ခဲ့တဲ့ ဇာတ်ကွက်အကြောင်း အသေးစိတ်ပိုပြောပြပါ!`,
  };

  return {
    reply: replies[language],
    movie,
    streaming: getRandomStreamingProviders(),
    suggestions: suggestions[language].slice(0, 4),
  };
}
