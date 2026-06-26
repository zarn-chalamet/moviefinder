// Export all services
export { default as api } from './api';
export { default as chatService } from './chatService';
export { default as movieService } from './movieService';

// Export types
export type {
  ApiResponse,
  PaginatedResponse,
} from './api';

export type {
  SendMessageRequest,
  SendMessageResponse,
  AnalyzeUrlRequest,
  AnalyzeUrlResponse,
  AnalyzeImageRequest,
} from './chatService';

export type {
  SearchMoviesParams,
  MovieDetailsResponse,
  SubtitleInfo,
  TrailerInfo,
  StreamingParams,
} from './movieService';
