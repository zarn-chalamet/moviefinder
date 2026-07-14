package com.moviefinder.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moviefinder.dto.response.ApiResponse;
import com.moviefinder.dto.response.MovieResponse;
import com.moviefinder.service.ChatService;
import com.moviefinder.service.GeminiService;
import com.moviefinder.service.TmdbService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/movies")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Movies", description = "Movie search and details endpoints")
public class MovieController {

    private final TmdbService tmdbService;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;
    private final ChatService chatService;

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

    @PostMapping("/{id}/similar")
    @Operation(summary = "Get similar movies",
        description = "Get similar movies from TMDB. Falls back to AI recommendations if TMDB has no data.")
    public ResponseEntity<ApiResponse<List<MovieResponse>>> getSimilarMovies(
            @Parameter(description = "TMDB Movie ID") @PathVariable Long id,
            @RequestBody(required = false) SimilarMoviesRequest request,
            @Parameter(description = "Language (en, th, my)") @RequestParam(value = "lang", defaultValue = "en") String language,
            @Parameter(description = "Number of results") @RequestParam(value = "limit", defaultValue = "5") int limit
    ) {
        log.info("Getting similar movies for id: {}", id);

        try {
            // Step 1: Try TMDB first
            List<MovieResponse> tmdbSimilar = tmdbService.getSimilarMovies(id, language, limit);

            if (!tmdbSimilar.isEmpty()) {
                List<MovieResponse> enriched = enrichWithDetails(tmdbSimilar, language, limit);
                log.info("Returning {} similar movies from TMDB", enriched.size());
                return ResponseEntity.ok(ApiResponse.success(enriched));
            }

            // Step 2: TMDB empty - fall back to AI recommendations
            log.info("TMDB empty for id {}, falling back to AI recommendations", id);

            String title = null;
            String year = null;
            List<String> genres = null;

            // Prefer context sent by frontend (matches Chat behavior)
            if (request != null && request.getTitle() != null && !request.getTitle().isBlank()) {
                title = request.getTitle();
                year = request.getYear();
                genres = request.getGenres();
                log.info("Using context from frontend: {} ({})", title, year);
            } else {
                // Fallback: fetch from TMDB
                MovieResponse original = tmdbService.getMovieById(id, "en");
                if (original == null || original.getTitle() == null || original.getTitle().isBlank()) {
                    original = tmdbService.getTvShowById(id, "en");
                }

                if (original == null || original.getTitle() == null || original.getTitle().isBlank()) {
                    log.warn("Cannot find movie/TV with id {} for AI recommendations", id);
                    return ResponseEntity.ok(ApiResponse.success(List.of()));
                }

                title = original.getTitle();
                year = original.getYear();
                genres = original.getGenres();
            }

            List<MovieResponse> aiResults = getAiRecommendations(title, year, genres, limit);

            log.info("Returning {} AI-recommended movies", aiResults.size());
            return ResponseEntity.ok(ApiResponse.success(aiResults));

        } catch (Exception e) {
            log.error("Error getting similar movies: {}", e.getMessage(), e);
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

    // ============================================
    // Helper Methods
    // ============================================

    private List<MovieResponse> enrichWithDetails(List<MovieResponse> basic, String language, int limit) {
        List<MovieResponse> enriched = new ArrayList<>();

        for (MovieResponse item : basic) {
            if (enriched.size() >= limit) break;

            try {
                MovieResponse full = tmdbService.getMovieById(item.getId(), language);
                if (full != null && full.getTitle() != null && !full.getTitle().isBlank()) {
                    enriched.add(full);
                    continue;
                }

                MovieResponse tv = tmdbService.getTvShowById(item.getId(), language);
                if (tv != null && tv.getTitle() != null && !tv.getTitle().isBlank()) {
                    enriched.add(tv);
                    continue;
                }

                enriched.add(item);
            } catch (Exception e) {
                log.debug("Enrichment failed for id {}: {}", item.getId(), e.getMessage());
                enriched.add(item);
            }
        }

        return enriched;
    }

    private List<MovieResponse> getAiRecommendations(String title, String year, List<String> genres, int limit) {
        String genresText = (genres != null && !genres.isEmpty())
            ? String.join(", ", genres)
            : "unknown";
        String yearText = (year != null && !year.isBlank()) ? year : "unknown";

        String prompt = String.format("""
            Recommend exactly %d movies similar to "%s" (%s).
            Genre: %s
            
            Return ONLY a JSON array (no markdown, no explanation):
            [
              {"title": "Movie Title 1", "year": "2020"},
              {"title": "Movie Title 2", "year": "2019"}
            ]
            
            Rules:
            - Return REAL existing movies
            - Use English international titles (searchable on TMDB)
            - Include the release year as a 4-digit string
            - Similar theme, genre, or emotional tone
            - Popular enough to be in TMDB database
            - Return ONLY the JSON array
            """,
            limit, title, yearText, genresText
        );

        try {
            String response = geminiService.chat(prompt, "en", null, null);
            List<RecommendationItem> recommendations = parseRecommendations(response);

            if (recommendations.isEmpty()) {
                log.warn("Could not parse Gemini recommendations");
                return List.of();
            }

            log.info("Gemini recommended {} titles, searching TMDB", recommendations.size());

            List<MovieResponse> found = new ArrayList<>();
            for (RecommendationItem rec : recommendations) {
                if (found.size() >= limit) break;

                try {
                    // Use the SAME smart search used by Chat page
                    MovieResponse result = chatService.smartTmdbSearch(rec.title, false);
                    if (result != null && result.getTitle() != null) {
                        found.add(result);
                    }
                } catch (Exception e) {
                    log.debug("Search failed for '{}': {}", rec.title, e.getMessage());
                }
            }

            return found;

        } catch (Exception e) {
            log.error("AI recommendations failed: {}", e.getMessage());
            return List.of();
        }
    }

    private static class RecommendationItem {
        String title;
        String year;
    }

    private List<RecommendationItem> parseRecommendations(String response) {
        List<RecommendationItem> results = new ArrayList<>();
        try {
            String json = response
                .replaceAll("```json\\s*", "")
                .replaceAll("```\\s*", "")
                .trim();

            int start = json.indexOf('[');
            int end = json.lastIndexOf(']');
            if (start < 0 || end <= start) {
                return results;
            }

            json = json.substring(start, end + 1);
            JsonNode array = objectMapper.readTree(json);

            if (array.isArray()) {
                for (JsonNode node : array) {
                    String title = node.path("title").asText("").trim();
                    if (!title.isEmpty() && !title.equalsIgnoreCase("null")) {
                        RecommendationItem item = new RecommendationItem();
                        item.title = title;
                        item.year = node.path("year").asText("");
                        results.add(item);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse recommendations: {}", e.getMessage());
        }
        return results;
    }

    @Data
    public static class SimilarMoviesRequest {
        private String title;
        private String year;
        private List<String> genres;
        private String overview;
    }
}