// ============================================
// Curated Streaming Sources
// All entries manually verified
// ============================================

export interface WatchSource {
  name: string;
  baseUrl: string;
  searchUrlTemplate: string;
  icon: string;
  description: string;
  region: 'mm' | 'th' | 'global';
}

// Telegram channels come in different types:
// - public: Regular @username channel (t.me/username)
// - invite: Private channel with invite link (t.me/+HASH)
// - post: Link to specific post (t.me/username/12345)
export type TelegramChannelType = 'public' | 'invite' | 'post';

export interface TelegramChannel {
  name: string;
  url: string;              // Full URL as provided
  type: TelegramChannelType;
  username?: string;        // Only for public channels (used for search)
  postId?: string;          // Only for post-type links
  inviteHash?: string;      // Only for invite-type links
  description: string;
  category: 'general' | 'korean' | 'chinese' | 'thai' | 'anime' | 'hollywood' | 'series';
}

// ============================================
// Myanmar Free Movie Sites (VERIFIED URLs)
// ============================================
export const MM_SOURCES: WatchSource[] = [
  {
    name: 'HomieTV',
    baseUrl: 'https://www.homietv.com',
    searchUrlTemplate: 'https://www.homietv.com/search?keyword={query}',
    icon: '📽️',
    description: 'MM streaming site',
    region: 'mm',
  },
  {
    name: 'MMSub Channel',
    baseUrl: 'https://mmsubchannel.com',
    searchUrlTemplate: 'https://mmsubchannel.com/?search={query}',
    icon: '🎞️',
    description: 'Myanmar TV & movies',
    region: 'mm',
  },
  {
    name: 'MMSub Movie',
    baseUrl: 'https://mmsubmovie.com',
    searchUrlTemplate: 'https://mmsubmovie.com/?s={query}',
    icon: '📺',
    description: 'Myanmar subtitle films',
    region: 'mm',
  },
];

// ============================================
// Thai Free/Legal Streaming Sites
// ============================================
export const TH_SOURCES: WatchSource[] = [
  {
    name: 'TrueID',
    baseUrl: 'https://trueid.net',
    searchUrlTemplate: 'https://trueid.net/search?keyword={query}',
    icon: '🟢',
    description: 'Free with ads (Thailand)',
    region: 'th',
  },
  {
    name: 'Viu Thailand',
    baseUrl: 'https://www.viu.com/ott/th',
    searchUrlTemplate: 'https://www.viu.com/ott/th/th/search?query={query}',
    icon: '🟣',
    description: 'Asian dramas & movies',
    region: 'th',
  },
  {
    name: 'MonoMax',
    baseUrl: 'https://monomax.me',
    searchUrlTemplate: 'https://monomax.me/search?q={query}',
    icon: '🎥',
    description: 'Thai movies platform',
    region: 'th',
  },
];

// ============================================
// Global/English Free Sites
// ============================================
export const EN_SOURCES: WatchSource[] = [
  {
    name: 'Tubi TV',
    baseUrl: 'https://tubitv.com',
    searchUrlTemplate: 'https://tubitv.com/search/{query}',
    icon: '🟠',
    description: 'Free legal streaming',
    region: 'global',
  },
  {
    name: 'Pluto TV',
    baseUrl: 'https://pluto.tv',
    searchUrlTemplate: 'https://pluto.tv/en/search/{query}',
    icon: '🔷',
    description: 'Free with ads',
    region: 'global',
  },
];

// ============================================
// Verified Telegram Channels (from user)
// ============================================
export const MM_TELEGRAM_CHANNELS: TelegramChannel[] = [
  {
    name: 'One For All',
    url: 'https://telegram.me/+1Ok8MoLhCPU1Njc1',
    type: 'invite',
    inviteHash: '1Ok8MoLhCPU1Njc1',
    description: '🎥 English movies channel',
    category: 'hollywood',
  },
  {
    name: 'Happy Ent Series List',
    url: 'https://telegram.me/vipserieslist22',
    type: 'public',
    username: 'vipserieslist22',
    description: 'Netflix, HBO, Prime & Disney+ movies and series',
    category: 'series',
  },
  {
    name: 'Channel X Cinema',
    url: 'https://telegram.me/Channel_X_Cinema/15241',
    type: 'public',
    username: 'Channel_X_Cinema',
    description: 'International movies & series collection',
    category: 'general',
  },
  {
    name: 'Happy Channel',
    url: 'https://telegram.me/happychannelmm',
    type: 'public',
    username: 'happychannelmm',
    description: 'Movies & series with Myanmar subtitles',
    category: 'general',
  },
  {
    name: 'All K-Drama Collection',
    url: 'https://telegram.me/+47fo7HCTQZMzMTRl',
    type: 'invite',
    inviteHash: '47fo7HCTQZMzMTRl',
    description: 'Complete Korean drama series collection',
    category: 'korean',
  },
];

// ============================================
// Helper Functions
// ============================================

/**
 * Build search URL for a website source
 */
export function buildSearchUrl(source: WatchSource, movieTitle: string): string {
  const encoded = encodeURIComponent(movieTitle);
  return source.searchUrlTemplate.replace('{query}', encoded);
}

/**
 * Get URL to open a Telegram channel
 * Works for all channel types - just opens the channel directly
 */
export function getTelegramChannelUrl(channel: TelegramChannel): string {
  return channel.url;
}

/**
 * Filter Telegram channels by content type
 */
export function getRelevantTelegramChannels(
  originalLanguage?: string,
  genres?: string[]
): TelegramChannel[] {
  const lang = originalLanguage?.toLowerCase();
  const genresLower = genres?.map((g) => g.toLowerCase()) || [];

  const relevant: TelegramChannel[] = [];

  // Always show general and series channels
  relevant.push(
    ...MM_TELEGRAM_CHANNELS.filter(
      (c) => c.category === 'general' || c.category === 'series'
    )
  );

  // Korean content
  if (lang === 'ko' || lang === 'korean') {
    relevant.push(
      ...MM_TELEGRAM_CHANNELS.filter((c) => c.category === 'korean')
    );
  }

  // English/Hollywood content
  if (lang === 'en' || lang === 'english' || !lang) {
    relevant.push(
      ...MM_TELEGRAM_CHANNELS.filter((c) => c.category === 'hollywood')
    );
  }

  // Chinese content
  if (lang === 'zh' || lang === 'chinese' || lang === 'cn') {
    relevant.push(
      ...MM_TELEGRAM_CHANNELS.filter((c) => c.category === 'chinese')
    );
  }

  // Thai content
  if (lang === 'th' || lang === 'thai') {
    relevant.push(
      ...MM_TELEGRAM_CHANNELS.filter((c) => c.category === 'thai')
    );
  }

  // Anime content
  if (genresLower.some((g) => g.includes('animation'))) {
    relevant.push(
      ...MM_TELEGRAM_CHANNELS.filter((c) => c.category === 'anime')
    );
  }

  // If nothing matched, show all channels
  if (relevant.length === 0) {
    return MM_TELEGRAM_CHANNELS;
  }

  // Remove duplicates by URL
  const unique = Array.from(
    new Map(relevant.map((c) => [c.url, c])).values()
  );
  return unique;
}