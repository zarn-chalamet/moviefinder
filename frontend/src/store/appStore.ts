import { create } from 'zustand';
import { Language, ChatMessage, WatchlistItem, Movie } from '../types';
import translations from '../i18n/translations';
import { mockMovies } from '../data/mockData';
import { chatService } from '../services/chatService';
import config from '../config';

interface AppState {
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;

  // Navigation
  currentPage: 'home' | 'chat' | 'trending' | 'watchlist' | 'about' | 'movie-detail';
  setCurrentPage: (page: AppState['currentPage']) => void;

  // Chat
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;

  // Movie Detail
  selectedMovie: Movie | null;
  setSelectedMovie: (movie: Movie | null) => void;

  // Saved Movies (Watchlist)
  savedMovies: WatchlistItem[];
  addToSaved: (movie: Movie) => void;
  removeFromSaved: (movieId: number) => void;
  isMovieSaved: (movieId: number) => boolean;

  // Trending
  trendingMovies: Movie[];
  loadTrendingMovies: () => Promise<void>;
  isTrendingLoading: boolean;

  // Mobile menu
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const useAppStore = create<AppState>((set, get) => ({
  // ============================================
  // Language
  // ============================================
  language: (localStorage.getItem(config.STORAGE_KEYS.LANGUAGE) as Language) || config.DEFAULT_LANGUAGE,
  
  setLanguage: (lang) => {
    localStorage.setItem(config.STORAGE_KEYS.LANGUAGE, lang);
    set({ language: lang });
  },
  
  t: (key) => {
    const { language } = get();
    return translations[language]?.[key] || translations.en[key] || key;
  },

  // ============================================
  // Navigation
  // ============================================
  currentPage: 'home',
  
  setCurrentPage: (page) => {
    set({ currentPage: page, isMobileMenuOpen: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ============================================
  // Chat
  // ============================================
  messages: [],
  isTyping: false,

  sendMessage: async (content) => {
    const { language } = get();

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isTyping: true,
      error: null,
    }));

    try {
      // Call chat service (mock or real API)
      const response = await chatService.sendMessage({
        message: content,
        language,
        conversationId: null,
        movieContext: null,
      });

      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date(),
        movieContext: response.movieContext,
        streamingInfo: response.streamingInfo,
        suggestions: response.suggestions,
      };

      set((state) => ({
        messages: [...state.messages, aiMessage],
        isTyping: false,
      }));

    } catch (error) {
      console.error('Chat error:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
        isTyping: false,
        error: 'Failed to send message',
      }));
    }
  },

  clearChat: () => set({ messages: [], error: null }),

  // ============================================
  // Movie Detail
  // ============================================
  selectedMovie: null,
  setSelectedMovie: (movie) => set({ selectedMovie: movie }),

  // ============================================
  // Saved Movies
  // ============================================
  savedMovies: JSON.parse(localStorage.getItem(config.STORAGE_KEYS.SAVED_MOVIES) || '[]'),

  addToSaved: (movie) => {
    set((state) => {
      // Check if already saved
      if (state.savedMovies.some((item) => item.movie.id === movie.id)) {
        return state;
      }

      const newItem: WatchlistItem = {
        id: movie.id.toString(),
        movie,
        addedAt: new Date(),
      };
      const newSavedMovies = [...state.savedMovies, newItem];
      localStorage.setItem(config.STORAGE_KEYS.SAVED_MOVIES, JSON.stringify(newSavedMovies));
      return { savedMovies: newSavedMovies };
    });
  },

  removeFromSaved: (movieId) => {
    set((state) => {
      const newSavedMovies = state.savedMovies.filter((item) => item.movie.id !== movieId);
      localStorage.setItem(config.STORAGE_KEYS.SAVED_MOVIES, JSON.stringify(newSavedMovies));
      return { savedMovies: newSavedMovies };
    });
  },

  isMovieSaved: (movieId) => {
    return get().savedMovies.some((item) => item.movie.id === movieId);
  },

  // ============================================
  // Trending
  // ============================================
  trendingMovies: mockMovies, // Initial mock data
  isTrendingLoading: false,

  loadTrendingMovies: async () => {
    set({ isTrendingLoading: true });

    try {
      // For now, use mock data
      // When backend is ready, replace with:
      // const movies = await movieService.getTrendingMovies(get().language);
      
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate loading
      set({ trendingMovies: mockMovies, isTrendingLoading: false });

    } catch (error) {
      console.error('Failed to load trending movies:', error);
      set({ isTrendingLoading: false, error: 'Failed to load trending movies' });
    }
  },

  // ============================================
  // Mobile Menu
  // ============================================
  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

  // ============================================
  // Error Handling
  // ============================================
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

// ============================================
// Selectors (for optimized re-renders)
// ============================================
export const useLanguage = () => useAppStore((state) => state.language);
export const useTranslation = () => useAppStore((state) => state.t);
export const useCurrentPage = () => useAppStore((state) => state.currentPage);
export const useSavedMoviesCount = () => useAppStore((state) => state.savedMovies.length);

export default useAppStore;
