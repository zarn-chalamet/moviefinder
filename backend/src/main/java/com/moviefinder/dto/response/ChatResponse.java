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
public class ChatResponse {

    private String reply;
    private String conversationId;
    private MovieDto movieContext;
    private List<MovieDto> candidates;           // Multiple candidates when uncertain
    private List<StreamingProviderDto> streamingInfo;
    private List<String> suggestions;
    private String language;
    private String analysisMethod;               // hashtag, explicit_title, metadata_ai, vision, error
    private String processingMessage;

    // Confidence system fields
    private Integer confidenceScore;             // 0 to 100
    private String confidenceLevel;             // CERTAIN, LIKELY, UNCERTAIN, UNKNOWN
    private String contentType;                 // RECAP_VIDEO, SCENE_CLIP, TRAILER, CHINESE_SHORT_DRAMA, ANIME, UNKNOWN

    // Chinese short drama special handling
    private Boolean isChineseShortDrama;
    private String chineseShortDramaInfo;        // Platform redirect info

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MovieDto {
        private Long tmdbId;
        private String title;
        private String titleTh;
        private String titleMy;
        private String year;
        private Double rating;
        private Integer voteCount;
        private Integer runtime;
        private List<String> genres;
        private String overview;
        private String overviewTh;
        private String posterUrl;
        private String backdropUrl;
        private String director;
        private List<String> cast;
        private String tagline;
        private Integer matchScore;              // Score for ranking when showing multiple candidates
        private String matchReason;             // Why this is a candidate
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StreamingProviderDto {
        private String platform;
        private String type;
        private boolean isFree;
        private String price;
        private String country;
        private String logo;
        private String url;
    }
}