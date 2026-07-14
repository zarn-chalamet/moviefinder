import { create } from 'zustand';
import { Language, ChatMessage, WatchlistItem, Movie } from '../types';
import translations from '../i18n/translations';
import { movieService } from '../services/movieService';
import { chatService } from '../services/chatService';
import config from '../config';

// Helper function: Find the most recent movie discussed in chat
// Used for follow-up questions like "Show me similar movies"
// Without this, backend has no idea which movie the user is asking about
function getLastMovieContext(messages: ChatMessage[]): Movie | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === 'assistant' && msg.movieContext) {
      return msg.movieContext;
    }
  }
  return null;
}

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
  retryMessage: (messageId: string) => Promise<void>;
  clearChat: () => void;
  startNewChat: () => void;

  // Movie Detail
  selectedMovie: Movie | null;
  setSelectedMovie: (movie: Movie | null) => void;

  // Saved Movies
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

  // Error
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Confirmation Dialog
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
  };
  showConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirmDialog: () => void;
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
    const { language, messages } = get();

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

    const history = messages.map((m): { role: 'user' | 'model'; content: string } => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      content: m.content
    }));

    // Find the most recent movie discussed in conversation
    // This enables follow-up questions like "similar movies" to work
    const lastMovieContext = getLastMovieContext(messages);
    
    if (lastMovieContext) {
      console.log('Sending with movie context:', lastMovieContext.title);
    }

    try {
      const response = await chatService.sendMessage({
        message: content,
        language,
        conversationId: null,
        movieContext: lastMovieContext,
        history: history.length > 0 ? history : undefined
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date(),
        movieContext: response.movieContext,
        candidates: response.candidates,
        streamingInfo: response.streamingInfo,
        suggestions: response.suggestions,
        analysisMethod: response.analysisMethod,
        processingMessage: response.processingMessage,
        confidenceScore: response.confidenceScore,
        confidenceLevel: response.confidenceLevel,
        contentType: response.contentType,
        isChineseShortDrama: response.isChineseShortDrama,
        chineseShortDramaInfo: response.chineseShortDramaInfo,
        originalUserMessage: content,
      };

      set((state) => ({
        messages: [...state.messages, aiMessage],
        isTyping: false,
      }));

    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Something went wrong while processing your request. Please try again or check if the video is accessible.',
        timestamp: new Date(),
        isError: true,
        originalUserMessage: content,
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
        isTyping: false,
        error: 'Failed to send message',
      }));
    }
  },

  retryMessage: async (messageId) => {
    const { messages, sendMessage } = get();
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    
    if (messageIndex === -1) return;
    
    const message = messages[messageIndex];
    const originalContent = message.originalUserMessage;
    
    if (!originalContent) return;

    // Remove the message we're retrying
    set((state) => ({
      messages: state.messages.filter((_, idx) => idx !== messageIndex),
    }));

    // Also remove the user message just before it if it matches
    const prevMessage = messages[messageIndex - 1];
    if (prevMessage && prevMessage.role === 'user' && prevMessage.content === originalContent) {
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== prevMessage.id),
      }));
    }

    // Send again
    await sendMessage(originalContent);
  },

  clearChat: () => set({ messages: [], error: null }),

  startNewChat: () => {
    set({ 
      messages: [], 
      error: null,
      isTyping: false,
    });
  },

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
      // Use tmdbId if available, fallback to id
      const movieKey = movie.tmdbId || movie.id;
      
      if (state.savedMovies.some((item) => (item.movie.tmdbId || item.movie.id) === movieKey)) {
        return state;
      }

      const newItem: WatchlistItem = {
        id: String(movieKey),
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
      const newSavedMovies = state.savedMovies.filter((item) => {
        const itemKey = item.movie.tmdbId || item.movie.id;
        return itemKey !== movieId;
      });
      localStorage.setItem(config.STORAGE_KEYS.SAVED_MOVIES, JSON.stringify(newSavedMovies));
      return { savedMovies: newSavedMovies };
    });
  },

  isMovieSaved: (movieId) => {
    return get().savedMovies.some((item) => {
      const itemKey = item.movie.tmdbId || item.movie.id;
      return itemKey === movieId;
    });
  },
  // ============================================
  // Trending
  // ============================================
  trendingMovies: [],
  isTrendingLoading: false,

  loadTrendingMovies: async () => {
    const { language } = get();
    set({ isTrendingLoading: true });

    try {
      const movies = await movieService.getTrendingMovies(language);
      set({ trendingMovies: movies, isTrendingLoading: false });
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
  // Error
  // ============================================
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // ============================================
  // Confirm Dialog
  // ============================================
  confirmDialog: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  },
  
  showConfirmDialog: (title, message, onConfirm) => {
    set({
      confirmDialog: {
        isOpen: true,
        title,
        message,
        onConfirm,
      },
    });
  },
  
  closeConfirmDialog: () => {
    set({
      confirmDialog: {
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
      },
    });
  },
}));

export const useLanguage = () => useAppStore((state) => state.language);
export const useTranslation = () => useAppStore((state) => state.t);
export const useCurrentPage = () => useAppStore((state) => state.currentPage);
export const useSavedMoviesCount = () => useAppStore((state) => state.savedMovies.length);

export default useAppStore;