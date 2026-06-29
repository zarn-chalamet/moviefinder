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
    private final VideoAnalysisService videoAnalysisService;

    private static final Pattern URL_PATTERN = Pattern.compile(
        "https?://[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=%]+"
    );

    public ChatResponse sendMessage(ChatRequest request) {
        String message = request.getMessage();
        String language = request.getLanguage();
        
        log.info("Processing chat message: {} (lang: {})", 
            message.substring(0, Math.min(50, message.length())), language);

        if (URL_PATTERN.matcher(message).find()) {
            return analyzeUrl(AnalyzeUrlRequest.builder()
                    .url(extractUrl(message))
                    .language(language)
                    .build());
        }

        if (request.getMovieContext() != null) {
            return answerFollowUp(request);
        }

        return identifyFromDescription(message, language, request.getHistory());
    }

    public ChatResponse analyzeUrl(AnalyzeUrlRequest request) {
        String url = request.getUrl();
        String language = request.getLanguage();

        UrlAnalyzerService.VideoMetadata metadata = urlAnalyzerService.analyzeUrl(url);

        log.info("Metadata - hasError: {}, title: {}", metadata.hasError(), metadata.getTitle());

        if (metadata.hasError()) {
            return ChatResponse.builder()
                    .reply(getUrlErrorMessage(language, metadata.getPlatform()))
                    .conversationId(generateConversationId())
                    .suggestions(getDefaultSuggestions(language))
                    .language(language)
                    .analysisMethod("text")
                    .build();
        }

        // STEP 1: Try text-based identification first (fast)
        String aiResponse = geminiService.identifyMovie(
                metadata.getTitle(),
                metadata.getDescription(),
                metadata.getHashtags(),
                language,
                request.getHistory()
        );

        boolean isConfident = isHighConfidence(aiResponse, metadata);

        if (isConfident) {
            log.info("High confidence from text analysis");
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
                    .analysisMethod("text")
                    .build();
        }

        // STEP 2: Low confidence → multimodal vision (audio + frames)
        log.info("Low confidence from text, falling back to multimodal vision");
        String visionReply = videoAnalysisService.analyzeVideoFrames(url, language);

        MovieResponse movie = findMovieFromAiResponse(visionReply, language);
        List<MovieResponse.StreamingProvider> streaming = null;
        if (movie != null) {
            streaming = tmdbService.getStreamingProviders(movie.getId(), "TH");
        }

        return ChatResponse.builder()
                .reply(visionReply)
                .conversationId(generateConversationId())
                .movieContext(movie != null ? toMovieDto(movie) : null)
                .streamingInfo(streaming != null ? toStreamingDtos(streaming) : null)
                .suggestions(getSuggestions(language, movie != null))
                .language(language)
                .analysisMethod("vision")
                .processingMessage("Analyzed using video audio and frames.")
                .build();
    }

    private ChatResponse identifyFromDescription(String description, String language, List<ChatRequest.Message> history) {
        String aiResponse = geminiService.chat(
                "I'm looking for a movie or TV show. Here's what I remember: " + description,
                language,
                null,
                history
        );

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
     * Smart search: tries TV shows AND movies
     */
    private MovieResponse findMovieFromAiResponse(String aiResponse, String language) {
        try {
            String searchQuery = extractMovieTitle(aiResponse);
            log.info("Extracted title for TMDB: '{}'", searchQuery);
            
            if (searchQuery == null || searchQuery.isEmpty()) {
                log.warn("Could not extract title from AI response");
                return null;
            }

            // Detect if content is likely a TV series
            String lowerResponse = aiResponse.toLowerCase();
            boolean looksLikeTv = lowerResponse.contains("tv series") || 
                                 lowerResponse.contains("k-drama") ||
                                 lowerResponse.contains("korean drama") ||
                                 lowerResponse.contains("drama series") ||
                                 lowerResponse.contains("episode") ||
                                 lowerResponse.contains("season") ||
                                 lowerResponse.contains("anime");

            // Try TV first if it looks like a series
            if (looksLikeTv) {
                List<MovieResponse> tvResults = tmdbService.searchTvShows(searchQuery, language);
                if (!tvResults.isEmpty()) {
                    log.info("Found TV show: {}", tvResults.get(0).getTitle());
                    return tmdbService.getTvShowById(tvResults.get(0).getId(), language);
                }
            }

            // Try movies
            List<MovieResponse> movieResults = tmdbService.searchMovies(searchQuery, language);
            if (!movieResults.isEmpty()) {
                log.info("Found movie: {}", movieResults.get(0).getTitle());
                return tmdbService.getMovieById(movieResults.get(0).getId(), language);
            }

            // Fallback: try TV if didn't already
            if (!looksLikeTv) {
                List<MovieResponse> tvResults = tmdbService.searchTvShows(searchQuery, language);
                if (!tvResults.isEmpty()) {
                    log.info("Found TV show (fallback): {}", tvResults.get(0).getTitle());
                    return tmdbService.getTvShowById(tvResults.get(0).getId(), language);
                }
            }

            log.warn("No TMDB results for: {}", searchQuery);
        } catch (Exception e) {
            log.warn("TMDB lookup failed: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Improved title extraction - handles Korean/Chinese/Japanese
     */
    private String extractMovieTitle(String text) {
        if (text == null || text.isEmpty()) return null;
        
        // Pattern 1: **Title (Year)** - new format
        Pattern p0 = Pattern.compile("🎬\\s*\\*\\*\\s*([^*(]+?)\\s*\\(\\d{4}\\)\\s*\\*\\*");
        var m0 = p0.matcher(text);
        if (m0.find()) {
            return cleanTitle(m0.group(1));
        }
        
        // Pattern 2: **Title (Year)** with optional foreign name
        Pattern p1 = Pattern.compile("\\*\\*\\s*([^*(]+?)(?:\\s*\\([^)]*[^\\x00-\\x7F][^)]*\\))?\\s*\\(\\d{4}\\)\\s*\\*\\*");
        var m1 = p1.matcher(text);
        if (m1.find()) {
            return cleanTitle(m1.group(1));
        }
        
        // Pattern 3: Title: **Name**
        Pattern p2 = Pattern.compile("(?i)(?:title|show|movie)[:\\s]*\\*\\*\\s*([^*\\n(]+?)(?:\\s*\\([^)]*\\))?\\s*\\*\\*");
        var m2 = p2.matcher(text);
        if (m2.find()) {
            return cleanTitle(m2.group(1));
        }
        
        // Pattern 4: Plain **Title**
        Pattern p3 = Pattern.compile("\\*\\*\\s*([^*\\n]+?)\\s*\\*\\*");
        var m3 = p3.matcher(text);
        if (m3.find()) {
            return cleanTitle(m3.group(1));
        }
        
        return null;
    }

    /**
     * Clean title: removes foreign chars, year, markdown
     */
    private String cleanTitle(String title) {
        if (title == null) return null;
        
        // Remove year (2020), (1999), etc
        title = title.replaceAll("\\s*\\(\\d{4}\\)", "");
        
        // Remove parentheses containing non-ASCII (Korean, Chinese, Japanese)
        title = title.replaceAll("\\s*\\([^)]*[^\\x00-\\x7F][^)]*\\)", "");
        
        // Remove labels like "Title:", "Movie:"
        title = title.replaceAll("(?i)^(title|movie|show|name)[:\\s]+", "");
        
        // Remove markdown
        title = title.replaceAll("\\*", "").trim();
        
        // Remove leading emojis
        title = title.replaceAll("^[\\p{So}\\p{Cn}\\s]+", "").trim();
        
        return title.isEmpty() ? null : title;
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

    private boolean isHighConfidence(String aiResponse, UrlAnalyzerService.VideoMetadata metadata) {
        if (aiResponse == null) return false;

        String lower = aiResponse.toLowerCase();

        // Bad signals
        if (lower.contains("could not identify") ||
            lower.contains("cannot identify") ||
            lower.contains("unable to identify") ||
            lower.contains("not enough information") ||
            lower.contains("i'm not sure") ||
            lower.contains("please provide more") ||
            lower.contains("i would need more") ||
            lower.contains("❌")) {
            return false;
        }

        // Good signal: has title with year
        boolean hasTitleAndYear = lower.contains("(") && 
                                 (lower.contains("20") || lower.contains("19"));

        return hasTitleAndYear;
    }
}