package com.moviefinder.dto.request;

import java.util.List;

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

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MovieContext {
        private Long tmdbId;
        private String title;
        private String year;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Message {
        private String role;
        private String content;
    }
}
