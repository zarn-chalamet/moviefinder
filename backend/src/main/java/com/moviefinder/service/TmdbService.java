package com.moviefinder.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moviefinder.dto.response.MovieResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class TmdbService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${api.tmdb.api-key}")
    private String apiKey;

    @Value("${api.tmdb.base-url}")
    private String baseUrl;

    @Value("${api.tmdb.image-base-url}")
    private String imageBaseUrl;

    public TmdbService(WebClient webClient, ObjectMapper objectMapper) {
        this.webClient = webClient;
        this.objectMapper = objectMapper;
    }

    /**
     * Search for movies by query
     */
    @Cacheable(value = "movies", key = "#query + '-' + #language")
    public List<MovieResponse> searchMovies(String query, String language) {
        try {
            String url = baseUrl + "/search/movie?api_key=" + apiKey 
                    + "&query=" + query 
                    + "&language=" + getTmdbLanguage(language);

            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseMovieResults(response);

        } catch (Exception e) {
            log.error("Error searching movies: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Get movie details by ID
     */
    @Cacheable(value = "movies", key = "'movie-' + #movieId + '-' + #language")
    public MovieResponse getMovieById(Long movieId, String language) {
        try {
            String url = baseUrl + "/movie/" + movieId 
                    + "?api_key=" + apiKey 
                    + "&language=" + getTmdbLanguage(language)
                    + "&append_to_response=credits,videos,similar,watch/providers";

            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseMovieDetails(response);

        } catch (Exception e) {
            log.error("Error getting movie details: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Get trending movies
     */
    @Cacheable(value = "trending", key = "'trending-' + #language")
    public List<MovieResponse> getTrendingMovies(String language) {
        try {
            String url = baseUrl + "/trending/movie/week?api_key=" + apiKey 
                    + "&language=" + getTmdbLanguage(language);

            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseMovieResults(response);

        } catch (Exception e) {
            log.error("Error getting trending movies: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Get streaming providers for a movie
     */
    @Cacheable(value = "streaming", key = "'streaming-' + #movieId + '-' + #country")
    public List<MovieResponse.StreamingProvider> getStreamingProviders(Long movieId, String country) {
        try {
            String url = baseUrl + "/movie/" + movieId + "/watch/providers?api_key=" + apiKey;

            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseStreamingProviders(response, country);

        } catch (Exception e) {
            log.error("Error getting streaming providers: {}", e.getMessage());
            return generateDefaultStreamingProviders(movieId);
        }
    }

    /**
     * Get similar movies
     */
    public List<MovieResponse> getSimilarMovies(Long movieId, String language, int limit) {
        try {
            String url = baseUrl + "/movie/" + movieId + "/similar?api_key=" + apiKey 
                    + "&language=" + getTmdbLanguage(language);

            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            List<MovieResponse> movies = parseMovieResults(response);
            return movies.size() > limit ? movies.subList(0, limit) : movies;

        } catch (Exception e) {
            log.error("Error getting similar movies: {}", e.getMessage());
            return List.of();
        }
    }

    // ============================================
    // Private parsing methods
    // ============================================

    private List<MovieResponse> parseMovieResults(String jsonResponse) {
        List<MovieResponse> movies = new ArrayList<>();
        
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode results = root.path("results");
            
            if (results.isArray()) {
                for (JsonNode movieNode : results) {
                    movies.add(parseBasicMovie(movieNode));
                }
            }
        } catch (Exception e) {
            log.error("Error parsing movie results: {}", e.getMessage());
        }
        
        return movies;
    }

    private MovieResponse parseBasicMovie(JsonNode node) {
        String releaseDate = node.path("release_date").asText("");
        String year = releaseDate.length() >= 4 ? releaseDate.substring(0, 4) : "";

        return MovieResponse.builder()
                .id(node.path("id").asLong())
                .title(node.path("title").asText())
                .originalTitle(node.path("original_title").asText())
                .year(year)
                .releaseDate(releaseDate)
                .rating(Math.round(node.path("vote_average").asDouble() * 10.0) / 10.0)
                .voteCount(node.path("vote_count").asInt())
                .overview(node.path("overview").asText())
                .posterUrl(getImageUrl(node.path("poster_path").asText(), "w500"))
                .backdropUrl(getImageUrl(node.path("backdrop_path").asText(), "original"))
                .genres(parseGenreIds(node.path("genre_ids")))
                .build();
    }

    private MovieResponse parseMovieDetails(String jsonResponse) {
        try {
            JsonNode node = objectMapper.readTree(jsonResponse);
            
            String releaseDate = node.path("release_date").asText("");
            String year = releaseDate.length() >= 4 ? releaseDate.substring(0, 4) : "";

            MovieResponse.MovieResponseBuilder builder = MovieResponse.builder()
                    .id(node.path("id").asLong())
                    .title(node.path("title").asText())
                    .originalTitle(node.path("original_title").asText())
                    .year(year)
                    .releaseDate(releaseDate)
                    .rating(Math.round(node.path("vote_average").asDouble() * 10.0) / 10.0)
                    .voteCount(node.path("vote_count").asInt())
                    .runtime(node.path("runtime").asInt())
                    .overview(node.path("overview").asText())
                    .posterUrl(getImageUrl(node.path("poster_path").asText(), "w500"))
                    .backdropUrl(getImageUrl(node.path("backdrop_path").asText(), "original"))
                    .tagline(node.path("tagline").asText())
                    .imdbId(node.path("imdb_id").asText())
                    .budget(node.path("budget").asLong())
                    .revenue(node.path("revenue").asLong())
                    .status(node.path("status").asText());

            // Parse genres
            List<String> genres = new ArrayList<>();
            for (JsonNode genre : node.path("genres")) {
                genres.add(genre.path("name").asText());
            }
            builder.genres(genres);

            // Parse credits (director & cast)
            JsonNode credits = node.path("credits");
            if (!credits.isMissingNode()) {
                // Director
                for (JsonNode crew : credits.path("crew")) {
                    if ("Director".equals(crew.path("job").asText())) {
                        builder.director(crew.path("name").asText());
                        break;
                    }
                }

                // Cast (top 5)
                List<String> cast = new ArrayList<>();
                int castCount = 0;
                for (JsonNode castMember : credits.path("cast")) {
                    if (castCount >= 5) break;
                    cast.add(castMember.path("name").asText());
                    castCount++;
                }
                builder.cast(cast);
            }

            // Parse trailer
            JsonNode videos = node.path("videos").path("results");
            if (videos.isArray()) {
                for (JsonNode video : videos) {
                    if ("Trailer".equals(video.path("type").asText()) && 
                        "YouTube".equals(video.path("site").asText())) {
                        String key = video.path("key").asText();
                        builder.trailer(MovieResponse.TrailerInfo.builder()
                                .key(key)
                                .name(video.path("name").asText())
                                .site("YouTube")
                                .url("https://www.youtube.com/watch?v=" + key)
                                .build());
                        break;
                    }
                }
            }

            return builder.build();

        } catch (Exception e) {
            log.error("Error parsing movie details: {}", e.getMessage());
            return null;
        }
    }

    private List<MovieResponse.StreamingProvider> parseStreamingProviders(String jsonResponse, String country) {
        List<MovieResponse.StreamingProvider> providers = new ArrayList<>();
        
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode results = root.path("results").path(country);
            
            if (!results.isMissingNode()) {
                // Flatrate (subscription)
                for (JsonNode provider : results.path("flatrate")) {
                    providers.add(MovieResponse.StreamingProvider.builder()
                            .platform(provider.path("provider_name").asText())
                            .type("subscription")
                            .isFree(false)
                            .price(getDefaultPrice(provider.path("provider_name").asText()))
                            .country(country)
                            .logo(getImageUrl(provider.path("logo_path").asText(), "w92"))
                            .url(results.path("link").asText())
                            .build());
                }

                // Free
                for (JsonNode provider : results.path("free")) {
                    providers.add(MovieResponse.StreamingProvider.builder()
                            .platform(provider.path("provider_name").asText())
                            .type("free")
                            .isFree(true)
                            .price("Free")
                            .country(country)
                            .logo(getImageUrl(provider.path("logo_path").asText(), "w92"))
                            .url(results.path("link").asText())
                            .build());
                }

                // Rent
                for (JsonNode provider : results.path("rent")) {
                    providers.add(MovieResponse.StreamingProvider.builder()
                            .platform(provider.path("provider_name").asText())
                            .type("rent")
                            .isFree(false)
                            .price("฿99-199")
                            .country(country)
                            .logo(getImageUrl(provider.path("logo_path").asText(), "w92"))
                            .url(results.path("link").asText())
                            .build());
                }
            }
        } catch (Exception e) {
            log.error("Error parsing streaming providers: {}", e.getMessage());
        }
        
        // Always add default providers if none found
        if (providers.isEmpty()) {
            return generateDefaultStreamingProviders(0L);
        }
        
        return providers;
    }

    private List<MovieResponse.StreamingProvider> generateDefaultStreamingProviders(Long movieId) {
        return List.of(
            MovieResponse.StreamingProvider.builder()
                    .platform("Netflix").type("subscription").isFree(false)
                    .price("฿419/mo").country("TH").logo("🔴").url("https://netflix.com").build(),
            MovieResponse.StreamingProvider.builder()
                    .platform("TrueID").type("free").isFree(true)
                    .price("Free").country("TH").logo("🟢").url("https://trueid.net").build(),
            MovieResponse.StreamingProvider.builder()
                    .platform("Disney+").type("subscription").isFree(false)
                    .price("฿399/mo").country("TH").logo("🔵").url("https://disneyplus.com").build()
        );
    }

    private List<String> parseGenreIds(JsonNode genreIds) {
        // Map common genre IDs to names
        List<String> genres = new ArrayList<>();
        if (genreIds.isArray()) {
            for (JsonNode id : genreIds) {
                String genre = mapGenreId(id.asInt());
                if (genre != null) genres.add(genre);
            }
        }
        return genres;
    }

    private String mapGenreId(int id) {
        return switch (id) {
            case 28 -> "Action";
            case 12 -> "Adventure";
            case 16 -> "Animation";
            case 35 -> "Comedy";
            case 80 -> "Crime";
            case 99 -> "Documentary";
            case 18 -> "Drama";
            case 10751 -> "Family";
            case 14 -> "Fantasy";
            case 36 -> "History";
            case 27 -> "Horror";
            case 10402 -> "Music";
            case 9648 -> "Mystery";
            case 10749 -> "Romance";
            case 878 -> "Sci-Fi";
            case 10770 -> "TV Movie";
            case 53 -> "Thriller";
            case 10752 -> "War";
            case 37 -> "Western";
            default -> null;
        };
    }

    private String getImageUrl(String path, String size) {
        if (path == null || path.isEmpty() || "null".equals(path)) {
            return null;
        }
        return imageBaseUrl + "/" + size + path;
    }

    private String getTmdbLanguage(String language) {
        return switch (language) {
            case "th" -> "th-TH";
            case "my" -> "en-US"; // TMDB doesn't support Burmese, fallback to English
            default -> "en-US";
        };
    }

    private String getDefaultPrice(String providerName) {
        return switch (providerName.toLowerCase()) {
            case "netflix" -> "฿419/mo";
            case "disney plus", "disney+" -> "฿399/mo";
            case "amazon prime video" -> "฿149/mo";
            case "hbo go" -> "฿199/mo";
            case "wetv" -> "฿59/mo";
            case "viu" -> "฿119/mo";
            default -> "฿99-299/mo";
        };
    }
}
