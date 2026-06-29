package com.moviefinder.service;

import com.moviefinder.dto.request.AnalyzeUrlRequest;
import com.moviefinder.dto.request.ChatRequest;
import com.moviefinder.dto.response.ChatResponse;
import com.moviefinder.dto.response.MovieResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChatService {

    private final GeminiService geminiService;
    private final TmdbService tmdbService;
    private final UrlAnalyzerService urlAnalyzerService;

    // Pattern to detect URLs
    private static final Pattern URL_PATTERN = Pattern.compile(
        "https?://[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=%]+"
    );

    /**
     * Process a chat message and return AI response
     */
    public ChatResponse sendMessage(ChatRequest request) {
        String message = request.getMessage();
        String language = request.getLanguage();
        
        log.info("Processing chat message: {} (lang: {})", message.substring(0, Math.min(50, message.length())), language);

        // Check if message contains a URL
        if (URL_PATTERN.matcher(message).find()) {
            return analyzeUrl(AnalyzeUrlRequest.builder()
                    .url(extractUrl(message))
                    .language(language)
                    .build());
        }

        // Check if there's movie context (follow-up question)
        if (request.getMovieContext() != null) {
            return answerFollowUp(request);
        }

        // Regular movie identification from description
        return identifyFromDescription(message, language, request.getHistory());
    }

    /**
     * Analyze a social media URL to identify the movie
     */
    public ChatResponse analyzeUrl(AnalyzeUrlRequest request) {
        String url = request.getUrl();
        String language = request.getLanguage();
        
        log.info("Analyzing URL: {}", url);

        // Get video metadata
        UrlAnalyzerService.VideoMetadata metadata = urlAnalyzerService.analyzeUrl(url);
        
        if (metadata.hasError()) {
            return ChatResponse.builder()
                    .reply(getUrlErrorMessage(language, metadata.getPlatform()))
                    .conversationId(generateConversationId())
                    .suggestions(getDefaultSuggestions(language))
                    .language(language)
                    .build();
        }

        // Use AI to identify the movie from metadata
        String aiResponse = geminiService.identifyMovie(
                metadata.getTitle(),
                metadata.getDescription(),
                metadata.getHashtags(),
                language,
                request.getHistory()
        );

        // Try to find the movie in TMDB
        MovieResponse movie = findMovieFromAiResponse(aiResponse, language);
        List<MovieResponse.StreamingProvider> streaming = null;
        
        if (movie != null) {
            streaming = tmdbService.getStreamingProviders(movie.getId(), "TH");
        }

        return ChatResponse.builder()
                .reply(aiResponse)
                .conversationId(generateConversationId())
                .movieContext(movie != null ? toMovieDto(movie) : null)
                .streamingInfo(streaming != null ? toStreamingDtos(streaming) : null)
                .suggestions(getSuggestions(language, movie != null))
                .language(language)
                .build();
    }

    /**
     * Identify movie from text description
     */
    private ChatResponse identifyFromDescription(String description, String language, List<ChatRequest.Message> history) {
        // Ask AI to identify
        String aiResponse = geminiService.chat(
                "I'm looking for a movie. Here's what I remember: " + description,
                language,
                null,
                history
        );

        // Try to find in TMDB
        MovieResponse movie = findMovieFromAiResponse(aiResponse, language);
        List<MovieResponse.StreamingProvider> streaming = null;
        
        if (movie != null) {
            streaming = tmdbService.getStreamingProviders(movie.getId(), "TH");
        }

        return ChatResponse.builder()
                .reply(aiResponse)
                .conversationId(generateConversationId())
                .movieContext(movie != null ? toMovieDto(movie) : null)
                .streamingInfo(streaming != null ? toStreamingDtos(streaming) : null)
                .suggestions(getSuggestions(language, movie != null))
                .language(language)
                .build();
    }

    /**
     * Answer a follow-up question about a specific movie
     */
    private ChatResponse answerFollowUp(ChatRequest request) {
        ChatRequest.MovieContext context = request.getMovieContext();
        
        String aiResponse = geminiService.answerMovieQuestion(
                request.getMessage(),
                context.getTitle(),
                context.getYear(),
                request.getLanguage(),
                request.getHistory()
        );

        return ChatResponse.builder()
                .reply(aiResponse)
                .conversationId(request.getConversationId())
                .suggestions(getFollowUpSuggestions(request.getLanguage()))
                .language(request.getLanguage())
                .build();
    }

    /**
     * Try to extract movie title from AI response and search TMDB
     */
    private MovieResponse findMovieFromAiResponse(String aiResponse, String language) {
        try {
            // Look for patterns like "Movie Title (Year)" or "**Movie Title**"
            String searchQuery = extractMovieTitle(aiResponse);
            
            if (searchQuery != null && !searchQuery.isEmpty()) {
                List<MovieResponse> results = tmdbService.searchMovies(searchQuery, language);
                if (!results.isEmpty()) {
                    // Get full details for first result
                    return tmdbService.getMovieById(results.get(0).getId(), language);
                }
            }
        } catch (Exception e) {
            log.warn("Could not find movie in TMDB: {}", e.getMessage());
        }
        return null;
    }

    private String extractMovieTitle(String text) {
        // Try to extract movie title from patterns like:
        // "**Movie Title (2020)**"
        // "Movie Title (2020)"
        // "「Movie Title」"
        
        // Pattern 1: **Title (Year)**
        Pattern p1 = Pattern.compile("\\*\\*([^*]+?)\\s*\\(\\d{4}\\)\\*\\*");
        var m1 = p1.matcher(text);
        if (m1.find()) {
            return m1.group(1).trim();
        }
        
        // Pattern 2: **Title**
        Pattern p2 = Pattern.compile("\\*\\*([^*]+?)\\*\\*");
        var m2 = p2.matcher(text);
        if (m2.find()) {
            String title = m2.group(1).trim();
            // Remove year if present
            return title.replaceAll("\\s*\\(\\d{4}\\)", "");
        }
        
        // Pattern 3: Title (Year) at start of line
        Pattern p3 = Pattern.compile("^([A-Z][^(]+?)\\s*\\(\\d{4}\\)", Pattern.MULTILINE);
        var m3 = p3.matcher(text);
        if (m3.find()) {
            return m3.group(1).trim();
        }
        
        return null;
    }

    private String extractUrl(String text) {
        var matcher = URL_PATTERN.matcher(text);
        if (matcher.find()) {
            return matcher.group();
        }
        return text;
    }

    private String generateConversationId() {
        return UUID.randomUUID().toString();
    }

    // ============================================
    // Conversion helpers
    // ============================================

    private ChatResponse.MovieDto toMovieDto(MovieResponse movie) {
        return ChatResponse.MovieDto.builder()
                .tmdbId(movie.getId())
                .title(movie.getTitle())
                .titleTh(movie.getTitleTh())
                .titleMy(movie.getTitleMy())
                .year(movie.getYear())
                .rating(movie.getRating())
                .voteCount(movie.getVoteCount())
                .runtime(movie.getRuntime())
                .genres(movie.getGenres())
                .overview(movie.getOverview())
                .overviewTh(movie.getOverviewTh())
                .posterUrl(movie.getPosterUrl())
                .backdropUrl(movie.getBackdropUrl())
                .director(movie.getDirector())
                .cast(movie.getCast())
                .tagline(movie.getTagline())
                .build();
    }

    private List<ChatResponse.StreamingProviderDto> toStreamingDtos(List<MovieResponse.StreamingProvider> providers) {
        return providers.stream()
                .map(p -> ChatResponse.StreamingProviderDto.builder()
                        .platform(p.getPlatform())
                        .type(p.getType())
                        .isFree(p.isFree())
                        .price(p.getPrice())
                        .country(p.getCountry())
                        .logo(p.getLogo())
                        .url(p.getUrl())
                        .build())
                .toList();
    }

    // ============================================
    // Suggestion helpers
    // ============================================

    private List<String> getSuggestions(String language, boolean movieFound) {
        if (movieFound) {
            return switch (language) {
                case "th" -> List.of(
                        "ดูได้ที่ไหนในไทย?",
                        "มีซับไทยไหม?",
                        "แนะนำหนังคล้ายๆ",
                        "ดูฟรีได้ไหม?"
                );
                case "my" -> List.of(
                        "ထိုင်းမှာ ဘယ်မှာကြည့်လို့ရလဲ?",
                        "စာတန်းထိုးရှိလား?",
                        "ဆင်တူရုပ်ရှင်ပြပါ",
                        "အခမဲ့ကြည့်လို့ရလား?"
                );
                default -> List.of(
                        "Where can I watch this in Thailand?",
                        "Are Thai subtitles available?",
                        "Show me similar movies",
                        "Is it free to watch?"
                );
            };
        } else {
            return getDefaultSuggestions(language);
        }
    }

    private List<String> getDefaultSuggestions(String language) {
        return switch (language) {
            case "th" -> List.of(
                    "ลองอธิบายฉากที่จำได้",
                    "มีนักแสดงคนไหนที่จำได้?",
                    "เป็นหนังประเภทอะไร?",
                    "ออกปีไหนคะ?"
            );
            case "my" -> List.of(
                    "မှတ်မိတဲ့ ဇာတ်ကွက်ကို ဖော်ပြပါ",
                    "သရုပ်ဆောင်ကို မှတ်မိလား?",
                    "ဘာအမျိုးအစား ရုပ်ရှင်လဲ?",
                    "ဘယ်နှစ်က ထွက်လဲ?"
            );
            default -> List.of(
                    "Try describing a scene you remember",
                    "Do you remember any actors?",
                    "What genre was it?",
                    "What year was it released?"
            );
        };
    }

    private List<String> getFollowUpSuggestions(String language) {
        return switch (language) {
            case "th" -> List.of(
                    "ดูตัวอย่างหน่อย",
                    "มีภาคต่อไหม?",
                    "ใครกำกับ?",
                    "แนะนำหนังอื่นๆ"
            );
            case "my" -> List.of(
                    "ကြိုတင်ကြည့်ခွင့်ပြပါ",
                    "အပိုင်း ရှိလား?",
                    "ဘယ်သူ ဒါရိုက်တာလုပ်လဲ?",
                    "အခြား ရုပ်ရှင်တွေ ညွှန်းပါ"
            );
            default -> List.of(
                    "Show me the trailer",
                    "Is there a sequel?",
                    "Who directed it?",
                    "Recommend similar movies"
            );
        };
    }

    private String getUrlErrorMessage(String language, UrlAnalyzerService.Platform platform) {
        String platformName = platform.toString();
        return switch (language) {
            case "th" -> String.format("❌ ไม่สามารถเข้าถึงวิดีโอ %s ได้ อาจเป็นวิดีโอส่วนตัวหรือถูกลบแล้ว\n\nลองอธิบายฉากที่คุณจำได้แทนนะคะ", platformName);
            case "my" -> String.format("❌ %s ဗီဒီယိုကို ဝင်ကြည့်လို့မရပါ။ ကိုယ်ပိုင်ဗီဒီယိုဖြစ်နိုင်သည် သို့မဟုတ် ဖျက်ပစ်ပြီးဖြစ်နိုင်ပါသည်။\n\nမှတ်မိတဲ့ ဇာတ်ကွက်ကို ဖော်ပြပါ။", platformName);
            default -> String.format("❌ Could not access the %s video. It might be private or deleted.\n\nTry describing the scene you remember instead!", platformName);
        };
    }
}
