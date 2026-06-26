import api, { ApiResponse } from './api';
import config from '../config';
import { Movie, StreamingProvider, Language } from '../types';
import { generateAIResponse } from '../data/mockData';

// ============================================
// Types
// ============================================

export interface SendMessageRequest {
  message: string;
  language: Language;
  conversationId?: string | null;
  movieContext?: Movie | null;
}

export interface SendMessageResponse {
  reply: string;
  conversationId: string;
  movieContext: Movie | null;
  streamingInfo: StreamingProvider[];
  suggestions: string[];
  language: Language;
}

export interface AnalyzeUrlRequest {
  url: string;
  language: Language;
}

export interface AnalyzeUrlResponse {
  reply: string;
  movieContext: Movie | null;
  streamingInfo: StreamingProvider[];
  confidence: number;
  platform: 'tiktok' | 'facebook' | 'instagram' | 'youtube' | 'unknown';
}

export interface AnalyzeImageRequest {
  image: File;
  language: Language;
}

// ============================================
// Chat Service
// ============================================

export const chatService = {
  /**
   * Send a chat message to AI
   */
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    // Use mock API if configured
    if (config.USE_MOCK_API) {
      return this.mockSendMessage(request);
    }

    const response = await api.post<ApiResponse<SendMessageResponse>>(
      '/chat/send',
      request
    );
    return response.data.data;
  },

  /**
   * Analyze a social media URL
   */
  async analyzeUrl(request: AnalyzeUrlRequest): Promise<AnalyzeUrlResponse> {
    if (config.USE_MOCK_API) {
      return this.mockAnalyzeUrl(request);
    }

    const response = await api.post<ApiResponse<AnalyzeUrlResponse>>(
      '/chat/analyze-url',
      request
    );
    return response.data.data;
  },

  /**
   * Analyze an image/screenshot
   */
  async analyzeImage(request: AnalyzeImageRequest): Promise<SendMessageResponse> {
    if (config.USE_MOCK_API) {
      return this.mockAnalyzeImage(request);
    }

    const formData = new FormData();
    formData.append('image', request.image);
    formData.append('language', request.language);

    const response = await api.post<ApiResponse<SendMessageResponse>>(
      '/chat/analyze-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  // ============================================
  // Mock Implementations
  // ============================================

  async mockSendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    // Simulate network delay
    await this.delay(1000 + Math.random() * 1500);

    const mockResponse = generateAIResponse(request.message, request.language);

    return {
      reply: mockResponse.reply,
      conversationId: Date.now().toString(),
      movieContext: mockResponse.movie || null,
      streamingInfo: mockResponse.streaming || [],
      suggestions: mockResponse.suggestions,
      language: request.language,
    };
  },

  async mockAnalyzeUrl(request: AnalyzeUrlRequest): Promise<AnalyzeUrlResponse> {
    await this.delay(1500 + Math.random() * 1000);

    const mockResponse = generateAIResponse(request.url, request.language);
    
    // Detect platform from URL
    let platform: AnalyzeUrlResponse['platform'] = 'unknown';
    const url = request.url.toLowerCase();
    if (url.includes('tiktok')) platform = 'tiktok';
    else if (url.includes('facebook') || url.includes('fb.watch')) platform = 'facebook';
    else if (url.includes('instagram')) platform = 'instagram';
    else if (url.includes('youtube') || url.includes('youtu.be')) platform = 'youtube';

    return {
      reply: mockResponse.reply,
      movieContext: mockResponse.movie || null,
      streamingInfo: mockResponse.streaming || [],
      confidence: 0.85 + Math.random() * 0.15,
      platform,
    };
  },

  async mockAnalyzeImage(request: AnalyzeImageRequest): Promise<SendMessageResponse> {
    await this.delay(2000 + Math.random() * 1000);

    const mockResponse = generateAIResponse('screenshot analysis', request.language);

    return {
      reply: `🖼️ I analyzed your screenshot!\n\n${mockResponse.reply}`,
      conversationId: Date.now().toString(),
      movieContext: mockResponse.movie || null,
      streamingInfo: mockResponse.streaming || [],
      suggestions: mockResponse.suggestions,
      language: request.language,
    };
  },

  // Utility
  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
};

export default chatService;
