package com.moviefinder.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moviefinder.dto.request.ChatRequest;

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

    /**
     * Send a message to Gemini AI with system prompt injection
     */
    public String chat(String userMessage, String language, String context, List<ChatRequest.Message> history) {
        try {
            List<Map<String, Object>> contents = new ArrayList<>();
            
            // Inject system prompt as first conversation turn
            String systemPrompt = buildSystemPrompt(language, context);
            contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", systemPrompt))
            ));
            contents.add(Map.of(
                "role", "model",
                "parts", List.of(Map.of("text", "Understood! I'm MovieFinder AI, ready to help identify movies and shows. 🎬"))
            ));
            
            // Add history
            if (history != null) {
                for (ChatRequest.Message msg : history) {
                    contents.add(Map.of(
                        "role", msg.getRole().equals("user") ? "user" : "model",
                        "parts", List.of(Map.of("text", msg.getContent()))
                    ));
                }
            }

            // Add current message
            contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", userMessage))
            ));

            // Increased tokens
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

    /**
     * Identify a movie from video metadata with strict format
     */
    public String identifyMovie(String videoTitle, String videoDescription, String hashtags, String language, List<ChatRequest.Message> history) {
        String langInstruction = switch (language) {
            case "th" -> "Respond in Thai (ภาษาไทย)";
            case "my" -> "Respond in Burmese (မြန်မာဘာသာ)";
            default -> "Respond in English";
        };

        String prompt = String.format("""
            You are a movie/TV show identification expert.
            
            VIDEO METADATA:
            Title: %s
            Description: %s
            Hashtags: %s
            
            %s.
            
            CRITICAL RULES:
            1. Use the ENGLISH/INTERNATIONAL title (NOT Korean/Chinese/Japanese characters)
               Example: "Your Honor" NOT "유어 아너"
            2. The title may be in Burmese/Thai - translate it to identify the movie
            3. NO long preambles - start directly with the format
            
            If you can identify it, respond in EXACTLY this format:
            
            🎬 **[English Title] (Year)**
            
            📺 **Type:** Movie or TV Series
            🎭 **Genre:** [genres]
            ⭐ **Cast:** [main actors]
            📖 **Plot:** [2-3 sentence description]
            🎯 **Confidence:** High / Medium / Low
            💡 **Why:** [Brief reason - which metadata clue helped]
            
            If you CANNOT identify confidently:
            
            ❌ **Could not identify**
            📝 [What the metadata suggests]
            ❓ [What additional info would help]
            
            Keep response under 250 words.
            """, 
            videoTitle != null ? videoTitle : "N/A", 
            videoDescription != null ? videoDescription : "N/A", 
            hashtags != null ? hashtags : "N/A",
            langInstruction
        );

        return chat(prompt, language, null, history);
    }

    /**
     * Answer a follow-up question about a movie
     */
    public String answerMovieQuestion(String question, String movieTitle, String movieYear, String language, List<ChatRequest.Message> history) {
        String context = String.format("The user is asking about the movie/show '%s' (%s).", movieTitle, movieYear);
        return chat(question, language, context, history);
    }

    private String buildSystemPrompt(String language, String context) {
        String langInstruction = switch (language) {
            case "th" -> "Respond in Thai (ภาษาไทย). Be friendly and use Thai expressions.";
            case "my" -> "Respond in Burmese (မြန်မာဘာသာ). Be friendly and respectful.";
            default -> "Respond in English. Be friendly and helpful.";
        };

        String systemPrompt = String.format("""
            You are MovieFinder AI, an expert at identifying movies and TV shows from social media clips.
            You help users in Myanmar and Thailand find content they've seen on TikTok, Facebook, Instagram, or YouTube.
            
            %s
            
            Guidelines:
            - Be conversational and friendly
            - Use emojis to make responses engaging
            - When identifying, ALWAYS use English/international titles (not Korean/Chinese characters)
            - Provide: title, year, type (movie/TV), genre, cast, plot
            - Mention where to watch (Netflix, Disney+, TrueID, etc.)
            - If unsure, ask clarifying questions
            - Support Burmese, Thai, English content
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
                
                JsonNode parts = candidate.path("content").path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    return parts.get(0).path("text").asText();
                }
            }
            
            return "Sorry, I couldn't process that request.";
        } catch (Exception e) {
            log.error("Error parsing Gemini response: {}", e.getMessage());
            return "Sorry, there was an error processing the response.";
        }
    }

    private String getErrorMessage(String language) {
        return switch (language) {
            case "th" -> "❌ ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
            case "my" -> "❌ ဝမ်းနည်းပါတယ်၊ တစ်ခုခုမှားနေပါသည်။ ထပ်ကြိုးစားပါ။";
            default -> "❌ Sorry, something went wrong. Please try again.";
        };
    }
}