import api, { ApiResponse, PaginatedResponse } from './api';
import config from '../config';
import { Movie, StreamingProvider, Language } from '../types';
import { mockMovies } from '../data/mockData';

// ============================================
// Types
// ============================================

export interface SearchMoviesParams {
  query: string;
  language?: Language;
  page?: number;
  limit?: number;
}

export interface MovieDetailsResponse {
  movie: Movie;
  streaming: StreamingProvider[];
  subtitles: SubtitleInfo[];
  trailer: TrailerInfo | null;
  similar: Movie[];
}

export interface SubtitleInfo {
  language: string;
  languageCode: string;
  format: string;
  downloadUrl: string;
  source: string;
}

export interface TrailerInfo {
  key: string;
  name: string;
  site: string;
  url: string;
}

export interface StreamingParams {
  movieId: number;
  country?: string;
}

// ============================================
// Movie Service
// ============================================

export const movieService = {
  /**
   * Search movies by query
   */
  async searchMovies(params: SearchMoviesParams): Promise<Movie[]> {
    if (config.USE_MOCK_API) {
      return this.mockSearchMovies(params);
    }

    const response = await api.get<PaginatedResponse<Movie>>('/movies/search', {
      params: {
        q: params.query,
        lang: params.language || 'en',
        page: params.page || 1,
        limit: params.limit || 20,
      },
    });
    return response.data.data;
  },

  /**
   * Get movie details by ID
   */
  async getMovieById(id: number, language?: Language): Promise<MovieDetailsResponse> {
    if (config.USE_MOCK_API) {
      return this.mockGetMovieById(id, language);
    }

    const response = await api.get<ApiResponse<MovieDetailsResponse>>(
      `/movies/${id}`,
      {
        params: { lang: language || 'en' },
      }
    );
    return response.data.data;
  },

  /**
   * Get streaming providers for a movie
   */
  async getStreamingProviders(params: StreamingParams): Promise<StreamingProvider[]> {
    if (config.USE_MOCK_API) {
      return this.mockGetStreamingProviders(params);
    }

    const response = await api.get<ApiResponse<StreamingProvider[]>>(
      `/movies/${params.movieId}/streaming`,
      {
        params: { country: params.country || 'TH' },
      }
    );
    return response.data.data;
  },

  /**
   * Get subtitles for a movie
   */
  async getSubtitles(movieId: number, language?: string): Promise<SubtitleInfo[]> {
    if (config.USE_MOCK_API) {
      return this.mockGetSubtitles(movieId);
    }

    const response = await api.get<ApiResponse<SubtitleInfo[]>>(
      `/movies/${movieId}/subtitles`,
      {
        params: { lang: language },
      }
    );
    return response.data.data;
  },

  /**
   * Get trending movies
   */
  async getTrendingMovies(language?: Language): Promise<Movie[]> {
    if (config.USE_MOCK_API) {
      return this.mockGetTrendingMovies();
    }

    const response = await api.get<ApiResponse<Movie[]>>('/movies/trending', {
      params: { lang: language || 'en' },
    });
    return response.data.data;
  },

  /**
   * Get similar movies
   */
  async getSimilarMovies(movieId: number, limit?: number): Promise<Movie[]> {
    if (config.USE_MOCK_API) {
      return this.mockGetSimilarMovies(movieId, limit);
    }

    const response = await api.get<ApiResponse<Movie[]>>(
      `/movies/${movieId}/similar`,
      {
        params: { limit: limit || 6 },
      }
    );
    return response.data.data;
  },

  // ============================================
  // Mock Implementations
  // ============================================

  async mockSearchMovies(params: SearchMoviesParams): Promise<Movie[]> {
    await this.delay(500);
    
    const query = params.query.toLowerCase();
    return mockMovies.filter(
      (m) =>
        m.title.toLowerCase().includes(query) ||
        m.genres.some((g) => g.toLowerCase().includes(query)) ||
        m.director?.toLowerCase().includes(query) ||
        m.cast?.some((c) => c.toLowerCase().includes(query))
    );
  },

  async mockGetMovieById(id: number, _language?: Language): Promise<MovieDetailsResponse> {
    await this.delay(300);

    const movie = mockMovies.find((m) => m.id === id);
    if (!movie) {
      throw new Error('Movie not found');
    }

    return {
      movie,
      streaming: this.generateMockStreaming(movie.title),
      subtitles: this.generateMockSubtitles(movie.title),
      trailer: {
        key: 'dQw4w9WgXcQ', // Placeholder
        name: `${movie.title} - Official Trailer`,
        site: 'YouTube',
        url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
      },
      similar: mockMovies.filter((m) => m.id !== id).slice(0, 4),
    };
  },

  async mockGetStreamingProviders(_params: StreamingParams): Promise<StreamingProvider[]> {
    await this.delay(200);
    return this.generateMockStreaming('movie');
  },

  async mockGetSubtitles(movieId: number): Promise<SubtitleInfo[]> {
    await this.delay(200);
    const movie = mockMovies.find((m) => m.id === movieId);
    return this.generateMockSubtitles(movie?.title || 'movie');
  },

  async mockGetTrendingMovies(): Promise<Movie[]> {
    await this.delay(400);
    return mockMovies;
  },

  async mockGetSimilarMovies(movieId: number, limit: number = 4): Promise<Movie[]> {
    await this.delay(300);
    return mockMovies.filter((m) => m.id !== movieId).slice(0, limit);
  },

  // Helper: Generate mock streaming providers
  generateMockStreaming(movieTitle: string): StreamingProvider[] {
    const encodedTitle = encodeURIComponent(movieTitle);
    return [
      {
        platform: 'Netflix',
        type: 'subscription',
        isFree: false,
        price: '฿419/mo',
        country: 'TH',
        logo: '🔴',
        url: `https://www.netflix.com/search?q=${encodedTitle}`,
      },
      {
        platform: 'TrueID',
        type: 'free',
        isFree: true,
        price: 'Free',
        country: 'TH',
        logo: '🟢',
        url: `https://www.trueid.net/search?q=${encodedTitle}`,
      },
      {
        platform: 'Disney+',
        type: 'subscription',
        isFree: false,
        price: '฿399/mo',
        country: 'TH',
        logo: '🔵',
        url: `https://www.disneyplus.com/search?q=${encodedTitle}`,
      },
    ];
  },

  // Helper: Generate mock subtitles
  generateMockSubtitles(movieTitle: string): SubtitleInfo[] {
    const encodedTitle = encodeURIComponent(movieTitle);
    return [
      {
        language: '🇹🇭 Thai',
        languageCode: 'th',
        format: '.srt',
        downloadUrl: `https://subscene.com/subtitles/searchbytitle?query=${encodedTitle}`,
        source: 'Subscene',
      },
      {
        language: '🇲🇲 Burmese',
        languageCode: 'my',
        format: '.srt',
        downloadUrl: `https://subscene.com/subtitles/searchbytitle?query=${encodedTitle}`,
        source: 'Subscene',
      },
      {
        language: '🇬🇧 English',
        languageCode: 'en',
        format: '.srt',
        downloadUrl: `https://opensubtitles.org/en/search/sublanguageid-eng/moviename-${encodedTitle}`,
        source: 'OpenSubtitles',
      },
    ];
  },

  // Utility
  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
};

export default movieService;
