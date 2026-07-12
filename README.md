# 🎬 MovieFinder

<div align="center">

**AI-Powered Movie Identifier for Social Media Clips**

Paste a TikTok, Facebook, Instagram, or YouTube link — and let AI identify the movie or show with complete information, streaming options, and recommendations. Built especially for Myanmar and Thai audiences.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen)
![Java](https://img.shields.io/badge/Java-17-orange)
![Gemini](https://img.shields.io/badge/AI-Gemini%202.0-purple)

</div>

---

## ✨ Features

### Core Identification
- **🔗 Smart URL Analysis** — Paste any TikTok, Facebook, Instagram, or YouTube link and AI identifies the movie
- **🎥 Recap Video Detection** — Automatically detects and analyzes movie recap videos (5-15 min long)
- **🎯 Multi-Signal Analysis** — Uses metadata, hashtags, audio narration, and video frames
- **🌏 Multi-Language Support** — Works with content in English, Korean, Chinese, Japanese, Thai, Burmese, German, and more
- **🔍 Country-Aware Search** — Correctly identifies foreign films (Korean K-dramas, German films, etc.)
- **📊 Confidence Scoring** — Shows how certain the AI is (CERTAIN / LIKELY / UNCERTAIN / UNKNOWN)

### User Experience
- **💬 Multilingual Chat** — Full UI and AI responses in English, Thai (ภาษาไทย), and Burmese (မြန်မာ)
- **🎬 Rich Movie Cards** — Complete info: title, rating, year, runtime, genres, cast, director, plot
- **📺 Where to Watch** — Streaming platforms including Netflix, Disney+, TrueID, Viu, and more
- **📥 Download Links** — Torrent and free streaming site links with direct search
- **🎯 Similar Movies** — Get personalized recommendations based on any identified movie
- **🔄 Retry & New Chat** — Retry any bot response or start fresh conversations
- **📋 Copy Messages** — Easy copy for sharing
- **❤️ Save Movies** — Save favorites locally (no account required)
- **📱 Fully Responsive** — Beautiful on desktop and mobile

### Smart Handling
- **🇨🇳 Chinese Short Drama Detection** — Recognizes vertical short dramas and redirects to appropriate platforms (ShortMax, DramaBox, ReelShort)
- **🤔 Multiple Candidates** — Shows options when uncertain, lets user pick the correct one
- **❌ Honest Uncertainty** — Admits when it cannot identify instead of showing wrong answers

---

## 🛠️ Tech Stack

### Frontend
| Technology       | Purpose                          |
|------------------|----------------------------------|
| **React 18**     | UI Framework                     |
| **TypeScript**   | Type Safety                      |
| **Vite**         | Build Tool & Dev Server          |
| **Tailwind CSS 4**| Styling                         |
| **Framer Motion**| Smooth Animations                |
| **Zustand**      | State Management                 |
| **Axios**        | HTTP Client                      |
| **Lucide React** | Icon Library                     |

### Backend
| Technology           | Purpose                              |
|----------------------|--------------------------------------|
| **Spring Boot 3.2.5**| REST API Framework                   |
| **Java 17**          | Core Language                        |
| **Spring WebFlux**   | Reactive HTTP Client                 |
| **Caffeine**         | In-memory Caching                    |
| **Jsoup**            | HTML Parsing & URL Scraping          |
| **Lombok**           | Boilerplate Reduction                |
| **Jackson**          | JSON Processing                      |
| **H2 Database**      | In-memory storage (dev)              |

### AI & External Services
| Service              | Purpose                                      | Status     |
|----------------------|----------------------------------------------|------------|
| **Google Gemini 2.0**| Multimodal AI (vision + audio + text)        | Required   |
| **TMDB API**         | Movie data, posters, streaming providers     | Required   |

### External Tools (Backend)
| Tool                 | Purpose                                      |
|----------------------|----------------------------------------------|
| **yt-dlp**           | Download videos from social media            |
| **ffmpeg**           | Extract frames and audio from videos         |
| **ffprobe**          | Get video metadata (duration, resolution)    |

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                      React Frontend                            │
│  Home │ Chat │ Trending │ Movie Detail │ Saved │ About        │
└──────────────────────┬─────────────────────────────────────────┘
                       │ REST API
                       ▼
┌────────────────────────────────────────────────────────────────┐
│                   Spring Boot Backend                          │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              ChatService (Orchestrator)                 │   │
│  └─────┬───────────┬──────────┬─────────────┬──────────────┘   │
│        │           │          │             │                  │
│        ▼           ▼          ▼             ▼                  │
│  ┌──────────┐ ┌─────────┐ ┌────────┐ ┌──────────────┐          │
│  │  Gemini  │ │  TMDB   │ │  URL   │ │VideoAnalysis │          │
│  │ Service  │ │ Service │ │Analyzer│ │  Service     │          │
│  └──────────┘ └─────────┘ └────────┘ └──────────────┘          │
└──────┬────────────┬───────────┬───────────┬────────────────────┘
       │            │           │           │
       ▼            ▼           ▼           ▼
  ┌─────────┐  ┌─────────┐  ┌──────┐  ┌───────────────┐
  │ Google  │  │  TMDB   │  │Jsoup │  │ yt-dlp        │
  │ Gemini  │  │  API    │  │      │  │ + ffmpeg      │
  └─────────┘  └─────────┘  └──────┘  └───────────────┘
```

---

## 🧠 How It Works

The system uses a **smart multi-strategy pipeline** that routes videos based on content type:

```
1. Extract URL Metadata (title, description, hashtags)
        ↓
2. Get Video Info (duration, resolution, has audio?)
        ↓
3. Classify Content Type (Gemini):
   → RECAP_VIDEO (3-15 min narration)
   → SCENE_CLIP (< 2 min)
   → TRAILER
   → CHINESE_SHORT_DRAMA (vertical, short)
   → ANIME
        ↓
4. Route to Best Strategy:
   
   For RECAP_VIDEO:
   → Download 120s of video
   → Extract 12 frames + audio
   → Ask Gemini to focus on narrator's title mention
   → Search TMDB with country/language awareness
   
   For CHINESE_SHORT_DRAMA:
   → Redirect to appropriate platforms
   
   For SCENE_CLIP:
   → Try hashtag search first
   → Then explicit title from metadata
   → Then AI metadata analysis
   → Finally vision analysis
        ↓
5. Score Multiple Candidates:
   → Original language characters match: +100
   → Year exact match: +80
   → Wrong country penalty: -80
        ↓
6. Return Best Match with Confidence Score
        ↓
7. If asking follow-up (similar movies):
   → Use TMDB /similar endpoint
   → Fallback to Gemini + TMDB search
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **Java** 17+
- **Maven** 3.8+
- **yt-dlp** (for video download)
- **ffmpeg** & **ffprobe** (for frame/audio extraction)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/moviefinder.git
cd moviefinder
```

### 2. Install External Tools

**Windows:**
```powershell
# Using winget
winget install yt-dlp.yt-dlp
winget install Gyan.FFmpeg
```

**macOS:**
```bash
brew install yt-dlp ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
pip install yt-dlp
```

### 3. Setup Backend

```bash
cd backend

# Configure API keys in application.properties
# See "Configuration" section below

# Start the backend
mvn spring-boot:run
```

Backend runs at: **http://localhost:8080**

### 4. Setup Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🔑 Required API Keys

| API                | Purpose                              | Required? | Get Key |
|--------------------|--------------------------------------|-----------|---------|
| **Google Gemini**  | AI vision, audio, and text analysis  | Yes       | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **TMDB**           | Movie database, posters, streaming   | Yes       | [themoviedb.org](https://www.themoviedb.org/settings/api) |

---

## ⚙️ Configuration

### Backend (`backend/src/main/resources/application.properties`)

```properties
# API Keys
api.gemini.api-key=YOUR_GEMINI_KEY
api.gemini.base-url=https://generativelanguage.googleapis.com/v1beta
api.gemini.model=gemini-2.0-flash-exp

api.tmdb.api-key=YOUR_TMDB_KEY
api.tmdb.base-url=https://api.themoviedb.org/3
api.tmdb.image-base-url=https://image.tmdb.org/t/p

# External tools (adjust paths for your system)
tools.ytdlp.path=yt-dlp
tools.ffmpeg.path=ffmpeg
tools.ffprobe.path=ffprobe

# Encoding (important for Asian languages)
server.servlet.encoding.charset=UTF-8
server.servlet.encoding.enabled=true
server.servlet.encoding.force=true

# Async timeout for long video processing
spring.mvc.async.request-timeout=120000
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_USE_MOCK_API=false
```

---

## 📁 Project Structure

```
moviefinder/
├── backend/
│   ├── src/main/java/com/moviefinder/
│   │   ├── controller/
│   │   │   └── ChatController.java
│   │   ├── service/
│   │   │   ├── ChatService.java          # Main orchestrator
│   │   │   ├── GeminiService.java        # AI text/audio/vision analysis
│   │   │   ├── VideoAnalysisService.java # Video download, frame/audio extraction
│   │   │   ├── TmdbService.java          # Movie database lookup
│   │   │   └── UrlAnalyzerService.java   # Social media metadata extraction
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   └── response/
│   │   └── MovieFinderApplication.java
│   ├── tools/                            # yt-dlp, ffmpeg binaries (gitignored)
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatPage.tsx
│   │   │   ├── MovieCandidatesList.tsx
│   │   │   ├── ConfidenceBadge.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── MovieDetailPage.tsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── chatService.ts
│   │   │   ├── movieService.ts
│   │   │   └── api.ts
│   │   ├── store/
│   │   │   └── appStore.ts               # Zustand state management
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── i18n/
│   │   │   └── translations.ts
│   │   └── App.tsx
│   ├── vite.config.ts
│   └── package.json
│
└── README.md
```

---

## 📦 Main API Endpoints

| Method | Endpoint                          | Description                                |
|--------|-----------------------------------|--------------------------------------------|
| POST   | `/api/v1/chat/send`               | Send chat message (URL or description)     |
| POST   | `/api/v1/chat/analyze-url`        | Analyze social media URL directly          |
| POST   | `/api/v1/chat/analyze-image`      | Analyze screenshot                          |
| GET    | `/api/v1/movies/search`           | Search movies by query                      |
| GET    | `/api/v1/movies/{id}`             | Get movie details                          |
| GET    | `/api/v1/movies/trending`         | Get trending movies                        |
| GET    | `/api/v1/movies/{id}/streaming`   | Get streaming providers by country         |
| GET    | `/api/v1/movies/{id}/similar`     | Get similar movies                         |

---

## 🎯 Response Format

The backend returns rich responses with confidence indicators:

```json
{
  "success": true,
  "data": {
    "reply": "🎬 **Movie Title** (2024)...",
    "movieContext": {
      "tmdbId": 12345,
      "title": "Movie Title",
      "year": "2024",
      "rating": 7.5,
      "genres": ["Drama", "Action"],
      "cast": ["Actor 1", "Actor 2"],
      "director": "Director Name",
      "overview": "Plot description...",
      "posterUrl": "https://...",
      "backdropUrl": "https://..."
    },
    "candidates": [],
    "streamingInfo": [],
    "confidenceScore": 82,
    "confidenceLevel": "LIKELY",
    "contentType": "RECAP_VIDEO",
    "analysisMethod": "recap_match",
    "suggestions": ["Where can I watch?", "Similar movies?"]
  }
}
```

### Confidence Levels
- 🟢 **CERTAIN** (90-100%) - Very confident match
- 🔵 **LIKELY** (70-89%) - Probable match
- 🟡 **UNCERTAIN** (50-69%) - Best guess, might be wrong
- 🔴 **UNKNOWN** (0-49%) - Cannot reliably identify

### Analysis Methods
- `hashtag` - Identified via specific hashtags
- `explicit_title` - Title found in description
- `metadata_ai` - AI analyzed metadata
- `recap_match` - Recap video analysis
- `recap_candidates` - Multiple recap matches
- `audio_narration` - Detected from audio
- `vision` - Video frame analysis
- `similar_movies` - Similar movie recommendations
- `classification` - Content classified only

---

## 🌍 Special Content Handling

### Recap Videos
Long-form (5-15 min) videos where narrators describe movies. The system:
- Downloads 120 seconds of video (vs 30s for short clips)
- Extracts 12 frames spread throughout
- Uses high-quality audio (64kbps)
- Focuses Gemini on narrator's spoken title
- Ignores fake character names shown on screen

### Chinese Short Dramas
Vertical format, very short episodes (微短剧). Not available in TMDB, so we:
- Detect the format automatically
- Redirect users to ShortMax, DramaBox, ReelShort, GoodShort

### Foreign Films
For Korean, Chinese, Japanese, German, and other non-English films:
- Searches TMDB in the original language (ko-KR, zh-CN, ja-JP, de-DE)
- Scores candidates by character set match (+100 for exact match)
- Penalizes wrong-country matches (-80)
- Uses year matching to disambiguate similar titles

---

## 📈 Current Accuracy

| Content Type | Accuracy |
|--------------|----------|
| Videos with specific hashtags | ~85% |
| Recap videos (English narration) | ~65-75% |
| Recap videos (Burmese/Thai narration) | ~60-70% |
| Popular Hollywood movies | ~75% |
| Korean K-dramas | ~55% |
| Foreign indie films | ~40% |
| Chinese short dramas | Redirected |
| Random silent clips | ~15% (honest) |
| **Overall** | **~55-65%** |

---

## 🚧 Known Limitations

- **UTF-8 in Windows CMD** — Burmese/Korean characters may show garbled in console (data is fine in memory)
- **Obscure films** — Very obscure regional films may not be in TMDB
- **Silent clips** — Videos without audio or clear visual cues are hard to identify
- **Non-TMDB content** — Content not in TMDB (like some short dramas) requires special handling
- **Rate limits** — Gemini API has rate limits on free tier

---

## 🗺️ Roadmap

### Coming Soon
- [ ] Faster-Whisper integration for reliable audio transcription
- [ ] User feedback system to improve accuracy over time
- [ ] Hashtag → movie learning database
- [ ] Frontend movie card selection (currently opens detail page)

### Future Ideas
- [ ] Actor face recognition with custom database
- [ ] Batch processing multiple URLs
- [ ] User accounts and cloud-saved watchlists
- [ ] Chrome extension for one-click identification
- [ ] Mobile app (React Native)

---

## 🎨 Screenshots

_screenshots

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss major changes.

### Development Workflow
1. Fork the repo
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgments

- **TMDB** for the comprehensive movie database
- **Google Gemini** for multimodal AI capabilities
- **yt-dlp** for reliable video downloads
- **Myanmar & Thai communities** for inspiration and testing

---

## ❤️ Made For

Built for **movie lovers in Myanmar, Thailand, and beyond** who discover great films through social media clips but struggle to find them.

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Made with ☕ and lots of movie clips

</div>
