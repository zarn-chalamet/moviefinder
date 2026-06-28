package com.moviefinder.controller;

import com.moviefinder.dto.request.AnalyzeUrlRequest;
import com.moviefinder.dto.request.ChatRequest;
import com.moviefinder.dto.response.ApiResponse;
import com.moviefinder.dto.response.ChatResponse;
import com.moviefinder.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Chat", description = "AI Chat endpoints for movie identification")
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/send")
    @Operation(summary = "Send a chat message", description = "Send a message to AI for movie identification or follow-up questions")
    public ResponseEntity<ApiResponse<ChatResponse>> sendMessage(
            @Valid @RequestBody ChatRequest request
    ) {
        log.info("Received chat message: {}", request.getMessage().substring(0, Math.min(50, request.getMessage().length())));
        
        try {
            ChatResponse response = chatService.sendMessage(request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error processing chat message: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to process message", e.getMessage()));
        }
    }

    @PostMapping("/analyze-url")
    @Operation(summary = "Analyze a social media URL", description = "Analyze TikTok, Facebook, Instagram, or YouTube URL to identify the movie")
    public ResponseEntity<ApiResponse<ChatResponse>> analyzeUrl(
            @Valid @RequestBody AnalyzeUrlRequest request
    ) {
        log.info("Analyzing URL: {}", request.getUrl());
        
        try {
            ChatResponse response = chatService.analyzeUrl(request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error analyzing URL: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to analyze URL", e.getMessage()));
        }
    }

    @PostMapping(value = "/analyze-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Analyze an image/screenshot", description = "Upload a screenshot to identify the movie (coming soon)")
    public ResponseEntity<ApiResponse<ChatResponse>> analyzeImage(
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "language", defaultValue = "en") String language
    ) {
        log.info("Analyzing image: {} ({} bytes)", image.getOriginalFilename(), image.getSize());
        
        // TODO: Implement image analysis with Gemini Vision
        // For now, return a placeholder response
        ChatResponse response = ChatResponse.builder()
                .reply("🖼️ Image analysis feature is coming soon! For now, try pasting a video URL or describing the movie scene.")
                .suggestions(java.util.List.of(
                        "Paste a TikTok link",
                        "Describe the scene you saw",
                        "Tell me the actors you remember"
                ))
                .language(language)
                .build();
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
