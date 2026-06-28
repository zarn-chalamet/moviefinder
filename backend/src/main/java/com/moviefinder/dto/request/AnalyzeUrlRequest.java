package com.moviefinder.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyzeUrlRequest {
    
    @NotBlank(message = "URL cannot be empty")
    @Pattern(
        regexp = "^https?://.*",
        message = "Invalid URL format"
    )
    private String url;
    
    @Builder.Default
    private String language = "en";
}
