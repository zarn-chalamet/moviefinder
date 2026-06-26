export type Language = 'en' | 'th' | 'my';

export interface Movie {
  id: number;
  title: string;
  titleTh?: string;
  titleMy?: string;
  originalTitle?: string;
  year: string;
  rating: number;
  voteCount: number;
  runtime: number;
  genres: string[];
  overview: string;
  overviewTh?: string;
  overviewMy?: string;
  posterUrl: string;
  backdropUrl: string;
  director?: string;
  cast?: string[];
  tagline?: string;
}

export interface StreamingProvider {
  platform: string;
  type: 'subscription' | 'free' | 'rent' | 'buy';
  isFree: boolean;
  price: string;
  country: string;
  logo: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  movieContext?: Movie | null;
  streamingInfo?: StreamingProvider[];
  suggestions?: string[];
  isTyping?: boolean;
}

export interface WatchlistItem {
  id: string;
  movie: Movie;
  addedAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
