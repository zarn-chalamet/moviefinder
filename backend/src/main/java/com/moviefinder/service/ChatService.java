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

        // Step 4: FOR RECAP VIDEOS - go directly to recap analysis
        // Recap videos have unreliable hashtags but reliable audio narration
        if (classification.isRecapVideo()) {
            log.info("Video is RECAP - skipping hashtag search, going to recap analysis");
            ChatResponse recapResult = tryRecapAnalysis(url, metadata, classification, language);
            if (recapResult != null) {
                return recapResult;
            }
        }

        // Step 5: For non-recap videos, try hashtag search (only if hashtags are specific enough)
        if (metadata.hasSpecificHashtags()) {
            log.info("Trying hashtag search with: {}", metadata.getSpecificHashtags());
            ChatResponse hashtagResult = tryHashtagSearch(metadata, classification, language);
            if (hashtagResult != null) {
                log.info("Hashtag search succeeded");
                return hashtagResult;
            }
        }

        // Step 6: Try explicit title if classifier found one (and it is not a channel name)
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
        // Use smart search that considers country, year, and original language
        if (!analysis.getPossibleMovies().isEmpty()) {
            List<MovieResponse> foundCandidates = new ArrayList<>();

            for (PossibleMovie possible : analysis.getPossibleMovies()) {
                log.info("Trying possible movie: {} ({}) - country: {}", 
                    possible.getTitle(), possible.getYear(), possible.getOriginalCountry());
                
                MovieResponse movie = smartTmdbSearchWithContext(possible, false);
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
        private String originalTitle;
        private String year;
        private String originalCountry;   // south korea, usa, china, etc.
        private String originalLanguage;  // korean, english, chinese, etc.
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
                            .originalTitle(m.path("originalTitle").asText(""))
                            .year(m.path("year").asText(""))
                            .originalCountry(m.path("originalCountry").asText(""))
                            .originalLanguage(m.path("originalLanguage").asText(""))
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

    // Search TMDB with country/language awareness for better disambiguation
    // For foreign films, searches in the original language first, then falls back to English
    private MovieResponse smartTmdbSearchWithContext(PossibleMovie possible, boolean preferTv) {
        String title = possible.getTitle();
        if (title == null || title.isBlank()) return null;

        log.info("Smart search for '{}' (year: {}, country: {}, language: {})",
            title, possible.getYear(), possible.getOriginalCountry(), possible.getOriginalLanguage());

        List<MovieResponse> allCandidates = new ArrayList<>();

        // Strategy 1: Search in the original language if it's a foreign film
        String tmdbLangCode = TmdbService.getTmdbLanguageCode(
            possible.getOriginalLanguage(), possible.getOriginalCountry());

        if (tmdbLangCode != null && !tmdbLangCode.equals("en-US")) {
            log.info("Searching TMDB in original language: {}", tmdbLangCode);
            try {
                if (preferTv) {
                    allCandidates.addAll(tmdbService.searchTvShowsInLanguage(title, tmdbLangCode));
                    allCandidates.addAll(tmdbService.searchMoviesInLanguage(title, tmdbLangCode));
                } else {
                    allCandidates.addAll(tmdbService.searchMoviesInLanguage(title, tmdbLangCode));
                    allCandidates.addAll(tmdbService.searchTvShowsInLanguage(title, tmdbLangCode));
                }
                log.info("Language-specific search returned {} results", allCandidates.size());
            } catch (Exception e) {
                log.warn("Language-specific search failed: {}", e.getMessage());
            }
        }

        // Strategy 1.5: Try originalTitle if provided
        // Sometimes Gemini gives us the original title separately
        if (possible.getOriginalTitle() != null && !possible.getOriginalTitle().isBlank()
                && !possible.getOriginalTitle().equalsIgnoreCase(title)) {
            log.info("Also trying originalTitle: {}", possible.getOriginalTitle());
            try {
                if (tmdbLangCode != null && !tmdbLangCode.equals("en-US")) {
                    allCandidates.addAll(tmdbService.searchMoviesInLanguage(
                        possible.getOriginalTitle(), tmdbLangCode));
                    allCandidates.addAll(tmdbService.searchTvShowsInLanguage(
                        possible.getOriginalTitle(), tmdbLangCode));
                }
                allCandidates.addAll(tmdbService.searchMovies(possible.getOriginalTitle(), "en"));
                allCandidates.addAll(tmdbService.searchTvShows(possible.getOriginalTitle(), "en"));
            } catch (Exception e) {
                log.warn("Original title search failed: {}", e.getMessage());
            }
        }

        // Strategy 2: Also search in English (in case Gemini gave the original title)
        try {
            if (preferTv) {
                allCandidates.addAll(tmdbService.searchTvShows(title, "en"));
                allCandidates.addAll(tmdbService.searchMovies(title, "en"));
            } else {
                allCandidates.addAll(tmdbService.searchMovies(title, "en"));
                allCandidates.addAll(tmdbService.searchTvShows(title, "en"));
            }
        } catch (Exception e) {
            log.warn("English search failed: {}", e.getMessage());
        }

        // Strategy 3: Try title variations if we found nothing
        if (allCandidates.isEmpty()) {
            log.info("No results, trying title variations");
            MovieResponse result = smartTmdbSearch(title, preferTv);
            if (result != null) return result;
        }

        if (allCandidates.isEmpty()) {
            log.info("All searches failed for: {}", title);
            return null;
        }

        // Deduplicate by TMDB ID
        List<MovieResponse> uniqueCandidates = new ArrayList<>();
        java.util.Set<Long> seenIds = new java.util.HashSet<>();
        for (MovieResponse c : allCandidates) {
            if (c.getId() != null && seenIds.add(c.getId())) {
                uniqueCandidates.add(c);
            }
        }

        log.info("Found {} unique candidates", uniqueCandidates.size());

        if (uniqueCandidates.size() == 1) {
            return getFullDetails(uniqueCandidates.get(0));
        }

        // Score each candidate
        MovieResponse bestMatch = null;
        int bestScore = -1;

        for (MovieResponse candidate : uniqueCandidates) {
            int score = scoreCandidate(candidate, possible);
            log.info("Candidate: '{}' ({}) origTitle: '{}' - score: {}",
                candidate.getTitle(), candidate.getYear(),
                candidate.getOriginalTitle(), score);

            if (score > bestScore) {
                bestScore = score;
                bestMatch = candidate;
            }
        }

        if (bestMatch != null) {
            log.info("Best match: '{}' ({}) with score {}",
                bestMatch.getTitle(), bestMatch.getYear(), bestScore);
            return getFullDetails(bestMatch);
        }

        return getFullDetails(uniqueCandidates.get(0));
    }

        // Score a candidate based on year, country, language, and title match
    // Higher score = better match
    // Key principle: Original title character set is the STRONGEST signal for country
    private int scoreCandidate(MovieResponse candidate, PossibleMovie expected) {
        int score = 0;

        // Detect character sets in the ORIGINAL title (before scoring)
        String origTitle = candidate.getOriginalTitle();
        boolean hasKorean = false;
        boolean hasChinese = false;
        boolean hasJapanese = false;
        boolean hasThai = false;
        boolean hasCyrillic = false;
        boolean hasArabic = false;
        
        if (origTitle != null && !origTitle.isBlank()) {
            // Check each character for its Unicode range
            for (int i = 0; i < origTitle.length(); i++) {
                int cp = origTitle.codePointAt(i);
                if (cp >= 0xAC00 && cp <= 0xD7A3) hasKorean = true;
                else if (cp >= 0x4E00 && cp <= 0x9FFF) hasChinese = true;
                else if ((cp >= 0x3040 && cp <= 0x309F) || (cp >= 0x30A0 && cp <= 0x30FF)) hasJapanese = true;
                else if (cp >= 0x0E00 && cp <= 0x0E7F) hasThai = true;
                else if (cp >= 0x0400 && cp <= 0x04FF) hasCyrillic = true;
                else if (cp >= 0x0600 && cp <= 0x06FF) hasArabic = true;
            }
            
            log.debug("Char detection for '{}': kr={}, cn={}, jp={}, th={}", 
                origTitle, hasKorean, hasChinese, hasJapanese, hasThai);
        }
        
        // Also check if candidate.title (display title) has these characters
        // Because TMDB sometimes puts original in title field
        String displayTitle = candidate.getTitle();
        if (displayTitle != null && !displayTitle.isBlank() && !hasKorean && !hasChinese && !hasJapanese && !hasThai) {
            for (int i = 0; i < displayTitle.length(); i++) {
                int cp = displayTitle.codePointAt(i);
                if (cp >= 0xAC00 && cp <= 0xD7A3) hasKorean = true;
                else if (cp >= 0x4E00 && cp <= 0x9FFF) hasChinese = true;
                else if ((cp >= 0x3040 && cp <= 0x309F) || (cp >= 0x30A0 && cp <= 0x30FF)) hasJapanese = true;
                else if (cp >= 0x0E00 && cp <= 0x0E7F) hasThai = true;
            }
        }

        // ============================================
        // COUNTRY/LANGUAGE MATCHING (STRONGEST SIGNAL)
        // Apply this FIRST because it's the most decisive
        // ============================================
        String expectedCountry = expected.getOriginalCountry();
        String expectedLang = expected.getOriginalLanguage();
        
        if (expectedCountry != null || expectedLang != null) {
            String country = expectedCountry != null ? expectedCountry.toLowerCase() : "";
            String lang = expectedLang != null ? expectedLang.toLowerCase() : "";
            
            boolean expectKorean = country.contains("korea") || lang.contains("korean");
            boolean expectChinese = country.contains("china") || country.contains("chinese") 
                || lang.contains("chinese") || lang.contains("mandarin");
            boolean expectJapanese = country.contains("japan") || lang.contains("japanese");
            boolean expectThai = country.contains("thai") || country.contains("thailand") 
                || lang.contains("thai");
            
            // HUGE bonus for matching character set
            if (expectKorean && hasKorean) {
                score += 100;
                log.debug("Korean match bonus: +100");
            } else if (expectChinese && hasChinese) {
                score += 100;
            } else if (expectJapanese && hasJapanese) {
                score += 100;
            } else if (expectThai && hasThai) {
                score += 100;
            }
            
            // HUGE penalty for expected Asian country but no Asian chars in title
            // This filters out English movies with same name
            if ((expectKorean || expectChinese || expectJapanese || expectThai) 
                    && !hasKorean && !hasChinese && !hasJapanese && !hasThai) {
                score -= 80;
                log.debug("Asian country expected but no Asian chars: -80");
            }
        }

        // ============================================
        // YEAR MATCHING (Very important)
        // ============================================
        boolean hasExpectedYear = expected.getYear() != null && !expected.getYear().isBlank() &&
            !"unknown".equalsIgnoreCase(expected.getYear());
        boolean hasCandidateYear = candidate.getYear() != null && !candidate.getYear().isBlank();

        if (hasExpectedYear && hasCandidateYear) {
            try {
                int expectedYear = Integer.parseInt(expected.getYear().trim());
                int candidateYear = Integer.parseInt(candidate.getYear().trim());
                int yearDiff = Math.abs(expectedYear - candidateYear);

                if (yearDiff == 0) score += 80;
                else if (yearDiff == 1) score += 40;
                else if (yearDiff <= 2) score += 10;
                else if (yearDiff <= 5) score -= 20;
                else score -= 50;
            } catch (NumberFormatException e) {
                // Ignore
            }
        } else if (hasExpectedYear && !hasCandidateYear) {
            score -= 30; // Suspicious - incomplete entry
        }

        // ============================================
        // TITLE MATCHING
        // ============================================
        // Original title matching against expected originalTitle (very strong)
        if (candidate.getOriginalTitle() != null && expected.getOriginalTitle() != null 
                && !expected.getOriginalTitle().isBlank()) {
            String origLower = candidate.getOriginalTitle().toLowerCase().trim();
            String expOrigLower = expected.getOriginalTitle().toLowerCase().trim();
            
            if (origLower.equals(expOrigLower)) {
                score += 60;
            } else if (origLower.contains(expOrigLower) || expOrigLower.contains(origLower)) {
                score += 30;
            }
        }
        
        // Original title matching against expected title (medium)
        if (candidate.getOriginalTitle() != null && expected.getTitle() != null) {
            String origLower = candidate.getOriginalTitle().toLowerCase().trim();
            String expLower = expected.getTitle().toLowerCase().trim();
            
            String expMain = expLower;
            if (expMain.contains("(")) {
                expMain = expMain.substring(0, expMain.indexOf("(")).trim();
            }
            
            if (origLower.equals(expLower) || origLower.equals(expMain)) {
                score += 25;
            } else if (origLower.contains(expMain) && expMain.length() > 3) {
                score += 10;
            }
        }
        
        // Displayed title matching (medium)
        if (candidate.getTitle() != null && expected.getTitle() != null) {
            String titleLower = candidate.getTitle().toLowerCase().trim();
            String expLower = expected.getTitle().toLowerCase().trim();
            
            String expMain = expLower;
            if (expMain.contains("(")) {
                expMain = expMain.substring(0, expMain.indexOf("(")).trim();
            }
            
            if (titleLower.equals(expLower) || titleLower.equals(expMain)) {
                score += 20;
            } else if (titleLower.contains(expMain) && expMain.length() > 3) {
                score += 10;
            }
        }

        // European language word detection (for Latin script films)
        if (origTitle != null && expectedCountry != null && 
            !hasKorean && !hasChinese && !hasJapanese && !hasThai) {
            String country = expectedCountry.toLowerCase();
            String origLower = origTitle.toLowerCase();
            
            if (country.contains("german")) {
                if (origLower.contains("sein") || origLower.contains("das ") || 
                    origLower.contains("der ") || origLower.contains("die ") ||
                    origLower.contains("und ") || origLower.contains("mit ") ||
                    origLower.contains("letzte") || origLower.contains("neue")) {
                    score += 40;
                }
            }
            if (country.contains("france") || country.contains("french")) {
                if (origLower.contains("le ") || origLower.contains("la ") ||
                    origLower.contains("les ") || origLower.contains("des ") ||
                    origLower.contains("un ") || origLower.contains("une ")) {
                    score += 40;
                }
            }
        }

        // POPULARITY (minor tiebreaker only)
        if (candidate.getVoteCount() != null && candidate.getVoteCount() > 100) {
            score += Math.min(candidate.getVoteCount() / 500, 5);
        }
        
        // COMPLETENESS BONUS
        if (candidate.getOverview() != null && !candidate.getOverview().isBlank() 
                && candidate.getOverview().length() > 30) {
            score += 5;
        }
        if (candidate.getPosterUrl() != null && !candidate.getPosterUrl().isBlank()) {
            score += 5;
        }

        return score;
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

    // Get full TMDB details - tries movie first (most content is movies)
    // Falls back to TV if movie lookup fails
    private MovieResponse getFullDetails(MovieResponse partial) {
        if (partial == null) return null;
        
        // Try movie first
        try {
            MovieResponse movie = tmdbService.getMovieById(partial.getId(), "en");
            if (movie != null && movie.getTitle() != null && !movie.getTitle().isBlank()) {
                return movie;
            }
        } catch (Exception e) {
            // Not a movie ID, try TV
        }
        
        // Try TV show
        try {
            MovieResponse tv = tmdbService.getTvShowById(partial.getId(), "en");
            if (tv != null && tv.getTitle() != null && !tv.getTitle().isBlank()) {
                return tv;
            }
        } catch (Exception e) {
            // Not a TV ID either
        }
        
        // Both failed - return partial data (still has ID, title, year)
        log.warn("Could not enrich details for id {}, using search result", partial.getId());
        return partial;
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

    // Handle follow-up questions about a movie
    // Detects if the question is asking for similar/recommended movies
    // and returns multiple movie cards
    private ChatResponse answerFollowUp(ChatRequest request) {
        ChatRequest.MovieContext context = request.getMovieContext();
        String question = request.getMessage().toLowerCase();
        String language = request.getLanguage();
        
        // Detect if user is asking for similar/recommended movies
        boolean askingForSimilar = question.contains("similar") ||
            question.contains("recommend") ||
            question.contains("suggestion") ||
            question.contains("like this") ||
            question.contains("more like") ||
            question.contains("แนะนำ") ||           // Thai: recommend
            question.contains("คล้าย") ||          // Thai: similar
            question.contains("ဆင်တူ") ||          // Burmese: similar
            question.contains("ညွှန်း");            // Burmese: recommend
        
        if (askingForSimilar && context != null && context.getEffectiveId() != null) {
            return handleSimilarMoviesRequest(context, request);
        }
        
        // Regular follow-up question
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
    
        // Handle "similar movies" request by fetching real similar movies from TMDB
    private ChatResponse handleSimilarMoviesRequest(
            ChatRequest.MovieContext context, 
            ChatRequest request) {
        
        String language = request.getLanguage();
        Long movieId = context.getEffectiveId();
        
        log.info("User asking for similar movies to: {} (id: {})", 
            context.getTitle(), movieId);
        
        if (movieId == null) {
            log.warn("No valid movie ID, using Gemini + search fallback");
            return getGeminiRecommendationsAndSearch(context, request);
        }
        
        // Try to get similar movies from TMDB as a MOVIE
        List<MovieResponse> similarMovies = new ArrayList<>();
        try {
            similarMovies = tmdbService.getSimilarMovies(movieId, "en", 5);
            log.info("TMDB /movie/{}/similar returned {} results", movieId, similarMovies.size());
        } catch (Exception e) {
            log.warn("Failed to get similar movies: {}", e.getMessage());
        }
        
        // If no results, ALWAYS use Gemini + search (don't return text-only)
        if (similarMovies.isEmpty()) {
            log.info("TMDB has no similar movies for id {}, using Gemini + search", movieId);
            return getGeminiRecommendationsAndSearch(context, request);
        }
        
        // Get full details for each similar movie
        List<MovieResponse> detailedMovies = new ArrayList<>();
        for (MovieResponse movie : similarMovies) {
            try {
                MovieResponse full = tmdbService.getMovieById(movie.getId(), "en");
                if (full != null && full.getTitle() != null) {
                    detailedMovies.add(full);
                }
                if (detailedMovies.size() >= 5) break;
            } catch (Exception e) {
                log.warn("Failed to get details for movie {}: {}", movie.getId(), e.getMessage());
            }
        }
        
        if (detailedMovies.isEmpty()) {
            log.info("No detailed movies retrieved, falling back to Gemini + search");
            return getGeminiRecommendationsAndSearch(context, request);
        }
        
        log.info("Returning {} similar movies as candidates", detailedMovies.size());
        return buildSimilarMoviesResponse(context.getTitle(), detailedMovies, language, request);
    }
    
    // Get recommendations from Gemini, then search each one in TMDB
    // This ensures we return real MovieDto objects (not just text)
    private ChatResponse getGeminiRecommendationsAndSearch(
            ChatRequest.MovieContext context, 
            ChatRequest request) {
        
        String language = request.getLanguage();
        String originalTitle = context.getTitle();
        String originalYear = context.getYear() != null ? context.getYear() : "unknown";
        
        log.info("Asking Gemini for 5 movie titles similar to: {} ({})", originalTitle, originalYear);
        
        // Ask Gemini for structured recommendations
        String prompt = String.format("""
            Recommend exactly 5 movies similar to "%s" (%s).
            
            Return ONLY a JSON array (no markdown, no explanation):
            [
              {"title": "Movie Title 1", "year": "2020"},
              {"title": "Movie Title 2", "year": "2019"},
              {"title": "Movie Title 3", "year": "2018"},
              {"title": "Movie Title 4", "year": "2017"},
              {"title": "Movie Title 5", "year": "2016"}
            ]
            
            Rules:
            - Return REAL existing movies (verify they exist)
            - Use English international titles (searchable on TMDB)
            - Include the release year
            - Similar theme, genre, or emotional tone to "%s"
            - Popular enough to be in TMDB database
            - Return ONLY the JSON array, nothing else
            """,
            originalTitle, originalYear, originalTitle
        );
        
        String geminiResponse = geminiService.chat(prompt, "en", null, null);
        log.debug("Gemini raw response: {}", geminiResponse);
        
        // Parse Gemini's JSON response
        List<PossibleMovie> recommendations = parseSimpleRecommendations(geminiResponse);
        
        if (recommendations.isEmpty()) {
            log.warn("Could not parse Gemini recommendations, returning text response");
            return buildTextOnlyRecommendations(context, request);
        }
        
        log.info("Gemini recommended {} movies, searching TMDB", recommendations.size());
        
        // Search TMDB for each recommendation
        List<MovieResponse> foundMovies = new ArrayList<>();
        for (PossibleMovie rec : recommendations) {
            log.info("Searching TMDB for: {} ({})", rec.getTitle(), rec.getYear());
            try {
                MovieResponse found = smartTmdbSearch(rec.getTitle(), false);
                if (found != null && found.getTitle() != null) {
                    foundMovies.add(found);
                    log.info("Found: {} ({})", found.getTitle(), found.getYear());
                }
                if (foundMovies.size() >= 5) break;
            } catch (Exception e) {
                log.warn("Failed to search '{}': {}", rec.getTitle(), e.getMessage());
            }
        }
        
        if (foundMovies.isEmpty()) {
            log.warn("None of the recommended movies found in TMDB");
            return buildTextOnlyRecommendations(context, request);
        }
        
        log.info("Found {} recommended movies in TMDB", foundMovies.size());
        return buildSimilarMoviesResponse(originalTitle, foundMovies, language, request);
    }
    
    // Parse simple JSON array of recommendations
    private List<PossibleMovie> parseSimpleRecommendations(String response) {
        List<PossibleMovie> results = new ArrayList<>();
        try {
            String json = response
                .replaceAll("```json\\s*", "")
                .replaceAll("```\\s*", "")
                .trim();
            
            int start = json.indexOf('[');
            int end = json.lastIndexOf(']');
            if (start < 0 || end <= start) {
                log.warn("No JSON array found in Gemini response");
                return results;
            }
            
            json = json.substring(start, end + 1);
            log.debug("Parsing JSON: {}", json);
            
            JsonNode array = objectMapper.readTree(json);
            if (array.isArray()) {
                for (JsonNode node : array) {
                    String title = node.path("title").asText("").trim();
                    if (!title.isEmpty() && !title.equalsIgnoreCase("null")) {
                        results.add(PossibleMovie.builder()
                            .title(title)
                            .year(node.path("year").asText(""))
                            .build());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse recommendations JSON: {}", e.getMessage());
        }
        return results;
    }
    
    // Build the response with candidates (used for both TMDB and Gemini paths)
    private ChatResponse buildSimilarMoviesResponse(
            String originalTitle,
            List<MovieResponse> movies,
            String language,
            ChatRequest request) {
        
        String reply = buildSimilarMoviesReply(originalTitle, movies, language);
        
        List<ChatResponse.MovieDto> candidateDtos = movies.stream()
            .map(this::toMovieDto)
            .toList();
        
        // Get streaming for the first movie as preview
        List<MovieResponse.StreamingProvider> streaming = null;
        try {
            streaming = tmdbService.getStreamingProviders(movies.get(0).getId(), "TH");
        } catch (Exception e) {
            log.warn("Failed to get streaming: {}", e.getMessage());
        }
        
        return ChatResponse.builder()
            .reply(reply)
            .conversationId(request.getConversationId())
            .candidates(candidateDtos)
            .streamingInfo(streaming != null ? toStreamingDtos(streaming) : null)
            .analysisMethod("similar_movies")
            .contentType("RECOMMENDATIONS")
            .confidenceScore(80)
            .confidenceLevel("LIKELY")
            .suggestions(getFollowUpSuggestions(language))
            .language(language)
            .build();
    }
    
    // Last resort: return text-only response from Gemini
    private ChatResponse buildTextOnlyRecommendations(
            ChatRequest.MovieContext context, 
            ChatRequest request) {
        String aiResponse = geminiService.answerMovieQuestion(
            request.getMessage(), context.getTitle(), context.getYear(),
            request.getLanguage(), request.getHistory()
        );
        
        return ChatResponse.builder()
            .reply(aiResponse)
            .conversationId(request.getConversationId())
            .analysisMethod("similar_movies_text")
            .suggestions(getFollowUpSuggestions(request.getLanguage()))
            .language(request.getLanguage())
            .build();
    }
    
    // Simple intro text - the detailed info is shown in candidates cards
    private String buildSimilarMoviesReply(String originalMovie, List<MovieResponse> movies, String language) {
        return switch (language) {
            case "th" -> String.format(
                "ถ้าคุณชอบ **\"%s\"** ลองดูหนัง %d เรื่องที่คล้ายกันด้านล่างนี้:", 
                originalMovie, movies.size()
            );
            case "my" -> String.format(
                "**\"%s\"** ကို နှစ်သက်ပါက အောက်ပါ ဆင်တူသော ရုပ်ရှင် %d ခုကို ကြည့်ကြပါ:", 
                originalMovie, movies.size()
            );
            default -> String.format(
                "Since you enjoyed **\"%s\"**, here are %d similar movies you might like:",
                originalMovie, movies.size()
            );
        };
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