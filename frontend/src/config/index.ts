// App Configuration
// Set USE_MOCK_API to false when backend is ready

export const config = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  
  // Set to false when backend is ready
  USE_MOCK_API: true,
  
  // API Timeout (ms)
  API_TIMEOUT: 30000,
  
  // App Info
  APP_NAME: 'MovieFinder',
  APP_VERSION: '1.0.0',
  
  // Supported Languages
  LANGUAGES: ['en', 'th', 'my'] as const,
  DEFAULT_LANGUAGE: 'en',
  
  // External Links
  EXTERNAL_LINKS: {
    TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p',
    YOUTUBE_WATCH: 'https://www.youtube.com/watch?v=',
    YOUTUBE_SEARCH: 'https://www.youtube.com/results?search_query=',
  },
  
  // LocalStorage Keys
  STORAGE_KEYS: {
    LANGUAGE: 'moviefinder-lang',
    SAVED_MOVIES: 'moviefinder-saved',
    CHAT_HISTORY: 'moviefinder-chat-history',
  },
};

export default config;
