package com.moviefinder.service;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class UrlAnalyzerService {

    /**
     * Analyze a social media URL and extract video metadata
     */
    public VideoMetadata analyzeUrl(String url) {
        try {
            Platform platform = detectPlatform(url);
            
            return switch (platform) {
                case TIKTOK -> analyzeTikTok(url);
                case FACEBOOK -> analyzeFacebook(url);
                case INSTAGRAM -> analyzeInstagram(url);
                case YOUTUBE -> analyzeYouTube(url);
                default -> VideoMetadata.builder()
                        .platform(Platform.UNKNOWN)
                        .url(url)
                        .build();
            };

        } catch (Exception e) {
            log.error("Error analyzing URL: {}", e.getMessage());
            return VideoMetadata.builder()
                    .platform(Platform.UNKNOWN)
                    .url(url)
                    .error(e.getMessage())
                    .build();
        }
    }

    /**
     * Detect which platform the URL belongs to
     */
    public Platform detectPlatform(String url) {
        String lowerUrl = url.toLowerCase();
        
        if (lowerUrl.contains("tiktok.com")) {
            return Platform.TIKTOK;
        } else if (lowerUrl.contains("facebook.com") || lowerUrl.contains("fb.watch") || lowerUrl.contains("fb.com")) {
            return Platform.FACEBOOK;
        } else if (lowerUrl.contains("instagram.com")) {
            return Platform.INSTAGRAM;
        } else if (lowerUrl.contains("youtube.com") || lowerUrl.contains("youtu.be")) {
            return Platform.YOUTUBE;
        }
        
        return Platform.UNKNOWN;
    }

    private VideoMetadata analyzeTikTok(String url) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(10000)
                    .get();

            String title = extractMetaContent(doc, "og:title");
            String description = extractMetaContent(doc, "og:description");
            String thumbnail = extractMetaContent(doc, "og:image");
            
            // Extract hashtags from description
            String hashtags = extractHashtags(description);

            return VideoMetadata.builder()
                    .platform(Platform.TIKTOK)
                    .url(url)
                    .title(cleanText(title))
                    .description(cleanText(description))
                    .hashtags(hashtags)
                    .thumbnail(thumbnail)
                    .build();

        } catch (Exception e) {
            log.error("Error analyzing TikTok URL: {}", e.getMessage());
            return VideoMetadata.builder()
                    .platform(Platform.TIKTOK)
                    .url(url)
                    .error("Could not fetch video details. The video might be private or unavailable.")
                    .build();
        }
    }

    private VideoMetadata analyzeFacebook(String url) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (compatible; Googlebot/2.1)")
                    .timeout(10000)
                    .get();

            String title = extractMetaContent(doc, "og:title");
            String description = extractMetaContent(doc, "og:description");
            String thumbnail = extractMetaContent(doc, "og:image");

            return VideoMetadata.builder()
                    .platform(Platform.FACEBOOK)
                    .url(url)
                    .title(cleanText(title))
                    .description(cleanText(description))
                    .hashtags(extractHashtags(description))
                    .thumbnail(thumbnail)
                    .build();

        } catch (Exception e) {
            log.error("Error analyzing Facebook URL: {}", e.getMessage());
            return VideoMetadata.builder()
                    .platform(Platform.FACEBOOK)
                    .url(url)
                    .error("Could not fetch video details. Facebook videos are often restricted.")
                    .build();
        }
    }

    private VideoMetadata analyzeInstagram(String url) {
        try {
            // Instagram requires special handling - often blocked
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (compatible; Googlebot/2.1)")
                    .timeout(10000)
                    .get();

            String title = extractMetaContent(doc, "og:title");
            String description = extractMetaContent(doc, "og:description");
            String thumbnail = extractMetaContent(doc, "og:image");

            return VideoMetadata.builder()
                    .platform(Platform.INSTAGRAM)
                    .url(url)
                    .title(cleanText(title))
                    .description(cleanText(description))
                    .hashtags(extractHashtags(description))
                    .thumbnail(thumbnail)
                    .build();

        } catch (Exception e) {
            log.error("Error analyzing Instagram URL: {}", e.getMessage());
            return VideoMetadata.builder()
                    .platform(Platform.INSTAGRAM)
                    .url(url)
                    .error("Could not fetch video details. Instagram content is often restricted.")
                    .build();
        }
    }

    private VideoMetadata analyzeYouTube(String url) {
        try {
            // Extract video ID
            String videoId = extractYouTubeVideoId(url);
            String embedUrl = "https://www.youtube.com/watch?v=" + videoId;

            Document doc = Jsoup.connect(embedUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(10000)
                    .get();

            String title = extractMetaContent(doc, "og:title");
            String description = extractMetaContent(doc, "og:description");
            String thumbnail = "https://img.youtube.com/vi/" + videoId + "/maxresdefault.jpg";

            // Try to get channel name
            String channelName = "";
            Element channelElement = doc.selectFirst("link[itemprop=name]");
            if (channelElement != null) {
                channelName = channelElement.attr("content");
            }

            return VideoMetadata.builder()
                    .platform(Platform.YOUTUBE)
                    .url(url)
                    .videoId(videoId)
                    .title(cleanText(title))
                    .description(cleanText(description))
                    .hashtags(extractHashtags(description))
                    .thumbnail(thumbnail)
                    .channelName(channelName)
                    .build();

        } catch (Exception e) {
            log.error("Error analyzing YouTube URL: {}", e.getMessage());
            return VideoMetadata.builder()
                    .platform(Platform.YOUTUBE)
                    .url(url)
                    .error("Could not fetch video details.")
                    .build();
        }
    }

    private String extractMetaContent(Document doc, String property) {
        Element meta = doc.selectFirst("meta[property=" + property + "]");
        if (meta != null) {
            return meta.attr("content");
        }
        // Try name attribute
        meta = doc.selectFirst("meta[name=" + property + "]");
        return meta != null ? meta.attr("content") : "";
    }

    private String extractHashtags(String text) {
        if (text == null) return "";
        
        Pattern pattern = Pattern.compile("#\\w+");
        Matcher matcher = pattern.matcher(text);
        
        StringBuilder hashtags = new StringBuilder();
        while (matcher.find()) {
            if (hashtags.length() > 0) hashtags.append(" ");
            hashtags.append(matcher.group());
        }
        
        return hashtags.toString();
    }

    private String extractYouTubeVideoId(String url) {
        // Handle various YouTube URL formats
        String[] patterns = {
            "(?:youtube\\.com/watch\\?v=|youtu\\.be/|youtube\\.com/embed/)([a-zA-Z0-9_-]{11})",
            "youtube\\.com/shorts/([a-zA-Z0-9_-]{11})"
        };

        for (String pattern : patterns) {
            Pattern compiledPattern = Pattern.compile(pattern);
            Matcher matcher = compiledPattern.matcher(url);
            if (matcher.find()) {
                return matcher.group(1);
            }
        }

        return "";
    }

    private String cleanText(String text) {
        if (text == null) return "";
        return text.replaceAll("\\s+", " ").trim();
    }

    // ============================================
    // Data classes
    // ============================================

    public enum Platform {
        TIKTOK, FACEBOOK, INSTAGRAM, YOUTUBE, UNKNOWN
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class VideoMetadata {
        private Platform platform;
        private String url;
        private String videoId;
        private String title;
        private String description;
        private String hashtags;
        private String thumbnail;
        private String channelName;
        private String error;
        
        public boolean hasError() {
            return error != null && !error.isEmpty();
        }
        
        public String getCombinedText() {
            StringBuilder sb = new StringBuilder();
            if (title != null) sb.append(title).append(" ");
            if (description != null) sb.append(description).append(" ");
            if (hashtags != null) sb.append(hashtags);
            return sb.toString().trim();
        }
    }
}
