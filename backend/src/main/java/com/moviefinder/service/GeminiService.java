package com.moviefinder.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

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
     * Send a message to Gemini AI and get a response
     */
    public String chat(String userMessage, String language, String context) {
        try {
            String systemPrompt = buildSystemPrompt(language, context);
            String fullPrompt = systemPrompt + "\n\nUser: " + userMessage;

            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of(
                        "parts", List.of(
                            Map.of("text", fullPrompt)
                        )
                    )
                ),
                "generationConfig", Map.of(
                    "temperature", 0.7,
                    "topK", 40,
                    "topP", 0.95,
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
            log.error("Error calling Gemini API: {}", e.getMessage());
            return getErrorMessage(language);
        }
    }

    /**
     * Identify a movie from video metadata
     */
    public String identifyMovie(String videoTitle, String videoDescription, String hashtags, String language) {
        String prompt = String.format("""
            You are a movie identification expert. Based on the following video metadata, identify the movie or TV show being referenced.
            
            Video Title: %s
            Video Description: %s
            Hashtags: %s
            
            If you can identify the movie:
            1. State the movie name, year, and brief description
            2. Provide key details (director, main cast, genre)
            3. Give a confidence level (high/medium/low)
            
            If you cannot identify it:
            1. Explain why
            2. Ask for more details if needed
            
            Respond in %s language.
            Format your response in a friendly, conversational way with emojis.
            """, 
            videoTitle, 
            videoDescription, 
            hashtags,
            getLanguageName(language)
        );

        return chat(prompt, language, null);
    }

    /**
     * Answer a follow-up question about a movie
     */
    public String answerMovieQuestion(String question, String movieTitle, String movieYear, String language) {
        String context = String.format("The user is asking about the movie '%s' (%s).", movieTitle, movieYear);
        return chat(question, language, context);
    }

    private String buildSystemPrompt(String language, String context) {
        String langInstruction = switch (language) {
            case "th" -> "Respond in Thai (ภาษาไทย). Be friendly and use Thai expressions.";
            case "my" -> "Respond in Burmese (မြန်မာဘာသာ). Be friendly and respectful.";
            default -> "Respond in English. Be friendly and helpful.";
        };

        String systemPrompt = String.format("""
            You are MovieFinder AI, an expert at identifying movies from social media clips.
            You help users in Myanmar and Thailand find movies they've seen on TikTok, Facebook, Instagram, or YouTube.
            
            %s
            
            Guidelines:
            - Be conversational and friendly
            - Use emojis to make responses engaging
            - When identifying a movie, provide: title, year, rating, genre, brief plot
            - Always mention where to watch (Netflix, Disney+, free sites)
            - If unsure, ask clarifying questions
            - Support questions about streaming availability in Thailand
            """, langInstruction);

        if (context != null && !context.isEmpty()) {
            systemPrompt += "\n\nContext: " + context;
        }

        return systemPrompt;
    }

    private String extractTextFromResponse(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode candidates = root.path("candidates");
            
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode content = candidates.get(0).path("content");
                JsonNode parts = content.path("parts");
                
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

    private String getLanguageName(String code) {
        return switch (code) {
            case "th" -> "Thai";
            case "my" -> "Burmese";
            default -> "English";
        };
    }

    private String getErrorMessage(String language) {
        return switch (language) {
            case "th" -> "❌ ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
            case "my" -> "❌ ဝမ်းနည်းပါတယ်၊ တစ်ခုခုမှားနေပါသည်။ ထပ်ကြိုးစားပါ။";
            default -> "❌ Sorry, something went wrong. Please try again.";
        };
    }
}
