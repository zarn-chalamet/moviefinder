package com.moviefinder.dto.request;

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
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MovieContext {
        private Long tmdbId;
        private String title;
        private String year;
    }
}
