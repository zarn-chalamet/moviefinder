package com.moviefinder.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moviefinder.dto.request.AnalyzeUrlRequest;
import com.moviefinder.dto.request.ChatRequest;
import com.moviefinder.dto.response.ChatResponse;
import com.moviefinder.dto.response.MovieResponse;
import com.moviefinder.service.GeminiService.ContentClassification;
import com.moviefinder.service.GeminiService.VideoContext;
import com.moviefinder.service.VideoAnalysisService.VideoInfo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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
    private final ObjectMapper objectMapper;

    private static final Pattern URL_PATTERN = Pattern.compile(
        "https?://[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=%]+"
    );

    public ChatResponse sendMessage(ChatRequest request) {
        String message = request.getMessage();
        String language = request.getLanguage();

        log.info("Processing message (lang: {}): {}", language,
            message.substring(0, Math.min(50, message.length())));

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

        // Step 0: Get URL metadata
        UrlAnalyzerService.VideoMetadata metadata = urlAnalyzerService.analyzeUrl(url);
        log.info("Metadata - platform: {}, title: {}, specificHashtags: {}",
            metadata.getPlatform(), metadata.getTitle(), metadata.getSpecificHashtags());

        if (metadata.hasError()) {
            return buildErrorResponse(language, metadata.getPlatform());
        }

        // Step 1: Get video info (duration, resolution, audio) WITHOUT full download
        // This is a fast operation that helps classify the video correctly
        VideoInfo videoInfo = videoAnalysisService.getVideoInfo(url);
        VideoContext videoContext = null;
        if (videoInfo.isValid()) {
            videoContext = VideoContext.builder()
                .durationSeconds(videoInfo.durationSeconds)
                .width(videoInfo.width)
                .height(videoInfo.height)
                .hasAudio(videoInfo.hasAudio)
                .isVertical(videoInfo.isVertical())
                .build();
            log.info("Video context: {}", videoContext.getDurationDescription());
        } else {
            log.warn("Could not get video info, proceeding without duration context");
        }

        // Step 2: Classify content type WITH video context
        // This is much more accurate because it knows the duration
        ContentClassification classification = geminiService.classifyContent(
            metadata.getTitle(),
            metadata.getDescription(),
            metadata.getHashtags(),
            language,
            videoContext
        );
        log.info("Classified as: {} / {} / lang:{} / confidence:{} / reasoning:{}",
            classification.getContentType(),
            classification.getMediaType(),
            classification.getLanguage(),
            classification.getConfidence(),
            classification.getReasoning());

        // Step 3: Handle Chinese short dramas
        if (classification.isChineseShortDrama()) {
            log.info("Chinese short drama detected, redirecting to platforms");
            return buildChineseShortDramaResponse(language, metadata, classification);
        }

        // Step 4: Try hashtag search (fastest, most reliable when hashtags are specific)
        if (metadata.hasSpecificHashtags()) {
            log.info("Trying hashtag search with: {}", metadata.getSpecificHashtags());
            ChatResponse hashtagResult = tryHashtagSearch(metadata, classification, language);
            if (hashtagResult != null) {
                log.info("Hashtag search succeeded");
                return hashtagResult;
            }
        }

        // Step 5: Try explicit title if classifier found one (and it is not a channel name)
        if (classification.isHasExplicitTitle() && classification.getExplicitTitle() != null
                && !isLikelyChannelName(classification.getExplicitTitle())) {
            log.info("Trying explicit title search: {}", classification.getExplicitTitle());
            ChatResponse titleResult = tryTitleSearch(
                classification.getExplicitTitle(), classification, metadata, language);
            if (titleResult != null) {
                log.info("Explicit title search succeeded");
                return titleResult;
            }
        }

        // Step 6: Route based on classification
        // Recap videos get special treatment - focus on audio narration
        if (classification.isRecapVideo()) {
            log.info("Routing to RECAP video analysis");
            return tryRecapAnalysis(url, metadata, classification, language);
        }

        // Step 7: For non-recap videos, try metadata analysis first
        log.info("Trying AI metadata analysis");
        ChatResponse metadataResult = tryMetadataAnalysis(metadata, classification, language);
        if (metadataResult != null) {
            return metadataResult;
        }

        // Step 8: Fall back to scene vision analysis
        log.info("Falling back to scene vision analysis");
        return tryVisionAnalysis(url, metadata, classification, language, false);
    }

    // Detect if a "title" is actually a channel/page name
    private boolean isLikelyChannelName(String title) {
        if (title == null) return false;
        String lower = title.toLowerCase().trim();

        // Common channel name patterns
        return lower.contains("recap") ||
               lower.contains("channel") ||
               lower.contains("movies") ||
               lower.contains("films") ||
               lower.equals("rango") ||
               lower.length() < 3 ||
               // All caps single word is often a channel
               (title.equals(title.toUpperCase()) && !title.contains(" ") && title.length() > 2);
    }

    // NEW: Recap-specific analysis pipeline
    private ChatResponse tryRecapAnalysis(
            String url,
            UrlAnalyzerService.VideoMetadata metadata,
            ContentClassification classification,
            String language) {

        log.info("Starting recap video analysis (downloads 120s of video)");

        // Use recap mode - downloads 120 seconds, uses recap-focused prompt
        String visionReply = videoAnalysisService.analyzeVideoFrames(url, language, true);

        // Parse the structured JSON response
        RecapAnalysis analysis = parseRecapAnalysis(visionReply);

        if (analysis == null) {
            log.warn("Could not parse recap analysis, falling back to unknown");
            return buildCannotIdentifyResponse(language, metadata, classification);
        }

        log.info("Recap analysis - titleFromAudio: '{}', confidence: {}, possibleMovies: {}",
            analysis.getTitleFromAudio(),
            analysis.getTitleConfidence(),
            analysis.getPossibleMovies().size());

        // Priority 1: Title mentioned in audio narration (HIGHEST confidence)
        if (analysis.getTitleFromAudio() != null &&
            !analysis.getTitleFromAudio().isBlank() &&
            !analysis.getTitleFromAudio().equalsIgnoreCase("null") &&
            ("HIGH".equals(analysis.getTitleConfidence()) ||
             "MEDIUM".equals(analysis.getTitleConfidence()))) {

            log.info("Trying audio-mentioned title: {}", analysis.getTitleFromAudio());
            MovieResponse movie = smartTmdbSearch(analysis.getTitleFromAudio(), false);
            if (movie != null) {
                int confidence = "HIGH".equals(analysis.getTitleConfidence()) ? 85 : 70;
                return buildSuccessResponse(movie, "audio_narration", confidence, language, classification);
            }
        }

        // Priority 2: Try possible movies from the analysis
        if (!analysis.getPossibleMovies().isEmpty()) {
            List<MovieResponse> foundCandidates = new ArrayList<>();

            for (PossibleMovie possible : analysis.getPossibleMovies()) {
                log.info("Trying possible movie: {} ({})", possible.getTitle(), possible.getYear());
                MovieResponse movie = smartTmdbSearch(possible.getTitle(), false);
                if (movie != null) {
                    foundCandidates.add(movie);
                    if (foundCandidates.size() >= 5) break;
                }
            }

            if (foundCandidates.size() == 1) {
                // Only one match - show it with moderate confidence
                return buildSuccessResponse(foundCandidates.get(0), "recap_match", 60, language, classification);
            }

            if (foundCandidates.size() > 1) {
                // Multiple matches - show as candidates
                return buildCandidatesResponse(foundCandidates, analysis, language, classification);
            }
        }

        // Priority 3: We have a story description but no matches
        // Show what we understood even if we cannot find the exact movie
        return buildRecapDescriptionResponse(analysis, metadata, classification, language);
    }

    // Existing scene analysis pipeline
    private ChatResponse tryVisionAnalysis(
            String url,
            UrlAnalyzerService.VideoMetadata metadata,
            ContentClassification classification,
            String language,
            boolean isRecap) {

        String visionReply = videoAnalysisService.analyzeVideoFrames(url, language, isRecap);

        // Try to parse as structured JSON first
        RecapAnalysis analysis = parseRecapAnalysis(visionReply);

        if (analysis != null && !analysis.getPossibleMovies().isEmpty()) {
            // Got structured response, use it
            for (PossibleMovie possible : analysis.getPossibleMovies()) {
                MovieResponse movie = smartTmdbSearch(possible.getTitle(), false);
                if (movie != null) {
                    return buildSuccessResponse(movie, "vision", 55, language, classification);
                }
            }
        }

        // Fall back to old text-based parsing
        MovieResponse movie = findMovieFromVisionResponse(visionReply, classification);

        if (movie != null) {
            return buildSuccessResponse(movie, "vision", 55, language, classification);
        }

        return buildCannotIdentifyResponse(language, metadata, classification);
    }

    // Data classes for recap analysis JSON parsing

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    private static class RecapAnalysis {
        private String titleFromAudio;
        private String titleConfidence;
        private String audioLanguage;
        private String storyDescription;
        private List<PossibleMovie> possibleMovies;
        private String visualStyle;
        private String genre;
        private String keyElements;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    private static class PossibleMovie {
        private String title;
        private String year;
        private String reason;
    }

    private RecapAnalysis parseRecapAnalysis(String jsonResponse) {
        try {
            String json = jsonResponse
                .replaceAll("```json\\s*", "")
                .replaceAll("```\\s*", "")
                .trim();

            int start = json.indexOf('{');
            int end = json.lastIndexOf('}');
            if (start >= 0 && end > start) {
                json = json.substring(start, end + 1);
            }

            JsonNode root = objectMapper.readTree(json);

            List<PossibleMovie> movies = new ArrayList<>();
            JsonNode moviesNode = root.path("possibleMovies");
            if (moviesNode.isArray()) {
                for (JsonNode m : moviesNode) {
                    String title = m.path("title").asText("").trim();
                    if (!title.isEmpty() && !title.equalsIgnoreCase("null") &&
                        !title.equalsIgnoreCase("unknown")) {
                        movies.add(PossibleMovie.builder()
                            .title(title)
                            .year(m.path("year").asText(""))
                            .reason(m.path("reason").asText(""))
                            .build());
                    }
                }
            }

            String titleFromAudio = root.path("titleFromAudio").asText(null);
            if ("null".equals(titleFromAudio)) titleFromAudio = null;

            return RecapAnalysis.builder()
                .titleFromAudio(titleFromAudio)
                .titleConfidence(root.path("titleConfidence").asText("NONE"))
                .audioLanguage(root.path("audioLanguage").asText(""))
                .storyDescription(root.path("storyDescription").asText(""))
                .possibleMovies(movies)
                .visualStyle(root.path("visualStyle").asText(""))
                .genre(root.path("genre").asText(""))
                .keyElements(root.path("keyElements").asText(""))
                .build();

        } catch (Exception e) {
            log.warn("Failed to parse recap analysis JSON: {}", e.getMessage());
            return null;
        }
    }

    // Show multiple candidates when we have several possibilities
    private ChatResponse buildCandidatesResponse(
            List<MovieResponse> candidates,
            RecapAnalysis analysis,
            String language,
            ContentClassification classification) {

        StringBuilder candidateList = new StringBuilder();
        int i = 1;
        for (MovieResponse c : candidates) {
            candidateList.append(i++).append(". **").append(c.getTitle());
            if (c.getYear() != null && !c.getYear().isEmpty()) {
                candidateList.append(" (").append(c.getYear()).append(")");
            }
            candidateList.append("**\n");
            if (c.getOverview() != null) {
                String overview = c.getOverview();
                if (overview.length() > 120) overview = overview.substring(0, 120) + "...";
                candidateList.append("   ").append(overview).append("\n\n");
            }
        }

        String reply = switch (language) {
            case "th" -> String.format("""
                **พบภาพยนตร์ที่เป็นไปได้ %d เรื่อง**

                จากการวิเคราะห์เนื้อเรื่องในวิดีโอ อาจเป็นหนึ่งในเรื่องต่อไปนี้:

                %s

                **เนื้อเรื่องที่ผู้บรรยายอธิบาย:**
                %s

                กรุณาเลือกเรื่องที่ถูกต้อง หรือให้ข้อมูลเพิ่มเติม
                """,
                candidates.size(),
                candidateList,
                analysis.getStoryDescription());
            case "my" -> String.format("""
                **ဖြစ်နိုင်သော ရုပ်ရှင် %d ခု တွေ့ရှိပါသည်**

                ဗီဒီယိုမှ ဇာတ်လမ်းအရ အောက်ပါတို့ထဲမှ တစ်ခုဖြစ်နိုင်ပါသည်:

                %s

                **ဇာတ်လမ်းအကြောင်း:**
                %s

                မှန်ကန်သောရုပ်ရှင်ကို ရွေးချယ်ပါ
                """,
                candidates.size(),
                candidateList,
                analysis.getStoryDescription());
            default -> String.format("""
                **Found %d possible matches**

                Based on the story described in the video, this might be one of:

                %s

                **Story described by narrator:**
                %s

                Please select the correct one, or provide more details.
                """,
                candidates.size(),
                candidateList,
                analysis.getStoryDescription());
        };

        List<ChatResponse.MovieDto> candidateDtos = candidates.stream()
            .map(this::toMovieDto)
            .toList();

        return ChatResponse.builder()
            .reply(reply)
            .conversationId(generateConversationId())
            .candidates(candidateDtos)
            .confidenceScore(50)
            .confidenceLevel("UNCERTAIN")
            .contentType(classification.getContentType())
            .analysisMethod("recap_candidates")
            .suggestions(getSuggestions(language, false))
            .language(language)
            .build();
    }

    // Show what we understood even if we cannot find the movie
    private ChatResponse buildRecapDescriptionResponse(
            RecapAnalysis analysis,
            UrlAnalyzerService.VideoMetadata metadata,
            ContentClassification classification,
            String language) {

        String reply = switch (language) {
            case "th" -> String.format("""
                **ไม่สามารถระบุภาพยนตร์ได้แน่ชัด**

                จากการฟังเสียงบรรยาย เข้าใจเรื่องราวคร่าวๆ ดังนี้:

                **เนื้อเรื่อง:** %s

                **ประเภท:** %s
                **สไตล์:** %s

                **ช่วยบอกข้อมูลเพิ่มเติมได้ไหม?**
                ชื่อภาพยนตร์ (ถ้าจำได้)
                ชื่อนักแสดง
                ปีที่ออกฉาย
                """,
                nonEmpty(analysis.getStoryDescription(), "ไม่มีข้อมูล"),
                nonEmpty(analysis.getGenre(), "ไม่ทราบ"),
                nonEmpty(analysis.getVisualStyle(), "ไม่ทราบ"));
            case "my" -> String.format("""
                **ရုပ်ရှင်ကို တိကျစွာ မသိနိုင်ပါ**

                အသံဖော်ပြချက်မှ နားလည်သောအရာများ:

                **ဇာတ်လမ်း:** %s

                **အမျိုးအစား:** %s
                **ပုံစံ:** %s

                **ထပ်မံဖော်ပြပေးနိုင်ပါသလား?**
                ရုပ်ရှင်အမည် (မှတ်မိပါက)
                သရုပ်ဆောင်အမည်
                ထွက်ရှိသည့်ခုနှစ်
                """,
                nonEmpty(analysis.getStoryDescription(), "မသိပါ"),
                nonEmpty(analysis.getGenre(), "မသိပါ"),
                nonEmpty(analysis.getVisualStyle(), "မသိပါ"));
            default -> String.format("""
                **Cannot identify the specific movie**

                From the narration, I understood the following:

                **Story:** %s

                **Genre:** %s
                **Style:** %s

                **Can you help with more details?**
                Movie title (if you remember)
                Actor names
                Release year
                """,
                nonEmpty(analysis.getStoryDescription(), "not clear"),
                nonEmpty(analysis.getGenre(), "unknown"),
                nonEmpty(analysis.getVisualStyle(), "unknown"));
        };

        return ChatResponse.builder()
            .reply(reply)
            .conversationId(generateConversationId())
            .confidenceScore(25)
            .confidenceLevel("UNKNOWN")
            .contentType(classification.getContentType())
            .analysisMethod("recap_description")
            .suggestions(getDefaultSuggestions(language))
            .language(language)
            .build();
    }

    private String nonEmpty(String value, String defaultVal) {
        return (value == null || value.isBlank()) ? defaultVal : value;
    }

    // Existing search strategies

    private ChatResponse tryHashtagSearch(
            UrlAnalyzerService.VideoMetadata metadata,
            ContentClassification classification,
            String language) {

        List<String> hashtagList = urlAnalyzerService.extractSpecificHashtagList(
            (metadata.getDescription() != null ? metadata.getDescription() : "") + " " +
            (metadata.getTitle() != null ? metadata.getTitle() : "")
        );

        if (hashtagList.isEmpty()) return null;

        List<MovieResponse> results = tmdbService.searchByHashtags(hashtagList);
        if (results.isEmpty()) return null;

        MovieResponse topResult = getFullDetails(results.get(0));
        if (topResult == null) return null;

        return buildSuccessResponse(topResult, "hashtag", 82, language, classification);
    }

    private ChatResponse tryTitleSearch(
            String explicitTitle,
            ContentClassification classification,
            UrlAnalyzerService.VideoMetadata metadata,
            String language) {

        MovieResponse best = smartTmdbSearch(explicitTitle, classification.isTvSeries());
        if (best == null) return null;

        return buildSuccessResponse(best, "explicit_title", 78, language, classification);
    }

    private ChatResponse tryMetadataAnalysis(
            UrlAnalyzerService.VideoMetadata metadata,
            ContentClassification classification,
            String language) {

        String aiResponse = geminiService.identifyFromMetadata(
            metadata.getTitle(), metadata.getDescription(),
            metadata.getHashtags(), language, classification
        );

        IdentificationResult idResult = parseIdentificationResult(aiResponse);
        if (idResult == null || !idResult.isIdentified() || idResult.getConfidence() < 50) {
            return null;
        }

        String title = idResult.getTitle();
        if (title == null || title.isBlank() || isLikelyChannelName(title)) {
            log.info("AI identified '{}' but looks like channel name, skipping", title);
            return null;
        }

        MovieResponse best = smartTmdbSearch(title, "tv_series".equals(idResult.getType()));
        if (best == null) return null;

        int confidence = Math.min(idResult.getConfidence(), 70);
        return buildSuccessResponse(best, "metadata_ai", confidence, language, classification);
    }

    // Universal success response builder
    private ChatResponse buildSuccessResponse(
            MovieResponse movie,
            String method,
            int confidence,
            String language,
            ContentClassification classification) {

        String type = movie.getRuntime() != null && movie.getRuntime() > 0 ? "Movie" : "TV Series";

        String reply = geminiService.formatMovieResponse(
            movie.getTitle(), movie.getYear(), type,
            movie.getGenres() != null ? movie.getGenres() : List.of(),
            movie.getCast() != null ? movie.getCast() : List.of(),
            movie.getOverview(), movie.getDirector(),
            method, confidence, language
        );

        List<MovieResponse.StreamingProvider> streaming =
            tmdbService.getStreamingProviders(movie.getId(), "TH");

        String level = confidence >= 80 ? "LIKELY" : confidence >= 60 ? "UNCERTAIN" : "UNKNOWN";

        return ChatResponse.builder()
            .reply(reply)
            .conversationId(generateConversationId())
            .movieContext(toMovieDto(movie))
            .streamingInfo(toStreamingDtos(streaming))
            .confidenceScore(confidence)
            .confidenceLevel(level)
            .contentType(classification.getContentType())
            .analysisMethod(method)
            .suggestions(getSuggestions(language, true))
            .language(language)
            .build();
    }

    // Smart TMDB search with title variations
    private MovieResponse smartTmdbSearch(String title, boolean preferTv) {
        if (title == null || title.isBlank()) return null;

        MovieResponse result = trySearch(title, preferTv);
        if (result != null) return result;

        if (title.contains(":")) {
            String beforeColon = title.substring(0, title.indexOf(":")).trim();
            log.info("Retrying TMDB with part before colon: '{}'", beforeColon);
            result = trySearch(beforeColon, preferTv);
            if (result != null) return result;

            String afterColon = title.substring(title.indexOf(":") + 1).trim();
            afterColon = afterColon.replaceAll("(?i)^(the story of|a story of|the tale of|a tale of|the legend of)\\s+", "");
            log.info("Retrying TMDB with part after colon: '{}'", afterColon);
            result = trySearch(afterColon, preferTv);
            if (result != null) return result;
        }

        String[] words = title.split("\\s+");
        if (words.length > 2) {
            String lastTwo = words[words.length - 2] + " " + words[words.length - 1];
            log.info("Retrying TMDB with last two words: '{}'", lastTwo);
            result = trySearch(lastTwo, preferTv);
            if (result != null) return result;
        }

        return null;
    }

    private MovieResponse trySearch(String query, boolean preferTv) {
        try {
            if (preferTv) {
                List<MovieResponse> tv = tmdbService.searchTvShows(query, "en");
                if (!tv.isEmpty()) return tmdbService.getTvShowById(tv.get(0).getId(), "en");
                List<MovieResponse> movies = tmdbService.searchMovies(query, "en");
                if (!movies.isEmpty()) return tmdbService.getMovieById(movies.get(0).getId(), "en");
            } else {
                List<MovieResponse> movies = tmdbService.searchMovies(query, "en");
                if (!movies.isEmpty()) return tmdbService.getMovieById(movies.get(0).getId(), "en");
                List<MovieResponse> tv = tmdbService.searchTvShows(query, "en");
                if (!tv.isEmpty()) return tmdbService.getTvShowById(tv.get(0).getId(), "en");
            }
        } catch (Exception e) {
            log.warn("Search attempt failed for '{}': {}", query, e.getMessage());
        }
        return null;
    }

    // Response builders

    private ChatResponse buildChineseShortDramaResponse(
            String language,
            UrlAnalyzerService.VideoMetadata metadata,
            ContentClassification classification) {

        String reply = switch (language) {
            case "th" -> """
                **Chinese Short Drama**

                วิดีโอนี้ดูเหมือนจะเป็นซีรีส์สั้นจากจีน

                **แพลตฟอร์มที่แนะนำ:**
                ShortMax - shortmax.com
                DramaBox - dramabox.com
                ReelShort - reelshort.com
                GoodShort - goodshort.app
                """;
            case "my" -> """
                **Chinese Short Drama**

                ဤဗီဒီယိုသည် တရုတ်ဇာတ်လမ်းတိုများဖြစ်ဟန်တူပါသည်။

                **ကြည့်ရှုနိုင်သော Platform များ:**
                ShortMax - shortmax.com
                DramaBox - dramabox.com
                ReelShort - reelshort.com
                GoodShort - goodshort.app
                """;
            default -> """
                **Chinese Short Drama**

                This appears to be a Chinese short-form drama series.

                **Where to watch:**
                ShortMax - shortmax.com
                DramaBox - dramabox.com
                ReelShort - reelshort.com
                GoodShort - goodshort.app
                """;
        };

        return ChatResponse.builder()
            .reply(reply)
            .conversationId(generateConversationId())
            .isChineseShortDrama(true)
            .chineseShortDramaInfo("shortmax.com, dramabox.com, reelshort.com, goodshort.app")
            .contentType("CHINESE_SHORT_DRAMA")
            .confidenceScore(80)
            .confidenceLevel("LIKELY")
            .analysisMethod("classification")
            .suggestions(getDefaultSuggestions(language))
            .language(language)
            .build();
    }

    private ChatResponse buildCannotIdentifyResponse(
            String language,
            UrlAnalyzerService.VideoMetadata metadata,
            ContentClassification classification) {

        String reply = switch (language) {
            case "th" -> """
                **ไม่สามารถระบุได้**

                ขอโทษค่ะ ฉันไม่สามารถระบุหนังหรือซีรีส์จากวิดีโอนี้ได้

                **ช่วยบอกข้อมูลเพิ่มเติมได้ไหม?**
                """;
            case "my" -> """
                **မသိနိုင်ပါ**

                ဝမ်းနည်းပါသည်။

                **ထပ်မံဖော်ပြပေးနိုင်ပါသလား?**
                """;
            default -> """
                **Could not identify**

                I was not able to identify the movie or show from this video.

                **Can you help with more details?**
                """;
        };

        return ChatResponse.builder()
            .reply(reply)
            .conversationId(generateConversationId())
            .confidenceScore(15)
            .confidenceLevel("UNKNOWN")
            .contentType(classification.getContentType())
            .analysisMethod("failed")
            .suggestions(getDefaultSuggestions(language))
            .language(language)
            .build();
    }

    private ChatResponse buildErrorResponse(String language, UrlAnalyzerService.Platform platform) {
        String platformName = platform.toString();
        String reply = switch (language) {
            case "th" -> String.format("ไม่สามารถเข้าถึงวิดีโอ %s ได้", platformName);
            case "my" -> String.format("%s ဗီဒီယိုကို ဝင်ကြည့်လို့မရပါ", platformName);
            default -> String.format("Could not access the %s video.", platformName);
        };

        return ChatResponse.builder()
            .reply(reply)
            .conversationId(generateConversationId())
            .suggestions(getDefaultSuggestions(language))
            .language(language)
            .analysisMethod("error")
            .build();
    }

    // Helpers

    private MovieResponse getFullDetails(MovieResponse partial) {
        if (partial == null) return null;
        try {
            MovieResponse tv = tmdbService.getTvShowById(partial.getId(), "en");
            if (tv != null && tv.getTitle() != null) return tv;
            return tmdbService.getMovieById(partial.getId(), "en");
        } catch (Exception e) {
            return partial;
        }
    }

    private MovieResponse findMovieFromVisionResponse(String visionReply,
                                                       ContentClassification classification) {
        if (visionReply == null) return null;
        try {
            String lower = visionReply.toLowerCase();
            if (lower.contains("could not identify") || lower.contains("cannot identify")) {
                return null;
            }

            String title = extractMovieTitle(visionReply);
            if (title == null || title.isEmpty()) return null;

            boolean looksLikeTv = classification.isTvSeries() || lower.contains("series");
            return smartTmdbSearch(title, looksLikeTv);
        } catch (Exception e) {
            return null;
        }
    }

    private IdentificationResult parseIdentificationResult(String jsonResponse) {
        try {
            String json = jsonResponse.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            int start = json.indexOf('{');
            int end = json.lastIndexOf('}');
            if (start >= 0 && end > start) json = json.substring(start, end + 1);

            JsonNode node = objectMapper.readTree(json);
            String title = node.path("title").asText(null);
            if ("null".equals(title) || "".equals(title)) title = null;

            return IdentificationResult.builder()
                .identified(node.path("identified").asBoolean(false))
                .confidence(node.path("confidence").asInt(0))
                .title(title)
                .year(node.path("year").asText(null))
                .type(node.path("type").asText("unknown"))
                .build();
        } catch (Exception e) {
            return null;
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    private static class IdentificationResult {
        private boolean identified;
        private int confidence;
        private String title;
        private String year;
        private String type;
    }

    private ChatResponse identifyFromDescription(String description, String language,
                                                  List<ChatRequest.Message> history) {
        String aiResponse = geminiService.chat(
            "I am looking for a movie: " + description, language, null, history
        );

        MovieResponse movie = findMovieFromVisionResponse(aiResponse, ContentClassification.unknown());
        List<MovieResponse.StreamingProvider> streaming = null;
        if (movie != null) streaming = tmdbService.getStreamingProviders(movie.getId(), "TH");

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
            request.getMessage(), context.getTitle(), context.getYear(),
            request.getLanguage(), request.getHistory()
        );

        return ChatResponse.builder()
            .reply(aiResponse)
            .conversationId(request.getConversationId())
            .suggestions(getFollowUpSuggestions(request.getLanguage()))
            .language(request.getLanguage())
            .build();
    }

    private String extractMovieTitle(String text) {
        if (text == null || text.isEmpty()) return null;
        Pattern p = Pattern.compile("\\*\\*\\s*([^*\\n]+?)\\s*\\*\\*");
        var m = p.matcher(text);
        if (m.find()) return cleanTitle(m.group(1));
        return null;
    }

    private String cleanTitle(String title) {
        if (title == null) return null;
        title = title.replaceAll("\\s*\\(\\d{4}\\)", "");
        title = title.replaceAll("\\*", "").trim();
        return title.isEmpty() ? null : title;
    }

    private String extractUrl(String text) {
        var matcher = URL_PATTERN.matcher(text);
        return matcher.find() ? matcher.group() : text;
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

    private List<ChatResponse.StreamingProviderDto> toStreamingDtos(
            List<MovieResponse.StreamingProvider> providers) {
        if (providers == null) return List.of();
        return providers.stream()
            .map(p -> ChatResponse.StreamingProviderDto.builder()
                .platform(p.getPlatform()).type(p.getType())
                .isFree(p.isFree()).price(p.getPrice())
                .country(p.getCountry()).logo(p.getLogo()).url(p.getUrl())
                .build())
            .toList();
    }

    private List<String> getSuggestions(String language, boolean movieFound) {
        if (movieFound) {
            return switch (language) {
                case "th" -> List.of("ดูได้ที่ไหนในไทย?", "มีซับไทยไหม?", "แนะนำหนังคล้ายๆ", "ดูฟรีได้ไหม?");
                case "my" -> List.of("ထိုင်းမှာ ဘယ်မှာကြည့်လို့ရလဲ?", "စာတန်းထိုးရှိလား?", "ဆင်တူရုပ်ရှင်ပြပါ", "အခမဲ့ကြည့်လို့ရလား?");
                default -> List.of("Where can I watch this in Thailand?", "Are Thai subtitles available?", "Show me similar movies", "Is it free to watch?");
            };
        }
        return getDefaultSuggestions(language);
    }

    private List<String> getDefaultSuggestions(String language) {
        return switch (language) {
            case "th" -> List.of("ลองอธิบายฉากที่จำได้", "มีนักแสดงคนไหนที่จำได้?", "เป็นหนังประเภทอะไร?", "ออกปีไหนคะ?");
            case "my" -> List.of("မှတ်မိတဲ့ ဇာတ်ကွက်ကို ဖော်ပြပါ", "သရုပ်ဆောင်ကို မှတ်မိလား?", "ဘာအမျိုးအစား ရုပ်ရှင်လဲ?", "ဘယ်နှစ်က ထွက်လဲ?");
            default -> List.of("Try describing a scene", "Do you remember any actors?", "What genre was it?", "What year was it released?");
        };
    }

    private List<String> getFollowUpSuggestions(String language) {
        return switch (language) {
            case "th" -> List.of("ดูตัวอย่างหน่อย", "มีภาคต่อไหม?", "ใครกำกับ?", "แนะนำหนังอื่นๆ");
            case "my" -> List.of("ကြိုတင်ကြည့်ခွင့်ပြပါ", "အပိုင်း ရှိလား?", "ဘယ်သူ ဒါရိုက်တာလုပ်လဲ?", "အခြား ရုပ်ရှင်တွေ ညွှန်းပါ");
            default -> List.of("Show me the trailer", "Is there a sequel?", "Who directed it?", "Recommend similar movies");
        };
    }
}