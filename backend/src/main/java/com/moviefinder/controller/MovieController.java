package com.moviefinder.controller;

import com.moviefinder.dto.response.ApiResponse;
import com.moviefinder.dto.response.MovieResponse;
import com.moviefinder.service.TmdbService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/movies")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Movies", description = "Movie search and details endpoints")
public class MovieController {

    private final TmdbService tmdbService;

    @GetMapping("/search")
    @Operation(summary = "Search movies", description = "Search for movies by title or keywords")
    public ResponseEntity<ApiResponse<List<MovieResponse>>> searchMovies(
            @Parameter(description = "Search query") @RequestParam("q") String query,
            @Parameter(description = "Language (en, th, my)") @RequestParam(value = "lang", defaultValue = "en") String language
    ) {
        log.info("Searching movies: {} (lang: {})", query, language);
        
        try {
            List<MovieResponse> movies = tmdbService.searchMovies(query, language);
            return ResponseEntity.ok(ApiResponse.success(movies));
        } catch (Exception e) {
            log.error("Error searching movies: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to search movies", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get movie details", description = "Get detailed information about a specific movie")
    public ResponseEntity<ApiResponse<MovieResponse>> getMovieById(
            @Parameter(description = "TMDB Movie ID") @PathVariable Long id,
            @Parameter(description = "Language (en, th, my)") @RequestParam(value = "lang", defaultValue = "en") String language
    ) {
        log.info("Getting movie details: {} (lang: {})", id, language);
        
        try {
            MovieResponse movie = tmdbService.getMovieById(id, language);
            if (movie == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(ApiResponse.success(movie));
        } catch (Exception e) {
            log.error("Error getting movie details: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to get movie details", e.getMessage()));
        }
    }

    @GetMapping("/{id}/streaming")
    @Operation(summary = "Get streaming providers", description = "Get available streaming platforms for a movie")
    public ResponseEntity<ApiResponse<List<MovieResponse.StreamingProvider>>> getStreamingProviders(
            @Parameter(description = "TMDB Movie ID") @PathVariable Long id,
            @Parameter(description = "Country code (TH, MM, US)") @RequestParam(value = "country", defaultValue = "TH") String country
    ) {
        log.info("Getting streaming providers for movie {} in {}", id, country);
        
        try {
            List<MovieResponse.StreamingProvider> providers = tmdbService.getStreamingProviders(id, country);
            return ResponseEntity.ok(ApiResponse.success(providers));
        } catch (Exception e) {
            log.error("Error getting streaming providers: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to get streaming providers", e.getMessage()));
        }
    }

    @GetMapping("/{id}/similar")
    @Operation(summary = "Get similar movies", description = "Get movies similar to a specific movie")
    public ResponseEntity<ApiResponse<List<MovieResponse>>> getSimilarMovies(
            @Parameter(description = "TMDB Movie ID") @PathVariable Long id,
            @Parameter(description = "Language (en, th, my)") @RequestParam(value = "lang", defaultValue = "en") String language,
            @Parameter(description = "Number of results") @RequestParam(value = "limit", defaultValue = "6") int limit
    ) {
        log.info("Getting similar movies for: {}", id);
        
        try {
            List<MovieResponse> movies = tmdbService.getSimilarMovies(id, language, limit);
            return ResponseEntity.ok(ApiResponse.success(movies));
        } catch (Exception e) {
            log.error("Error getting similar movies: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to get similar movies", e.getMessage()));
        }
    }

    @GetMapping("/trending")
    @Operation(summary = "Get trending movies", description = "Get currently trending movies")
    public ResponseEntity<ApiResponse<List<MovieResponse>>> getTrendingMovies(
            @Parameter(description = "Language (en, th, my)") @RequestParam(value = "lang", defaultValue = "en") String language
    ) {
        log.info("Getting trending movies (lang: {})", language);
        
        try {
            List<MovieResponse> movies = tmdbService.getTrendingMovies(language);
            return ResponseEntity.ok(ApiResponse.success(movies));
        } catch (Exception e) {
            log.error("Error getting trending movies: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to get trending movies", e.getMessage()));
        }
    }
}
