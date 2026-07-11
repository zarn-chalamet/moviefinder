package com.moviefinder.service;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class UrlAnalyzerService {

    // Expanded list of generic/spam hashtags to filter out
    // Using HashSet instead of Set.of() to avoid duplicate element errors
    private static final Set<String> GENERIC_HASHTAGS = new java.util.HashSet<>(java.util.Arrays.asList(
        // Platform/discovery hashtags
        "fyp", "foryou", "foryoupage", "viral", "trending", "fypシ", "xyzbca",
        "explore", "recommended", "tiktok", "reels", "shorts",

        // Generic movie/video terms
        "movie", "movies", "film", "cinema", "video", "clip", "scene", "trailer",
        "netflix", "drama", "series", "recommend", "watch", "mustwatch", "mustsee",
        "goodmovie", "moviereview", "review", "recap", "reaction", "highlight",
        "edit", "fanmade", "fanvideo", "amv", "fmv", "mv", "ost", "soundtrack",
        "movieclip", "moviescene", "filmclip", "entertainment", "fun",

        // Country/language tags
        "kdrama", "kpop", "korean", "thailand", "myanmar", "thai", "burmese",
        "chinese", "japanese", "english", "hindi", "usa", "uk", "india",
        "china", "japan", "europe", "america",

        // Generic genres
        "action", "comedy", "romance", "horror", "anime", "sport", "sports",
        "family", "funny", "sad", "emotional", "relatable", "love", "life",

        // Social engagement
        "subscribe", "like", "share", "follow", "comment", "new", "hot",
        "best", "top", "must", "quotes", "motivation", "inspiration",

        // Common location/category spam
        "newyork", "city", "town", "nature", "travel", "food", "music", "dance",
        "art", "photography", "fashion", "beauty", "health", "fitness",

        // People/gender terms
        "man", "woman", "boy", "girl", "men", "women", "boys", "girls",
        "people", "kid", "kids", "baby", "teen", "adult"
    ));

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

    // UTF-8 fixed connection helper to handle Asian language characters correctly
    private Document fetchDocumentUtf8(String url, String userAgent) throws Exception {
        Connection.Response response = Jsoup.connect(url)
                .userAgent(userAgent)
                .timeout(15000)
                .header("Accept-Charset", "UTF-8")
                .header("Accept-Language", "en-US,en;q=0.9,my;q=0.8,th;q=0.7,ko;q=0.6")
                .ignoreContentType(true)
                .execute();

        response.charset("UTF-8");
        Document doc = response.parse();
        doc.outputSettings().charset("UTF-8");
        return doc;
    }

    private VideoMetadata analyzeTikTok(String url) {
        try {
            Document doc = fetchDocumentUtf8(url,
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

            String title = extractMetaContent(doc, "og:title");
            String description = extractMetaContent(doc, "og:description");
            String thumbnail = extractMetaContent(doc, "og:image");

            String combinedText = (title != null ? title : "") + " " + (description != null ? description : "");

            log.info("TikTok metadata - Title: {}", title);

            return VideoMetadata.builder()
                    .platform(Platform.TIKTOK)
                    .url(url)
                    .title(cleanText(title))
                    .description(cleanText(description))
                    .hashtags(extractAllHashtags(combinedText))
                    .specificHashtags(extractSpecificHashtagsAsString(combinedText))
                    .thumbnail(thumbnail)
                    .build();

        } catch (Exception e) {
            log.error("Error analyzing TikTok URL: {}", e.getMessage());
            return VideoMetadata.builder()
                    .platform(Platform.TIKTOK)
                    .url(url)
                    .error("Could not fetch video details.")
                    .build();
        }
    }

    private VideoMetadata analyzeFacebook(String url) {
        try {
            Document doc = fetchDocumentUtf8(url,
                "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)");

            String title = extractMetaContent(doc, "og:title");
            String description = extractMetaContent(doc, "og:description");
            String thumbnail = extractMetaContent(doc, "og:image");

            String combinedText = (title != null ? title : "") + " " + (description != null ? description : "");

            log.info("Facebook metadata - Title: {}", title);
            log.info("Facebook metadata - Description: {}", description);

            return VideoMetadata.builder()
                    .platform(Platform.FACEBOOK)
                    .url(url)
                    .title(cleanText(title))
                    .description(cleanText(description))
                    .hashtags(extractAllHashtags(combinedText))
                    .specificHashtags(extractSpecificHashtagsAsString(combinedText))
                    .thumbnail(thumbnail)
                    .build();

        } catch (Exception e) {
            log.error("Error analyzing Facebook URL: {}", e.getMessage());
            return VideoMetadata.builder()
                    .platform(Platform.FACEBOOK)
                    .url(url)
                    .error("Could not fetch video details.")
                    .build();
        }
    }

    private VideoMetadata analyzeInstagram(String url) {
        try {
            Document doc = fetchDocumentUtf8(url,
                "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)");

            String title = extractMetaContent(doc, "og:title");
            String description = extractMetaContent(doc, "og:description");
            String thumbnail = extractMetaContent(doc, "og:image");

            String combinedText = (title != null ? title : "") + " " + (description != null ? description : "");

            log.info("Instagram metadata - Title: {}", title);

            return VideoMetadata.builder()
                    .platform(Platform.INSTAGRAM)
                    .url(url)
                    .title(cleanText(title))
                    .description(cleanText(description))
                    .hashtags(extractAllHashtags(combinedText))
                    .specificHashtags(extractSpecificHashtagsAsString(combinedText))
                    .thumbnail(thumbnail)
                    .build();

        } catch (Exception e) {
            log.error("Error analyzing Instagram URL: {}", e.getMessage());
            return VideoMetadata.builder()
                    .platform(Platform.INSTAGRAM)
                    .url(url)
                    .error("Could not fetch video details.")
                    .build();
        }
    }

    private VideoMetadata analyzeYouTube(String url) {
        try {
            String videoId = extractYouTubeVideoId(url);
            String embedUrl = "https://www.youtube.com/watch?v=" + videoId;

            Document doc = fetchDocumentUtf8(embedUrl,
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

            String title = extractMetaContent(doc, "og:title");
            String description = extractMetaContent(doc, "og:description");
            String thumbnail = "https://img.youtube.com/vi/" + videoId + "/maxresdefault.jpg";

            String channelName = "";
            Element channelElement = doc.selectFirst("link[itemprop=name]");
            if (channelElement != null) {
                channelName = channelElement.attr("content");
            }

            String combinedText = (title != null ? title : "") + " " + (description != null ? description : "");

            log.info("YouTube metadata - Title: {}", title);

            return VideoMetadata.builder()
                    .platform(Platform.YOUTUBE)
                    .url(url)
                    .videoId(videoId)
                    .title(cleanText(title))
                    .description(cleanText(description))
                    .hashtags(extractAllHashtags(combinedText))
                    .specificHashtags(extractSpecificHashtagsAsString(combinedText))
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

    // Extract all hashtags from text including generic ones
    // Used for sending to Gemini for context
    private String extractAllHashtags(String text) {
        if (text == null) return "";

        Pattern pattern = Pattern.compile("#([\\w\u0E00-\u0E7F\u1000-\u109F\uAC00-\uD7A3]+)");
        Matcher matcher = pattern.matcher(text);

        StringBuilder hashtags = new StringBuilder();
        while (matcher.find()) {
            if (hashtags.length() > 0) hashtags.append(" ");
            hashtags.append(matcher.group());
        }

        return hashtags.toString();
    }

    // Extract only specific meaningful hashtags as a string
    // Used for display and passing around as text
    private String extractSpecificHashtagsAsString(String text) {
        List<String> list = extractSpecificHashtagList(text);
        if (list.isEmpty()) return "";
        return "#" + String.join(" #", list);
    }

    // Extract specific hashtags as a list, deduplicating them
    // Public so ChatService can use it directly for TMDB search
    public List<String> extractSpecificHashtagList(String text) {
        if (text == null) return List.of();

        Pattern pattern = Pattern.compile("#([\\w\u0E00-\u0E7F\u1000-\u109F\uAC00-\uD7A3]+)");
        Matcher matcher = pattern.matcher(text);

        // Use LinkedHashSet to deduplicate while preserving order
        Set<String> uniqueTags = new java.util.LinkedHashSet<>();

        while (matcher.find()) {
            String originalTag = matcher.group(1);
            String lowerTag = originalTag.toLowerCase();

            // Skip generic hashtags and very short ones
            if (!GENERIC_HASHTAGS.contains(lowerTag) && lowerTag.length() > 2) {
                uniqueTags.add(originalTag);
            }
        }

        return new ArrayList<>(uniqueTags);
    }

    private String extractMetaContent(Document doc, String property) {
        Element meta = doc.selectFirst("meta[property=" + property + "]");
        if (meta != null) {
            return meta.attr("content");
        }
        meta = doc.selectFirst("meta[name=" + property + "]");
        return meta != null ? meta.attr("content") : "";
    }

    private String extractYouTubeVideoId(String url) {
        String[] patterns = {
            "(?:youtube\\.com/watch\\?v=|youtu\\.be/|youtube\\.com/embed/)([a-zA-Z0-9_-]{11})",
            "youtube\\.com/shorts/([a-zA-Z0-9_-]{11})"
        };

        for (String patternStr : patterns) {
            Pattern compiledPattern = Pattern.compile(patternStr);
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
        private String hashtags;         // All hashtags including generic ones
        private String specificHashtags; // Only meaningful specific hashtags
        private String thumbnail;
        private String channelName;
        private String error;

        public boolean hasError() {
            return error != null && !error.isEmpty();
        }

        // Check if we have specific hashtags worth searching TMDB with
        public boolean hasSpecificHashtags() {
            return specificHashtags != null && !specificHashtags.trim().isEmpty();
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