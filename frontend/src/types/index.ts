export type Language = 'en' | 'th' | 'my';

export type ConfidenceLevel = 'CERTAIN' | 'LIKELY' | 'UNCERTAIN' | 'UNKNOWN';

export type ContentType = 
  | 'RECAP_VIDEO' 
  | 'SCENE_CLIP' 
  | 'TRAILER' 
  | 'CHINESE_SHORT_DRAMA' 
  | 'ANIME' 
  | 'UNKNOWN';

export type AnalysisMethod = 
  | 'hashtag' 
  | 'explicit_title' 
  | 'metadata_ai' 
  | 'recap_match' 
  | 'recap_candidates'
  | 'audio_narration' 
  | 'vision' 
  | 'vision_only'
  | 'vision_candidates'
  | 'vision_high'
  | 'vision_unknown'
  | 'classification' 
  | 'similar_movies'
  | 'failed' 
  | 'error'
  | 'text';

export interface Movie {
  id: number;
  tmdbId?: number;
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
  matchScore?: number;
  matchReason?: string;
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
  candidates?: Movie[] | null;
  streamingInfo?: StreamingProvider[];
  suggestions?: string[];
  isTyping?: boolean;
  isError?: boolean;
  analysisMethod?: AnalysisMethod;
  processingMessage?: string;
  confidenceScore?: number;
  confidenceLevel?: ConfidenceLevel;
  contentType?: ContentType;
  isChineseShortDrama?: boolean;
  chineseShortDramaInfo?: string;
  originalUserMessage?: string; // For retry functionality
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