package com.moviefinder.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Health", description = "Health check endpoints")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if the API is running")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "timestamp", LocalDateTime.now().toString(),
                "service", "MovieFinder API",
                "version", "1.0.0"
        ));
    }

    @GetMapping
    @Operation(summary = "API Info", description = "Get API information")
    public ResponseEntity<Map<String, Object>> info() {
        return ResponseEntity.ok(Map.of(
                "name", "MovieFinder API",
                "version", "1.0.0",
                "description", "AI-powered movie finder for Myanmar & Thai audiences",
                "endpoints", Map.of(
                        "chat", "/api/v1/chat",
                        "movies", "/api/v1/movies",
                        "swagger", "/swagger-ui.html"
                )
        ));
    }
}
