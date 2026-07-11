package com.moviefinder.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moviefinder.dto.request.ChatRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeminiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${api.gemini.api-key}")
    private String apiKey;

    @Value("${api.gemini.base-url}")
    private String baseUrl;

    @Value("${api.gemini.model}")
    private String model;

    public GeminiService(WebClient webClient, ObjectMapper objectMapper) {
        this.webClient = webClient;
        this.objectMapper = objectMapper;
    }

    // Content classification result
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContentClassification {
        private String contentType;
        private String mediaType;
        private String language;
        private int confidence;
        private String reasoning;
        private boolean isChineseShortDrama;
        private boolean hasExplicitTitle;
        private String explicitTitle;
        private List<String> possibleTitles;

        public static ContentClassification unknown() {
            return ContentClassification.builder()
                .contentType("UNKNOWN")
                .mediaType("UNKNOWN")
                .language("unknown")
                .confidence(0)
                .isChineseShortDrama(false)
                .hasExplicitTitle(false)
                .possibleTitles(List.of())
                .build();
        }

        public boolean isRecapVideo() {
            return "RECAP_VIDEO".equals(contentType);
        }

        public boolean isKorean() {
            return "korean".equals(language);
        }

        public boolean isChinese() {
            return "chinese".equals(language);
        }

        public boolean isTvSeries() {
            return "TV_SERIES".equals(mediaType);
        }
    }

    // Video context info to help classification
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VideoContext {
        private double durationSeconds;
        private int width;
        private int height;
        private boolean hasAudio;
        private boolean isVertical;

        public String getDurationDescription() {
            if (durationSeconds < 60) return String.format("%.0f seconds (very short)", durationSeconds);
            if (durationSeconds < 180) return String.format("%.1f minutes (short clip)", durationSeconds / 60);
            if (durationSeconds < 600) return String.format("%.1f minutes (medium - likely recap)", durationSeconds / 60);
            return String.format("%.1f minutes (long form)", durationSeconds / 60);
        }
    }

    public String chat(String userMessage, String language, String context, List<ChatRequest.Message> history) {
        try {
            List<Map<String, Object>> contents = new ArrayList<>();

            String systemPrompt = buildSystemPrompt(language, context);
            contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", systemPrompt))
            ));
            contents.add(Map.of(
                "role", "model",
                "parts", List.of(Map.of("text", "Understood. I am MovieFinder AI, ready to help identify movies and shows."))
            ));

            if (history != null) {
                for (ChatRequest.Message msg : history) {
                    contents.add(Map.of(
                        "role", msg.getRole().equals("user") ? "user" : "model",
                        "parts", List.of(Map.of("text", msg.getContent()))
                    ));
                }
            }

            contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", userMessage))
            ));

            Map<String, Object> requestBody = Map.of(
                "contents", contents,
                "generationConfig", Map.of(
                    "temperature", 0.7,
                    "topK", 40,
                    "topP", 0.95,
                    "maxOutputTokens", 4096
                )
            );

            String url = baseUrl + "/models/" + model + ":generateContent?key=" + apiKey;

            String response = webClient.post()
                    .uri(url)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return extractTextFromResponse(response);

        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage());
            return getErrorMessage(language);
        }
    }

    // Updated classifier - now accepts VideoContext with duration info
    // Duration is critical: recap videos are 3+ minutes, scene clips are under 2 minutes
    public ContentClassification classifyContent(String title, String description,
                                                  String hashtags, String language,
                                                  VideoContext videoContext) {
        String durationInfo = "";
        if (videoContext != null) {
            durationInfo = String.format("""

                VIDEO TECHNICAL INFO:
                Duration: %s
                Resolution: %dx%d
                Has audio: %s
                Vertical format: %s

                DURATION-BASED HINTS:
                - Videos under 2 minutes with no narration = SCENE_CLIP
                - Videos 3-15 minutes with narration = RECAP_VIDEO (very likely)
                - Videos 1-2 minutes with fast cuts = TRAILER
                - Very short vertical videos (under 90s) = SHORTS or CHINESE_SHORT_DRAMA
                """,
                videoContext.getDurationDescription(),
                videoContext.getWidth(),
                videoContext.getHeight(),
                videoContext.isHasAudio(),
                videoContext.isVertical()
            );
        }

        String prompt = String.format("""
            Classify this social media video based on its metadata.

            METADATA:
            Title: %s
            Description: %s
            Hashtags: %s
            %s

            CRITICAL RULES:
            1. Facebook page names like "RANGo", "MovieRecap", "FilmChannel" are CREATOR names, NOT movie titles
            2. Common patterns to ignore as movie titles:
               - Text after "|" at the end (e.g., "... | ChannelName")
               - Text like "views", "reactions", "likes" in title
               - Generic words like "reels", "shorts", "video"
            3. Look for ACTUAL movie titles - specific proper nouns that could be searched on TMDB
            4. Video duration is a STRONG signal for content type

            Respond with ONLY valid JSON (no markdown, no code blocks):
            {
              "contentType": "RECAP_VIDEO or SCENE_CLIP or TRAILER or CHINESE_SHORT_DRAMA or ANIME or UNKNOWN",
              "mediaType": "MOVIE or TV_SERIES or UNKNOWN",
              "language": "korean or chinese or japanese or thai or burmese or english or unknown",
              "confidence": 0 to 100,
              "reasoning": "one sentence including duration reasoning",
              "possibleTitles": ["actual movie titles from metadata, NOT channel names"],
              "isChineseShortDrama": true or false,
              "hasExplicitTitle": true or false,
              "explicitTitle": "the actual movie title mentioned, or null if only channel names present"
            }

            Content type definitions:
            RECAP_VIDEO: Someone narrating/reviewing a movie over clips (usually 3+ min)
            SCENE_CLIP: Direct scene from original (usually under 2 min)
            TRAILER: Official or fan-made trailer (usually 1-2 min with cuts)
            CHINESE_SHORT_DRAMA: Chinese vertical short drama (very short vertical episodes)
            ANIME: Japanese animation
            UNKNOWN: Cannot determine

            Signs of Chinese short drama:
            - CEO or billionaire or contract marriage or revenge plot
            - Vertical format (height > width)
            - Very short (under 3 minutes)
            - Chinese names or Chinese production markers

            EXAMPLES OF WHAT NOT TO DO:
            - Title "135K views | #comedy | RANGo" - "RANGo" is CHANNEL NAME, do not use as title
            - Description "#comedy #fyp #viral" - these are just tags, no movie title here
            - Title "Amazing scene | MovieRecap" - "MovieRecap" is channel, not movie
            """,
            title != null ? title : "N/A",
            description != null ? description : "N/A",
            hashtags != null ? hashtags : "N/A",
            durationInfo
        );

        try {
            String response = callGeminiDirect(prompt, 0.1);
            return parseClassification(response);
        } catch (Exception e) {
            log.error("Classification failed: {}", e.getMessage());
            return ContentClassification.unknown();
        }
    }

    // Backward compatible version
    public ContentClassification classifyContent(String title, String description,
                                                  String hashtags, String language) {
        return classifyContent(title, description, hashtags, language, null);
    }

    public String identifyFromMetadata(String videoTitle, String videoDescription,
                                        String hashtags, String language,
                                        ContentClassification classification) {

        String classificationContext = "";
        if (classification != null) {
            classificationContext = String.format("""
                Content already classified as:
                Type: %s
                Media: %s
                Language: %s
                """,
                classification.getContentType(),
                classification.getMediaType(),
                classification.getLanguage()
            );
        }

        String prompt = String.format("""
            You are a movie identification expert.

            VIDEO METADATA:
            Title: %s
            Description: %s
            Hashtags: %s

            %s

            IMPORTANT: Facebook page names (RANGo, MovieRecap, etc) are CHANNEL names, not movie titles.
            Ignore text after "|" symbol - it is usually the channel/creator name.

            The title or description may be in Burmese or Thai.

            RULES:
            Use the English title in your response
            If uncertain, say so honestly
            Do NOT guess or hallucinate
            Channel names are NOT movie titles

            Respond with ONLY valid JSON:
            {
              "identified": true or false,
              "confidence": 0 to 100,
              "title": "English title or null",
              "year": "2024 or null",
              "type": "movie or tv_series or unknown",
              "genre": ["Drama"],
              "reasoning": "why",
              "alternativeTitles": [],
              "needsMoreInfo": "what would help"
            }
            """,
            videoTitle != null ? videoTitle : "N/A",
            videoDescription != null ? videoDescription : "N/A",
            hashtags != null ? hashtags : "N/A",
            classificationContext
        );

        try {
            return callGeminiDirect(prompt, 0.2);
        } catch (Exception e) {
            log.error("identifyFromMetadata failed: {}", e.getMessage());
            return "{\"identified\": false, \"confidence\": 0}";
        }
    }

    public String formatMovieResponse(String movieTitle, String year, String type,
                                       List<String> genres, List<String> cast,
                                       String overview, String director,
                                       String identificationMethod,
                                       int confidenceScore,
                                       String language) {

        String langInstruction = switch (language) {
            case "th" -> "Respond in Thai language";
            case "my" -> "Respond in Burmese language";
            default -> "Respond in English";
        };

        String genreText = genres != null ? String.join(", ", genres) : "Unknown";
        String castText = cast != null ? String.join(", ", cast) : "Unknown";
        String directorText = director != null ? director : "Unknown";
        String overviewText = overview != null ? overview : "No overview available";

        String prompt = String.format("""
            Create a friendly movie identification response for the user.

            %s

            Movie details from TMDB database. Use these exact facts:
            Title: %s
            Year: %s
            Type: %s
            Genres: %s
            Director: %s
            Cast: %s
            Overview: %s
            Identified via: %s
            Confidence: %d percent

            Format with emojis. Keep under 200 words.
            Do NOT add information not provided above.
            """,
            langInstruction,
            movieTitle, year, type,
            genreText, directorText, castText, overviewText,
            identificationMethod, confidenceScore
        );

        return chat(prompt, language, null, null);
    }

    public String answerMovieQuestion(String question, String movieTitle, String movieYear,
                                       String language, List<ChatRequest.Message> history) {
        String context = String.format("The user is asking about the movie or show '%s' (%s).",
            movieTitle, movieYear);
        return chat(question, language, context, history);
    }

    private ContentClassification parseClassification(String response) {
        try {
            String json = response
                .replaceAll("```json\\s*", "")
                .replaceAll("```\\s*", "")
                .trim();

            int start = json.indexOf('{');
            int end = json.lastIndexOf('}');
            if (start >= 0 && end > start) {
                json = json.substring(start, end + 1);
            }

            JsonNode node = objectMapper.readTree(json);

            List<String> possibleTitles = new ArrayList<>();
            JsonNode titlesNode = node.path("possibleTitles");
            if (titlesNode.isArray()) {
                for (JsonNode t : titlesNode) {
                    String titleVal = t.asText("").trim();
                    if (!titleVal.isEmpty() && !titleVal.equals("null")) {
                        possibleTitles.add(titleVal);
                    }
                }
            }

            String explicitTitle = node.path("explicitTitle").asText(null);
            if ("null".equals(explicitTitle) || "".equals(explicitTitle)) {
                explicitTitle = null;
            }

            return ContentClassification.builder()
                .contentType(node.path("contentType").asText("UNKNOWN"))
                .mediaType(node.path("mediaType").asText("UNKNOWN"))
                .language(node.path("language").asText("unknown"))
                .confidence(node.path("confidence").asInt(0))
                .reasoning(node.path("reasoning").asText(""))
                .isChineseShortDrama(node.path("isChineseShortDrama").asBoolean(false))
                .hasExplicitTitle(node.path("hasExplicitTitle").asBoolean(false))
                .explicitTitle(explicitTitle)
                .possibleTitles(possibleTitles)
                .build();

        } catch (Exception e) {
            log.error("Failed to parse classification JSON: {}", e.getMessage());
            log.debug("Raw classification response was: {}", response);
            return ContentClassification.unknown();
        }
    }

    private String callGeminiDirect(String prompt, double temperature) {
        try {
            List<Map<String, Object>> contents = new ArrayList<>();
            contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", prompt))
            ));

            Map<String, Object> requestBody = Map.of(
                "contents", contents,
                "generationConfig", Map.of(
                    "temperature", temperature,
                    "topK", 32,
                    "topP", 0.9,
                    "maxOutputTokens", 2048
                )
            );

            String url = baseUrl + "/models/" + model + ":generateContent?key=" + apiKey;

            String response = webClient.post()
                    .uri(url)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return extractTextFromResponse(response);

        } catch (Exception e) {
            log.error("Direct Gemini call failed: {}", e.getMessage());
            throw new RuntimeException("Gemini call failed: " + e.getMessage());
        }
    }

    private String buildSystemPrompt(String language, String context) {
        String langInstruction = switch (language) {
            case "th" -> "Respond in Thai language. Be friendly.";
            case "my" -> "Respond in Burmese language. Be friendly and respectful.";
            default -> "Respond in English. Be friendly and helpful.";
        };

        String systemPrompt = String.format("""
            You are MovieFinder AI, expert at identifying movies from social media clips.

            %s

            Guidelines:
            Be friendly and use emojis
            Use English/international titles
            Provide title, year, type, genre, cast, plot
            Mention Netflix, Disney Plus, TrueID for streaming
            Support Burmese, Thai, English, Korean content
            """, langInstruction);

        if (context != null && !context.isEmpty()) {
            systemPrompt += "\n\nContext: " + context;
        }

        return systemPrompt;
    }

    private String extractTextFromResponse(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);

            if (root.has("error")) {
                String msg = root.path("error").path("message").asText();
                log.error("Gemini error: {}", msg);
                return "API error: " + msg;
            }

            JsonNode candidates = root.path("candidates");

            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode candidate = candidates.get(0);

                String finishReason = candidate.path("finishReason").asText();
                if ("MAX_TOKENS".equals(finishReason)) {
                    log.warn("Response truncated due to MAX_TOKENS");
                }
                if ("SAFETY".equals(finishReason)) {
                    log.warn("Response blocked by safety filter");
                    return "Content was blocked by safety filter.";
                }

                JsonNode parts = candidate.path("content").path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    return parts.get(0).path("text").asText();
                }
            }

            return "Sorry, I could not process that request.";
        } catch (Exception e) {
            log.error("Error parsing Gemini response: {}", e.getMessage());
            return "Sorry, there was an error processing the response.";
        }
    }

    private String getErrorMessage(String language) {
        return switch (language) {
            case "th" -> "Sorry, something went wrong. Please try again.";
            case "my" -> "Sorry, something went wrong. Please try again.";
            default -> "Sorry, something went wrong. Please try again.";
        };
    }
}