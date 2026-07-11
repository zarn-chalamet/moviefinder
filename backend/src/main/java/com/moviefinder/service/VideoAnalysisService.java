package com.moviefinder.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class VideoAnalysisService {

    @Value("${api.gemini.api-key}")
    private String apiKey;

    @Value("${api.gemini.base-url}")
    private String baseUrl;

    @Value("${api.gemini.model:gemini-2.0-flash-exp}")
    private String model;

    @Value("${tools.ytdlp.path:yt-dlp}")
    private String ytDlpPath;

    @Value("${tools.ffmpeg.path:ffmpeg}")
    private String ffmpegPath;

    @Value("${tools.ffprobe.path:ffprobe}")
    private String ffprobePath;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final WebClient webClient;

    public VideoAnalysisService(WebClient webClient) {
        this.webClient = webClient;
    }

    // Video info from initial probe - does not require full download
    public static class VideoInfo {
        public double durationSeconds;
        public int width;
        public int height;
        public boolean hasAudio;
        public String errorMessage;

        public boolean isValid() {
            return errorMessage == null && durationSeconds > 0;
        }

        public boolean isLikelyRecap() {
            // Recap videos are typically 3+ minutes with audio
            return durationSeconds >= 180 && hasAudio;
        }

        public boolean isLikelyShortClip() {
            // Scene clips are typically under 2 minutes
            return durationSeconds < 120;
        }

        public boolean isVertical() {
            return height > width;
        }
    }

    // Get video info WITHOUT downloading the video
    // Uses yt-dlp to just get metadata
    public VideoInfo getVideoInfo(String url) {
        VideoInfo info = new VideoInfo();

        try {
            log.info("Getting video info for: {}", url);

            ProcessBuilder pb = new ProcessBuilder(
                ytDlpPath,
                "--no-warnings",
                "--no-playlist",
                "--dump-json",
                "--skip-download",
                "--no-check-certificates",
                "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                url
            );

            pb.redirectErrorStream(false);
            Process process = pb.start();

            String jsonOutput = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            boolean finished = process.waitFor(20, TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();
                info.errorMessage = "Timeout getting video info";
                return info;
            }

            if (jsonOutput.isEmpty()) {
                info.errorMessage = "No metadata returned";
                return info;
            }

            JsonNode root = objectMapper.readTree(jsonOutput);
            info.durationSeconds = root.path("duration").asDouble(0);
            info.width = root.path("width").asInt(0);
            info.height = root.path("height").asInt(0);

            // Check if audio track exists
            JsonNode formats = root.path("formats");
            info.hasAudio = false;
            if (formats.isArray()) {
                for (JsonNode format : formats) {
                    if (!format.path("acodec").asText("none").equals("none")) {
                        info.hasAudio = true;
                        break;
                    }
                }
            }
            // Fallback check
            if (!info.hasAudio) {
                info.hasAudio = !root.path("acodec").asText("none").equals("none");
            }

            log.info("Video info: duration={}s, {}x{}, hasAudio={}",
                info.durationSeconds, info.width, info.height, info.hasAudio);

        } catch (Exception e) {
            log.error("Failed to get video info: {}", e.getMessage());
            info.errorMessage = e.getMessage();
        }

        return info;
    }

    // Main analysis - now supports different download durations
    // For recap videos, download longer to catch narrator's title mention
    public String analyzeVideoFrames(String url, String language, boolean isRecap) {
        Path tempDir = null;

        try {
            log.info("Starting multimodal vision analysis (isRecap={}) for URL: {}", isRecap, url);

            tempDir = Files.createTempDirectory("moviefinder_");
            String videoPath = tempDir.resolve("clip.mp4").toString();

            // For recaps, download 120 seconds to catch narrator's title mention
            // For scenes, 30 seconds is enough
            int downloadDuration = isRecap ? 120 : 30;

            String downloadedPath = downloadVideo(url, tempDir.toString(), videoPath, downloadDuration);
            if (downloadedPath == null || downloadedPath.isEmpty()) {
                return "Could not download video. The video may be private or restricted.";
            }

            // For recaps, extract more frames spread across the download
            int frameCount = isRecap ? 12 : 8;
            List<String> framePaths = extractFrames(downloadedPath, tempDir, frameCount, isRecap);
            if (framePaths.isEmpty()) {
                return "Could not extract frames from video.";
            }

            // Extract audio - critical for recap videos
            String audioPath = extractAudio(downloadedPath, tempDir, downloadDuration);
            String base64Audio = null;
            if (audioPath != null) {
                base64Audio = fileToBase64(audioPath);
                log.info("Audio extracted successfully ({} chars base64)",
                    base64Audio != null ? base64Audio.length() : 0);
            } else {
                log.warn("Audio extraction failed, proceeding with frames only");
            }

            List<String> base64Frames = framesToBase64(framePaths);

            // Use different prompt based on video type
            String response = callGeminiMultimodal(base64Audio, base64Frames, language, isRecap);

            log.info("Multimodal analysis completed successfully");
            return response;

        } catch (Exception e) {
            log.error("Vision analysis failed: {}", e.getMessage(), e);
            return "Vision analysis failed: " + e.getMessage();
        } finally {
            cleanupFiles(tempDir);
        }
    }

    // Backward compatible version - defaults to scene clip
    public String analyzeVideoFrames(String url, String language) {
        return analyzeVideoFrames(url, language, false);
    }

    // Download video with configurable duration
    private String downloadVideo(String url, String tempDir, String videoPath, int durationSeconds) {
        try {
            log.info("Downloading first {} seconds of video with yt-dlp...", durationSeconds);

            String timeRange = "*0:00-0:" + String.format("%02d", Math.min(durationSeconds, 59));
            if (durationSeconds >= 60) {
                int minutes = durationSeconds / 60;
                int seconds = durationSeconds % 60;
                timeRange = String.format("*0:00-%d:%02d", minutes, seconds);
            }

            ProcessBuilder pb = new ProcessBuilder(
                ytDlpPath,
                "--no-warnings",
                "--no-playlist",
                "--ignore-errors",
                "--no-check-certificates",
                "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "-f", "best[height<=720][ext=mp4]/best[height<=720]/worst",
                "--download-sections", timeRange,
                "--force-keyframes-at-cuts",
                "-o", videoPath,
                url
            );

            pb.redirectErrorStream(true);
            Process process = pb.start();

            String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            log.debug("yt-dlp output: {}", output);

            // Longer timeout for longer downloads
            int timeoutSeconds = Math.max(30, durationSeconds);
            boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                log.warn("yt-dlp timed out after {} seconds", timeoutSeconds);
            }

            File videoFile = new File(videoPath);

            if (videoFile.exists() && videoFile.length() > 0) {
                log.info("Video downloaded successfully ({} bytes)", videoFile.length());
                return videoPath;
            }

            log.error("yt-dlp failed: {}", output);
            return downloadThumbnail(url, tempDir);

        } catch (Exception e) {
            log.error("yt-dlp download failed: {}", e.getMessage());
            return downloadThumbnail(url, tempDir);
        }
    }

    private String downloadThumbnail(String url, String tempDir) {
        try {
            log.info("Falling back to thumbnail download...");
            String thumbnailUrl = extractThumbnailUrl(url);
            if (thumbnailUrl == null) return null;

            String imagePath = tempDir + "/thumbnail.jpg";

            byte[] imageBytes = webClient.get()
                    .uri(thumbnailUrl)
                    .retrieve()
                    .bodyToMono(byte[].class)
                    .block();

            if (imageBytes != null) {
                Files.write(Paths.get(imagePath), imageBytes);
                log.info("Thumbnail downloaded successfully");
                return imagePath;
            }

        } catch (Exception e) {
            log.error("Thumbnail download failed: {}", e.getMessage());
        }
        return null;
    }

    private String extractThumbnailUrl(String url) {
        if (url.contains("youtube.com") || url.contains("youtu.be")) {
            String videoId = extractYouTubeId(url);
            if (videoId != null) {
                return "https://img.youtube.com/vi/" + videoId + "/maxresdefault.jpg";
            }
        }
        return null;
    }

    private String extractYouTubeId(String url) {
        if (url.contains("youtu.be/")) {
            return url.substring(url.lastIndexOf("/") + 1).split("\\?")[0];
        }
        if (url.contains("v=")) {
            return url.substring(url.indexOf("v=") + 2).split("&")[0];
        }
        if (url.contains("/shorts/")) {
            return url.substring(url.lastIndexOf("/") + 1).split("\\?")[0];
        }
        return null;
    }

    // Extract frames - for recaps, spread them more evenly across the download
    private List<String> extractFrames(String videoPath, Path tempDir, int count, boolean isRecap) {
        List<String> framePaths = new ArrayList<>();

        try {
            if (videoPath.endsWith(".jpg") || videoPath.endsWith(".png")) {
                framePaths.add(videoPath);
                return framePaths;
            }

            String framePattern = tempDir.resolve("frame_%03d.jpg").toString();

            // For recap videos, sample every 10 seconds
            // For scene clips, sample every 3 seconds
            String fpsFilter = isRecap ? "fps=1/10,scale=720:-2" : "fps=1/3,scale=720:-2";

            ProcessBuilder pb = new ProcessBuilder(
                ffmpegPath,
                "-y",
                "-i", videoPath,
                "-vf", fpsFilter,
                "-frames:v", String.valueOf(count),
                "-q:v", "3",
                framePattern
            );

            pb.redirectErrorStream(true);
            Process process = pb.start();
            String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            process.waitFor(15, TimeUnit.SECONDS);

            for (int i = 1; i <= count; i++) {
                Path framePath = tempDir.resolve(String.format("frame_%03d.jpg", i));
                if (Files.exists(framePath)) {
                    framePaths.add(framePath.toString());
                }
            }

            log.info("Extracted {} frames", framePaths.size());

            if (framePaths.isEmpty()) {
                log.error("FFmpeg output: {}", output);
            }

        } catch (Exception e) {
            log.error("Frame extraction failed: {}", e.getMessage());
            if (videoPath.endsWith(".jpg") || videoPath.endsWith(".png")) {
                framePaths.add(videoPath);
            }
        }

        return framePaths;
    }

    // Extract audio - higher quality for recap videos to help with title recognition
    private String extractAudio(String videoPath, Path tempDir, int maxSeconds) {
        try {
            if (videoPath.endsWith(".jpg") || videoPath.endsWith(".png")) {
                return null;
            }

            String audioPath = tempDir.resolve("audio.mp3").toString();

            ProcessBuilder pb = new ProcessBuilder(
                ffmpegPath,
                "-y",
                "-i", videoPath,
                "-vn",
                "-acodec", "libmp3lame",
                "-ar", "16000",
                "-ac", "1",
                "-b:a", "64k",              // Increased from 32k for clearer speech
                "-t", String.valueOf(maxSeconds),
                audioPath
            );

            pb.redirectErrorStream(true);
            Process process = pb.start();
            process.waitFor(20, TimeUnit.SECONDS);

            File audioFile = new File(audioPath);
            if (audioFile.exists() && audioFile.length() > 0) {
                log.info("Audio extracted: {} bytes", audioFile.length());
                return audioPath;
            }

            log.warn("Audio file not created or empty");
            return null;

        } catch (Exception e) {
            log.error("Audio extraction failed: {}", e.getMessage());
            return null;
        }
    }

    private List<String> framesToBase64(List<String> framePaths) {
        List<String> base64Frames = new ArrayList<>();

        for (String path : framePaths) {
            String base64 = fileToBase64(path);
            if (base64 != null) {
                base64Frames.add(base64);
            }
        }

        return base64Frames;
    }

    private String fileToBase64(String path) {
        try {
            byte[] bytes = Files.readAllBytes(Paths.get(path));
            return Base64.getEncoder().encodeToString(bytes);
        } catch (IOException e) {
            log.error("Failed to encode file to base64: {}", e.getMessage());
            return null;
        }
    }

    // Call Gemini with different prompts for recap vs scene
    private String callGeminiMultimodal(String base64Audio, List<String> base64Frames,
                                         String language, boolean isRecap) {
        try {
            List<Map<String, Object>> parts = new ArrayList<>();

            // Add audio FIRST - highest priority for recap videos
            if (base64Audio != null && !base64Audio.isEmpty()) {
                parts.add(Map.of(
                    "inline_data", Map.of(
                        "mime_type", "audio/mp3",
                        "data", base64Audio
                    )
                ));
                log.info("Added audio to multimodal request");
            }

            for (String base64Frame : base64Frames) {
                parts.add(Map.of(
                    "inline_data", Map.of(
                        "mime_type", "image/jpeg",
                        "data", base64Frame
                    )
                ));
            }

            String prompt = isRecap
                ? buildRecapPrompt(language, base64Frames.size(), base64Audio != null)
                : buildScenePrompt(language, base64Frames.size(), base64Audio != null);

            parts.add(Map.of("text", prompt));

            Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of("parts", parts)),
                "generationConfig", Map.of(
                    "temperature", 0.2,      // Lower for more consistent results
                    "topK", 20,
                    "topP", 0.85,
                    "maxOutputTokens", 8192
                )
            );

            String url = baseUrl + "/models/" + model + ":generateContent?key=" + apiKey;

            log.info("Sending {} frames + {} to Gemini (mode: {})",
                base64Frames.size(),
                base64Audio != null ? "audio" : "no audio",
                isRecap ? "RECAP" : "SCENE");

            String response = webClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseVisionResponse(response);

        } catch (Exception e) {
            log.error("Gemini Multimodal API call failed: {}", e.getMessage());
            return "Vision API call failed: " + e.getMessage();
        }
    }

    // RECAP-specific prompt - focus on narration and story
    private String buildRecapPrompt(String language, int frameCount, boolean hasAudio) {
        String langInstruction = switch (language) {
            case "th" -> "Respond in Thai (ภาษาไทย)";
            case "my" -> "Respond in Burmese (မြန်မာဘာသာ)";
            default -> "Respond in English";
        };

        return String.format("""
            You are analyzing a MOVIE RECAP video where a narrator explains a movie's plot.
            The audio contains narration in Burmese, Thai, English, Korean, or Chinese.

            CRITICAL CONTEXT ABOUT RECAP VIDEOS:
            - The narrator often says the movie title at the BEGINNING
            - Character names shown in text overlays are FAKE (made up by the narrator)
            - The visual clips are from the ACTUAL movie
            - Focus on the STORY the narrator describes, not character names
            - The channel/creator name is NOT the movie title

            %s

            STEP 1 - LISTEN TO AUDIO NARRATION VERY CAREFULLY:
            The narrator likely says the movie name using phrases like:
            - Burmese: "ဒီကားက ___ ဆိုတဲ့..." (This movie called ___)
            - Burmese: "___ ဆိုတဲ့ ရုပ်ရှင်" (Movie called ___)
            - Thai: "หนังเรื่องนี้ชื่อ ___" (This movie is called ___)
            - Thai: "วันนี้เราจะมาเล่าเรื่อง ___" (Today we tell story of ___)
            - English: "Today's movie is ___" or "In the movie ___"
            - English: "This film is called ___" or "The movie ___ tells the story of..."

            TRANSCRIBE ANY MOVIE TITLE MENTIONED IN THE AUDIO.

            STEP 2 - IDENTIFY THE STORY:
            What plot is the narrator describing?
            - Setting (year, country, environment)
            - Main character situation
            - Key conflict or event
            - Time period

            STEP 3 - MATCH TO KNOWN MOVIES:
            Based on the story described, what movie could this be?

            IMPORTANT: If unsure, list MULTIPLE possibilities. Do not guess one specific title.

            %d frames%s provided.

            Respond with ONLY valid JSON (no markdown, no code blocks):
            {
              "titleFromAudio": "Movie title if narrator mentioned it, otherwise null",
              "titleConfidence": "HIGH or MEDIUM or LOW or NONE",
              "audioLanguage": "burmese or thai or english or korean or chinese or unknown",
              "storyDescription": "2-3 sentence summary of what narrator describes",
              "possibleMovies": [
                {
                  "title": "Possible movie title",
                  "year": "2020 or unknown",
                  "reason": "Why this could match"
                }
              ],
              "visualStyle": "hollywood or korean drama or chinese drama or indie or documentary",
              "genre": "drama, comedy, thriller, romance, etc",
              "keyElements": "Notable visual or story elements"
            }

            RULES:
            - If narrator clearly says a title, put it in titleFromAudio with HIGH confidence
            - If unclear, list 2-4 possibleMovies
            - Do NOT list the same fake title multiple times
            - Do NOT identify the recap channel name as the movie
            - It is BETTER to list multiple possibilities than one wrong answer
            """,
            langInstruction,
            frameCount,
            hasAudio ? " with audio" : ""
        );
    }

    // SCENE-specific prompt - focus on visuals and actors
    private String buildScenePrompt(String language, int frameCount, boolean hasAudio) {
        String langInstruction = switch (language) {
            case "th" -> "Respond in Thai (ภาษาไทย)";
            case "my" -> "Respond in Burmese (မြန်မာဘာသာ)";
            default -> "Respond in English";
        };

        String audioSection = hasAudio ? """
            STEP 1 - LISTEN TO THE AUDIO:
            - What language is spoken?
            - Any recognizable dialogue phrases?
            - Any music that identifies a specific show?

            """ : "";

        return String.format("""
            You are analyzing a SCENE CLIP from a movie or TV show.
            This is likely a direct scene, not a recap.

            %s

            %sSTEP 2 - EXAMINE THE VISUALS:
            - Read any subtitles visible (Burmese, Thai, Korean, English, Chinese)
            - Note the setting, costumes, time period
            - Look for title cards or text overlays
            - Production style (Hollywood, K-drama, Chinese, etc)

            STEP 3 - IDENTIFY the movie or show.

            CRITICAL RULES:
            1. If you are NOT SURE, list multiple possibilities instead of guessing one
            2. Only list titles you have actual knowledge of
            3. Do NOT invent titles that "sound right" for the genre
            4. It is BETTER to say "unknown" than to guess wrong

            %d frames%s provided.

            Respond with ONLY valid JSON (no markdown, no code blocks):
            {
              "titleFromAudio": null,
              "titleConfidence": "HIGH or MEDIUM or LOW or NONE",
              "audioLanguage": "language heard",
              "storyDescription": "What appears to happen in the scene",
              "possibleMovies": [
                {
                  "title": "Movie or show title",
                  "year": "year or unknown",
                  "reason": "Why this matches"
                }
              ],
              "visualStyle": "hollywood, korean drama, chinese, indie, etc",
              "genre": "genre",
              "keyElements": "Key observations"
            }

            RULES:
            - certaintyLevel NONE if you are guessing
            - possibleMovies empty [] if you cannot identify
            - List 3-5 possibilities if uncertain
            """,
            langInstruction,
            audioSection,
            frameCount,
            hasAudio ? " with audio" : ""
        );
    }

    private String parseVisionResponse(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);

            if (root.has("error")) {
                String msg = root.path("error").path("message").asText();
                log.error("Gemini Vision error: {}", msg);
                return "Vision API error: " + msg;
            }

            JsonNode candidates = root.path("candidates");
            if (candidates.isEmpty()) {
                log.error("No candidates in response");
                return "No response from vision API.";
            }

            JsonNode candidate = candidates.get(0);

            String finishReason = candidate.path("finishReason").asText();
            if ("MAX_TOKENS".equals(finishReason)) {
                log.warn("Response truncated due to MAX_TOKENS limit");
            }
            if ("SAFETY".equals(finishReason)) {
                log.warn("Response blocked by safety filter");
                return "Content was blocked by safety filter.";
            }

            JsonNode parts = candidate.path("content").path("parts");
            if (parts.isEmpty()) {
                log.error("No parts in candidate response");
                return "Empty response from vision API.";
            }

            String text = parts.get(0).path("text").asText().trim();

            if (text.isEmpty()) {
                log.error("Empty text in vision response");
                return "Vision API returned empty response.";
            }

            log.info("Vision response received ({} chars)", text.length());
            return text;

        } catch (Exception e) {
            log.error("Failed to parse vision response", e);
            return "Failed to parse vision response.";
        }
    }

    private void cleanupFiles(Path tempDir) {
        if (tempDir == null) return;
        try {
            File dir = tempDir.toFile();
            File[] files = dir.listFiles();
            if (files != null) {
                for (File file : files) file.delete();
            }
            dir.delete();
            log.debug("Cleanup completed for: {}", tempDir);
        } catch (Exception e) {
            log.error("Cleanup failed: {}", e.getMessage());
        }
    }
}