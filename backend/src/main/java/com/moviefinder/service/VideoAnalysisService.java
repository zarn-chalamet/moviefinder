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

    /**
     * Main method: Analyze video using audio + frames with Gemini multimodal
     */
    public String analyzeVideoFrames(String url, String language) {
        Path tempDir = null;

        try {
            log.info("Starting multimodal vision analysis for URL: {}", url);

            tempDir = Files.createTempDirectory("moviefinder_");
            String videoPath = tempDir.resolve("clip.mp4").toString();

            // Step 1: Download video (30 seconds for better context)
            String downloadedPath = downloadVideo(url, tempDir.toString(), videoPath);
            if (downloadedPath == null || downloadedPath.isEmpty()) {
                return "Could not download video. The video may be private or restricted.";
            }

            // Step 2: Extract frames (8 frames at 720p)
            List<String> framePaths = extractFrames(downloadedPath, tempDir, 8);
            if (framePaths.isEmpty()) {
                return "Could not extract frames from video.";
            }

            // Step 3: Extract audio (for recap narration)
            String audioPath = extractAudio(downloadedPath, tempDir);
            String base64Audio = null;
            if (audioPath != null) {
                base64Audio = fileToBase64(audioPath);
                log.info("Audio extracted successfully ({} chars base64)", 
                    base64Audio != null ? base64Audio.length() : 0);
            } else {
                log.warn("Audio extraction failed, proceeding with frames only");
            }

            // Step 4: Convert frames to base64
            List<String> base64Frames = framesToBase64(framePaths);

            // Step 5: Call Gemini with audio + frames (multimodal)
            String response = callGeminiMultimodal(base64Audio, base64Frames, language);

            log.info("Multimodal analysis completed successfully");
            return response;

        } catch (Exception e) {
            log.error("Vision analysis failed: {}", e.getMessage(), e);
            return "Vision analysis failed: " + e.getMessage();
        } finally {
            cleanupFiles(tempDir);
        }
    }

    /**
     * Download video (30 seconds instead of 10)
     */
    private String downloadVideo(String url, String tempDir, String videoPath) {
        try {
            log.info("Downloading video with yt-dlp...");

            ProcessBuilder pb = new ProcessBuilder(
                ytDlpPath,
                "--no-warnings",
                "--no-playlist",
                "--ignore-errors",
                "--no-check-certificates",
                "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "-f", "best[height<=720][ext=mp4]/best[height<=720]/worst",
                "--download-sections", "*0:00-0:30",
                "--force-keyframes-at-cuts",
                "-o", videoPath,
                url
            );

            pb.redirectErrorStream(true);
            Process process = pb.start();

            String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            log.debug("yt-dlp output: {}", output);

            boolean finished = process.waitFor(30, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                log.warn("yt-dlp timed out after 30 seconds");
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

    /**
     * Extract 8 frames at 720p (was 5 at 480p)
     */
    private List<String> extractFrames(String videoPath, Path tempDir, int count) {
        List<String> framePaths = new ArrayList<>();

        try {
            if (videoPath.endsWith(".jpg") || videoPath.endsWith(".png")) {
                framePaths.add(videoPath);
                return framePaths;
            }

            String framePattern = tempDir.resolve("frame_%03d.jpg").toString();

            ProcessBuilder pb = new ProcessBuilder(
                ffmpegPath,
                "-y",
                "-i", videoPath,
                "-vf", "fps=1/3,scale=720:-2",  // 1 frame every 3 seconds at 720p
                "-frames:v", String.valueOf(count),
                "-q:v", "3",  // Higher quality
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

    /**
     * Extract audio for Gemini multimodal analysis
     */
    private String extractAudio(String videoPath, Path tempDir) {
        try {
            if (videoPath.endsWith(".jpg") || videoPath.endsWith(".png")) {
                return null; // No audio in image
            }

            String audioPath = tempDir.resolve("audio.mp3").toString();

            ProcessBuilder pb = new ProcessBuilder(
                ffmpegPath,
                "-y",
                "-i", videoPath,
                "-vn",                    // No video
                "-acodec", "libmp3lame",
                "-ar", "16000",           // 16kHz (optimal for Gemini)
                "-ac", "1",               // Mono
                "-b:a", "32k",            // Low bitrate (smaller file)
                "-t", "30",               // Max 30 seconds
                audioPath
            );

            pb.redirectErrorStream(true);
            Process process = pb.start();
            process.waitFor(15, TimeUnit.SECONDS);

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

    /**
     * Call Gemini with audio + frames (multimodal)
     */
    private String callGeminiMultimodal(String base64Audio, List<String> base64Frames, String language) {
        try {
            List<Map<String, Object>> parts = new ArrayList<>();

            // Add audio FIRST (highest priority signal)
            if (base64Audio != null && !base64Audio.isEmpty()) {
                parts.add(Map.of(
                    "inline_data", Map.of(
                        "mime_type", "audio/mp3",
                        "data", base64Audio
                    )
                ));
                log.info("Added audio to multimodal request");
            }

            // Add all frames
            for (String base64Frame : base64Frames) {
                parts.add(Map.of(
                    "inline_data", Map.of(
                        "mime_type", "image/jpeg",
                        "data", base64Frame
                    )
                ));
            }

            // Add prompt
            parts.add(Map.of("text", buildMultimodalPrompt(language, base64Frames.size(), base64Audio != null)));

            Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of("parts", parts)),
                "generationConfig", Map.of(
                    "temperature", 0.3,
                    "topK", 32,
                    "topP", 0.9,
                    "maxOutputTokens", 8192  // Increased from 2048
                )
            );

            String url = baseUrl + "/models/" + model + ":generateContent?key=" + apiKey;

            log.info("Sending {} frames + {} to Gemini Multimodal...", 
                base64Frames.size(), 
                base64Audio != null ? "audio" : "no audio");

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

    /**
     * Strict format prompt for audio + frames
     */
    private String buildMultimodalPrompt(String language, int frameCount, boolean hasAudio) {
        String langInstruction = switch (language) {
            case "th" -> "Respond in Thai (ภาษาไทย)";
            case "my" -> "Respond in Burmese (မြန်မာဘာသာ)";
            default -> "Respond in English";
        };

        String audioInstructions = hasAudio ? """
            STEP 1 - LISTEN TO THE AUDIO CAREFULLY:
            - The audio may contain recap narration in Burmese, Thai, English, Korean, or Chinese
            - Recap narrators OFTEN say the movie/show name directly:
              * Burmese: "ဒီကားက ___ ဆိုတဲ့..." (This movie is called ___)
              * Thai: "หนังเรื่องนี้ชื่อ ___" (This movie is called ___)
              * English: "In the movie ___..." or "This show called ___..."
            - Listen for character names, locations mentioned
            - Note any recognizable music/soundtrack
            - If you hear original movie dialogue, note the language
            
            """ : "";

        return String.format("""
            You are an expert movie/TV show identification AI.
            Analyze the provided %s%d video frames to identify the content.
            
            %s
            
            %sSTEP 2 - EXAMINE THE FRAMES:
            - Read any subtitles visible (Burmese, Thai, Korean, English, Chinese)
            - Identify actors, settings, costumes, time period
            - Look for title cards or text overlays
            
            STEP 3 - IDENTIFY using ALL evidence above.
            
            CRITICAL RULES:
            1. Use the ENGLISH/INTERNATIONAL title (NOT Korean/Chinese/Japanese characters in the main title)
               Example: Use "Your Honor" NOT "유어 아너", "Parasite" NOT "기생충"
            2. NO long preambles like "I've analyzed the frames..."
            3. Start directly with the format below
            
            RESPONSE FORMAT (use EXACTLY this structure):
            
            🎬 **[English Title] (Year)**
            
            📺 **Type:** Movie or TV Series
            🎭 **Genre:** [genres]
            ⭐ **Cast:** [main actors]
            📖 **Plot:** [2-3 sentence description]
            🎙️ **Audio Evidence:** [What you heard - transcribe key phrases]
            👁️ **Visual Evidence:** [Key visual clues]
            🎯 **Confidence:** High / Medium / Low
            
            If you CANNOT identify with confidence:
            
            ❌ **Could not identify**
            🎙️ **Audio heard:** [What you transcribed]
            👁️ **Visual seen:** [What you observed]
            ❓ **Need more info:** [What would help]
            
            Keep response under 300 words. Be concise and specific.
            """, 
            hasAudio ? "audio and " : "",
            frameCount, 
            langInstruction,
            audioInstructions
        );
    }

    /**
     * Better response parsing with truncation detection
     */
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
                return "Content was blocked by safety filter. Please try a different video.";
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