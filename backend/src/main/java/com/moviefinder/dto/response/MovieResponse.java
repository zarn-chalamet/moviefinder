package com.moviefinder.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MovieResponse {
    
    private Long id;
    private String title;
    private String originalTitle;
    private String titleTh;
    private String titleMy;
    private String year;
    private String releaseDate;
    private Double rating;
    private Integer voteCount;
    private Integer runtime;
    private List<String> genres;
    private String overview;
    private String overviewTh;
    private String overviewMy;
    private String posterUrl;
    private String backdropUrl;
    private String director;
    private List<String> cast;
    private String tagline;
    private String imdbId;
    private Long budget;
    private Long revenue;
    private String status;
    
    // Streaming info
    private List<StreamingProvider> streamingProviders;
    
    // Subtitles
    private List<SubtitleInfo> subtitles;
    
    // Trailer
    private TrailerInfo trailer;
    
    // Similar movies
    private List<MovieResponse> similar;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StreamingProvider {
        private String platform;
        private String type; // subscription, free, rent, buy
        private boolean isFree;
        private String price;
        private String country;
        private String logo;
        private String url;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubtitleInfo {
        private String language;
        private String languageCode;
        private String format;
        private String downloadUrl;
        private String source;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrailerInfo {
        private String key;
        private String name;
        private String site;
        private String url;
    }
}
