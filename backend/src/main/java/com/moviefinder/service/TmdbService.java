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
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

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

    // Search for movies by query
    @Cacheable(value = "movies", key = "#query + '-' + #language")
    public List<MovieResponse> searchMovies(String query, String language) {
        try {
            String url = baseUrl + "/search/movie?api_key=" + apiKey
                    + "&query=" + URLEncoder.encode(query, StandardCharsets.UTF_8)
                    + "&language=" + getTmdbLanguage(language);

            log.info("TMDB movie search: {}", query);

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

    // Get movie details by ID including credits, videos, streaming providers
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

    // Get trending movies for the week
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
            return List.of();
        }
    }

    // Get similar movies to a given movie
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

    // Search TV shows including K-dramas, anime, series
    @Cacheable(value = "tv", key = "#query + '-' + #language")
    public List<MovieResponse> searchTvShows(String query, String language) {
        try {
            String url = baseUrl + "/search/tv?api_key=" + apiKey
                    + "&query=" + URLEncoder.encode(query, StandardCharsets.UTF_8)
                    + "&language=" + getTmdbLanguage(language);

            log.info("TMDB TV search: {}", query);

            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseTvResults(response);

        } catch (Exception e) {
            log.error("Error searching TV shows: {}", e.getMessage());
            return List.of();
        }
    }

    // Get TV show details by ID
    @Cacheable(value = "tv", key = "'tv-' + #tvId + '-' + #language")
    public MovieResponse getTvShowById(Long tvId, String language) {
        try {
            String url = baseUrl + "/tv/" + tvId
                    + "?api_key=" + apiKey
                    + "&language=" + getTmdbLanguage(language)
                    + "&append_to_response=credits,videos";

            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseTvDetails(response);

        } catch (Exception e) {
            log.error("Error getting TV details: {}", e.getMessage());
            return null;
        }
    }

    // Search TMDB using a single hashtag as the search term
    // Example: "YourHonor" becomes "Your Honor" and searches both TV and movies
    public List<MovieResponse> searchByHashtag(String hashtag) {
        if (hashtag == null || hashtag.isBlank()) return List.of();

        String searchTerm = cleanHashtagToSearchTerm(hashtag);

        if (searchTerm.length() < 2) return List.of();

        log.info("Hashtag search: #{} converted to search term: '{}'", hashtag, searchTerm);

        List<MovieResponse> results = new ArrayList<>();

        // Try TV shows first because most Myanmar/Thai Facebook content is K-dramas and series
        List<MovieResponse> tvResults = searchTvShows(searchTerm, "en");
        results.addAll(tvResults);

        // Also try movies
        List<MovieResponse> movieResults = searchMovies(searchTerm, "en");
        results.addAll(movieResults);

        return results;
    }

    // Search TMDB using a list of hashtags, returns results from first successful match
    public List<MovieResponse> searchByHashtags(List<String> hashtags) {
        if (hashtags == null || hashtags.isEmpty()) return List.of();

        for (String hashtag : hashtags) {
            List<MovieResponse> results = searchByHashtag(hashtag);

            if (!results.isEmpty()) {
                log.info("Found {} results for hashtag #{}", results.size(), hashtag);
                return results;
            }

            log.info("No results for hashtag #{}, trying next", hashtag);
        }

        log.info("No results found for any of the {} hashtags", hashtags.size());
        return List.of();
    }

    // Convert a hashtag string into a readable search term
    // Examples:
    //   YourHonor          becomes  Your Honor
    //   AgentKimReactivated becomes  Agent Kim Reactivated
    //   agentkim            stays    agentkim (short, leave as is)
    private String cleanHashtagToSearchTerm(String hashtag) {
        if (hashtag == null) return "";

        // Remove # symbol if present
        String clean = hashtag.startsWith("#") ? hashtag.substring(1) : hashtag;

        // If it already has spaces, return as is
        if (clean.contains(" ")) return clean.trim();

        // Short hashtags - leave as is, no need to split
        if (clean.length() <= 6) return clean;

        // Split CamelCase into words
        // YourHonor becomes Your Honor
        // AgentKimReactivated becomes Agent Kim Reactivated
        String spaced = clean
            .replaceAll("([a-z])([A-Z])", "$1 $2")       // split lowercase then uppercase
            .replaceAll("([A-Z]+)([A-Z][a-z])", "$1 $2") // split consecutive uppercase
            .replaceAll("_(\\w)", " $1")                   // replace underscore with space
            .trim();

        return spaced;
    }

    // Private parsing methods

    private List<MovieResponse> parseTvResults(String jsonResponse) {
        List<MovieResponse> shows = new ArrayList<>();

        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode results = root.path("results");

            if (results.isArray()) {
                for (JsonNode node : results) {
                    String firstAirDate = node.path("first_air_date").asText("");
                    String year = firstAirDate.length() >= 4 ? firstAirDate.substring(0, 4) : "";

                    shows.add(MovieResponse.builder()
                            .id(node.path("id").asLong())
                            .title(node.path("name").asText())
                            .originalTitle(node.path("original_name").asText())
                            .year(year)
                            .releaseDate(firstAirDate)
                            .rating(Math.round(node.path("vote_average").asDouble() * 10.0) / 10.0)
                            .voteCount(node.path("vote_count").asInt())
                            .overview(node.path("overview").asText())
                            .posterUrl(getImageUrl(node.path("poster_path").asText(), "w500"))
                            .backdropUrl(getImageUrl(node.path("backdrop_path").asText(), "original"))
                            .genres(parseGenreIds(node.path("genre_ids")))
                            .build());
                }
            }
        } catch (Exception e) {
            log.error("Error parsing TV results: {}", e.getMessage());
        }

        return shows;
    }

    private MovieResponse parseTvDetails(String jsonResponse) {
        try {
            JsonNode node = objectMapper.readTree(jsonResponse);

            String firstAirDate = node.path("first_air_date").asText("");
            String year = firstAirDate.length() >= 4 ? firstAirDate.substring(0, 4) : "";

            MovieResponse.MovieResponseBuilder builder = MovieResponse.builder()
                    .id(node.path("id").asLong())
                    .title(node.path("name").asText())
                    .originalTitle(node.path("original_name").asText())
                    .year(year)
                    .releaseDate(firstAirDate)
                    .rating(Math.round(node.path("vote_average").asDouble() * 10.0) / 10.0)
                    .voteCount(node.path("vote_count").asInt())
                    .overview(node.path("overview").asText())
                    .posterUrl(getImageUrl(node.path("poster_path").asText(), "w500"))
                    .backdropUrl(getImageUrl(node.path("backdrop_path").asText(), "original"))
                    .tagline(node.path("tagline").asText())
                    .status(node.path("status").asText());

            // Parse genres
            List<String> genres = new ArrayList<>();
            for (JsonNode genre : node.path("genres")) {
                genres.add(genre.path("name").asText());
            }
            builder.genres(genres);

            // Parse credits
            JsonNode credits = node.path("credits");
            if (!credits.isMissingNode()) {
                // Use first creator as director equivalent
                for (JsonNode creator : node.path("created_by")) {
                    builder.director(creator.path("name").asText());
                    break;
                }

                // Top 5 cast members
                List<String> cast = new ArrayList<>();
                int castCount = 0;
                for (JsonNode castMember : credits.path("cast")) {
                    if (castCount >= 5) break;
                    cast.add(castMember.path("name").asText());
                    castCount++;
                }
                builder.cast(cast);
            }

            // Get first YouTube trailer
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
            log.error("Error parsing TV details: {}", e.getMessage());
            return null;
        }
    }

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

            // Parse credits - director and top cast
            JsonNode credits = node.path("credits");
            if (!credits.isMissingNode()) {
                for (JsonNode crew : credits.path("crew")) {
                    if ("Director".equals(crew.path("job").asText())) {
                        builder.director(crew.path("name").asText());
                        break;
                    }
                }

                List<String> cast = new ArrayList<>();
                int castCount = 0;
                for (JsonNode castMember : credits.path("cast")) {
                    if (castCount >= 5) break;
                    cast.add(castMember.path("name").asText());
                    castCount++;
                }
                builder.cast(cast);
            }

            // Get first YouTube trailer
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

        // Parse REAL streaming providers from TMDB
    // Returns empty list if not available - NO fake data
    private List<MovieResponse.StreamingProvider> parseStreamingProviders(String jsonResponse, String country) {
        List<MovieResponse.StreamingProvider> providers = new ArrayList<>();
        
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode results = root.path("results").path(country);
            
            if (results.isMissingNode() || results.isEmpty()) {
                log.info("No streaming data for country {}", country);
                return providers;
            }
            
            String tmdbLink = results.path("link").asText("");

            // Subscription streaming (Netflix, Disney+, etc.)
            for (JsonNode provider : results.path("flatrate")) {
                providers.add(MovieResponse.StreamingProvider.builder()
                        .platform(provider.path("provider_name").asText())
                        .type("subscription")
                        .isFree(false)
                        .price(getDefaultPrice(provider.path("provider_name").asText()))
                        .country(country)
                        .logo(getImageUrl(provider.path("logo_path").asText(), "w92"))
                        .url(tmdbLink)
                        .build());
            }

            // Free with ads
            for (JsonNode provider : results.path("free")) {
                providers.add(MovieResponse.StreamingProvider.builder()
                        .platform(provider.path("provider_name").asText())
                        .type("free")
                        .isFree(true)
                        .price("Free")
                        .country(country)
                        .logo(getImageUrl(provider.path("logo_path").asText(), "w92"))
                        .url(tmdbLink)
                        .build());
            }

            // Ads-supported
            for (JsonNode provider : results.path("ads")) {
                providers.add(MovieResponse.StreamingProvider.builder()
                        .platform(provider.path("provider_name").asText())
                        .type("free")
                        .isFree(true)
                        .price("Free (with ads)")
                        .country(country)
                        .logo(getImageUrl(provider.path("logo_path").asText(), "w92"))
                        .url(tmdbLink)
                        .build());
            }

            // Rent
            for (JsonNode provider : results.path("rent")) {
                providers.add(MovieResponse.StreamingProvider.builder()
                        .platform(provider.path("provider_name").asText())
                        .type("rent")
                        .isFree(false)
                        .price("Rent")
                        .country(country)
                        .logo(getImageUrl(provider.path("logo_path").asText(), "w92"))
                        .url(tmdbLink)
                        .build());
            }

            // Buy
            for (JsonNode provider : results.path("buy")) {
                providers.add(MovieResponse.StreamingProvider.builder()
                        .platform(provider.path("provider_name").asText())
                        .type("buy")
                        .isFree(false)
                        .price("Buy")
                        .country(country)
                        .logo(getImageUrl(provider.path("logo_path").asText(), "w92"))
                        .url(tmdbLink)
                        .build());
            }
            
            log.info("Found {} real streaming providers for country {}", providers.size(), country);
        } catch (Exception e) {
            log.error("Error parsing streaming providers: {}", e.getMessage());
        }
        
        return providers;
    }

    private List<String> parseGenreIds(JsonNode genreIds) {
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
            case "my" -> "en-US"; // TMDB does not support Burmese, fallback to English
            default -> "en-US";
        };
    }

    private String getDefaultPrice(String providerName) {
        return switch (providerName.toLowerCase()) {
            case "netflix" -> "419 THB/mo";
            case "disney plus", "disney+" -> "399 THB/mo";
            case "amazon prime video" -> "149 THB/mo";
            case "hbo go" -> "199 THB/mo";
            case "wetv" -> "59 THB/mo";
            case "viu" -> "119 THB/mo";
            default -> "99-299 THB/mo";
        };
    }

    // Search TMDB in a specific language for better matching foreign titles
    // Example: "Sein letztes Rennen" (German) needs de-DE search to find "Back on Track"
    @Cacheable(value = "movies", key = "#query + '-' + #language + '-multi'")
    public List<MovieResponse> searchMoviesInLanguage(String query, String tmdbLanguage) {
        try {
            String url = baseUrl + "/search/movie?api_key=" + apiKey
                    + "&query=" + URLEncoder.encode(query, StandardCharsets.UTF_8)
                    + "&language=" + tmdbLanguage;

            log.info("TMDB movie search in {}: {}", tmdbLanguage, query);

            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseMovieResults(response);

        } catch (Exception e) {
            log.error("Error searching movies in {}: {}", tmdbLanguage, e.getMessage());
            return List.of();
        }
    }

    // Search TV shows in specific language
    @Cacheable(value = "tv", key = "#query + '-' + #language + '-multi'")
    public List<MovieResponse> searchTvShowsInLanguage(String query, String tmdbLanguage) {
        try {
            String url = baseUrl + "/search/tv?api_key=" + apiKey
                    + "&query=" + URLEncoder.encode(query, StandardCharsets.UTF_8)
                    + "&language=" + tmdbLanguage;

            log.info("TMDB TV search in {}: {}", tmdbLanguage, query);

            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseTvResults(response);

        } catch (Exception e) {
            log.error("Error searching TV in {}: {}", tmdbLanguage, e.getMessage());
            return List.of();
        }
    }

    // Convert country/language name to TMDB language code
    public static String getTmdbLanguageCode(String language, String country) {
        if (language != null) {
            String lower = language.toLowerCase();
            return switch (lower) {
                case "korean" -> "ko-KR";
                case "chinese", "mandarin" -> "zh-CN";
                case "japanese" -> "ja-JP";
                case "german" -> "de-DE";
                case "french" -> "fr-FR";
                case "spanish" -> "es-ES";
                case "italian" -> "it-IT";
                case "portuguese" -> "pt-BR";
                case "russian" -> "ru-RU";
                case "thai" -> "th-TH";
                case "hindi" -> "hi-IN";
                case "burmese", "myanmar" -> "en-US"; // TMDB doesn't support Burmese
                case "arabic" -> "ar-SA";
                case "turkish" -> "tr-TR";
                case "vietnamese" -> "vi-VN";
                case "indonesian" -> "id-ID";
                case "english", "en" -> "en-US";
                default -> null; // Fall back to default
            };
        }

        if (country != null) {
            String lower = country.toLowerCase();
            if (lower.contains("korea")) return "ko-KR";
            if (lower.contains("china") || lower.contains("chinese")) return "zh-CN";
            if (lower.contains("japan")) return "ja-JP";
            if (lower.contains("german")) return "de-DE";
            if (lower.contains("france") || lower.contains("french")) return "fr-FR";
            if (lower.contains("spain") || lower.contains("spanish")) return "es-ES";
            if (lower.contains("italy") || lower.contains("italian")) return "it-IT";
            if (lower.contains("thai")) return "th-TH";
        }

        return null;
    }
}