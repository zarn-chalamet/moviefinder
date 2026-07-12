package com.moviefinder.dto.request;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    
    @NotBlank(message = "Message cannot be empty")
    private String message;
    
    @Builder.Default
    private String language = "en";
    
    private String conversationId;
    
    private MovieContext movieContext;
    
    private List<Message> history;

    // Accept extra fields from frontend without failing
    // Frontend sends full Movie object, we only need a few fields
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MovieContext {
        private Long tmdbId;
        private Long id;     
        private String title;
        private String year;
        
        // Helper: returns tmdbId if present, otherwise id
        public Long getEffectiveId() {
            return tmdbId != null ? tmdbId : id;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Message {
        private String role;
        private String content;
    }
}