# 🎬 MovieFinder

<div align="center">

**AI-Powered Movie Finder from Social Media Clips**

Paste a TikTok, Facebook, Instagram, or YouTube link — and let AI identify the movie with complete information, streaming options, and download links.

![Status](https://img.shields.io/badge/status-ready-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen)
![Java](https://img.shields.io/badge/Java-17-orange)

</div>

---

## ✨ Features

- **🔗 Smart URL Analysis** — Paste any TikTok, Facebook, Instagram, or YouTube link and AI instantly identifies the movie
- **💬 Multilingual AI Chat** — Ask questions in English, Thai (ภาษาไทย), or Burmese (မြန်မာ)
- **🎬 Complete Movie Information** — Title, rating, year, runtime, genres, cast, director, and synopsis
- **📺 Where to Watch** — Shows both paid (Netflix, Disney+) and free legal streaming options (TrueID, Viu, etc.)
- **📥 Download Links** — Provides torrent and free streaming site recommendations with direct search links
- **🌐 Three-Language Support** — Full UI and AI responses in English, Thai, and Burmese
- **❤️ Saved Movies** — Save movies locally with one click (no account required)
- **🎥 Trailer & Subtitles** — Quick links to official trailers and subtitle downloads
- **📱 Fully Responsive** — Beautiful experience on desktop and mobile
- **⚡ Mock Mode** — Frontend works out of the box without backend or API keys

---

## 🛠️ Tech Stack

### Frontend
| Technology       | Purpose                          |
|------------------|----------------------------------|
| **React 18**     | UI Framework                     |
| **TypeScript**   | Type Safety                      |
| **Vite**         | Build Tool & Dev Server          |
| **Tailwind CSS** | Styling                          |
| **Framer Motion**| Smooth Animations                |
| **Zustand**      | State Management                 |
| **Lucide React** | Icon Library                     |

### Backend
| Technology           | Purpose                              |
|----------------------|--------------------------------------|
| **Spring Boot 3.2**  | REST API Framework                   |
| **Java 17**          | Core Language                        |
| **Spring WebFlux**   | Reactive HTTP Client                 |
| **Caffeine**         | In-memory Caching                    |
| **Jsoup**            | HTML Parsing & URL Scraping          |
| **Lombok**           | Boilerplate Reduction                |

### AI & External Services
| Service              | Purpose                                      | Status     |
|----------------------|----------------------------------------------|------------|
| **Google Gemini API**| AI movie identification & conversational chat| Required   |
| **TMDB API**         | Movie data, posters, streaming providers     | Required   |
| **YouTube Data API** | Official trailers                            | Optional   |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
│   (Hero • Chat • Trending • Movie Detail • Saved Movies)    │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Spring Boot Backend                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ ChatService  │  │ MovieService │  │ UrlAnalyzerService│  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
└─────────┼─────────────────┼───────────────────┼─────────────┘
          │                 │                   │
          ▼                 ▼                   ▼
   ┌──────────────┐  ┌──────────────┐  ┌───────────────┐
   │ Google Gemini│  │    TMDB      │  │    Jsoup      │
   │     AI       │  │   API        │  │   Scraper     │
   └──────────────┘  └──────────────┘  └───────────────┘
```

---

## 🔥 Key Highlights

- **Works without backend** — Frontend runs fully in mock mode using local data
- **No accounts required** — Saved movies use browser localStorage only
- **Link-focused design** — Provides external watch and download links (does not host content)
- **Strong multilingual support** — Complete translations for English, Thai, and Burmese
- **Clean separation** — Frontend and backend are completely independent

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **Java** 17+
- **Maven** 3.8+

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/moviefinder.git
cd moviefinder
```

### 2. Run the Frontend (Recommended for Quick Start)

```bash
npm install
npm run dev
```

Frontend will be available at: **http://localhost:5173**

> The frontend runs in **mock mode** by default and works without any backend.

### 3. (Optional) Run the Backend

```bash
cd backend

# Copy environment file
cp .env.example .env

# Add your API keys to .env (see below)
nano .env

# Start the backend
./mvnw spring-boot:run
```

Backend will start at: **http://localhost:8080**

---

## 🔑 Required API Keys

| API                | Purpose                              | Required? | Get Key |
|--------------------|--------------------------------------|-----------|---------|
| **Google Gemini**  | AI movie identification & chat       | Yes       | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **TMDB**           | Movie data, posters, streaming info  | Yes       | [themoviedb.org](https://www.themoviedb.org/settings/api) |
| **YouTube Data**   | Official trailers                    | No        | [Google Cloud Console](https://console.cloud.google.com/) |

Add keys to `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_key_here
TMDB_API_KEY=your_tmdb_key_here
YOUTUBE_API_KEY=your_youtube_key_here
```

---

## 📁 Project Structure

```
moviefinder/
├── src/                          # React Frontend
│   ├── components/
│   ├── services/
│   ├── store/
│   └── ...
├── backend/                      # Spring Boot Backend
│   ├── src/main/java/com/moviefinder/
│   │   ├── controller/
│   │   ├── service/
│   │   └── ...
│   └── pom.xml
├── public/
└── package.json
```

---

## 🧠 How It Works

1. User pastes a social media link or describes a movie scene
2. Backend (or mock service) sends input to **Google Gemini**
3. Gemini identifies the movie
4. **TMDB API** fetches full details and streaming providers
5. Results are returned with external watch and download links

---

## 📦 Main API Endpoints

| Method | Endpoint                          | Description                     |
|--------|-----------------------------------|---------------------------------|
| POST   | `/api/v1/chat/send`               | Send chat message               |
| POST   | `/api/v1/chat/analyze-url`        | Analyze TikTok/FB/IG/YT link    |
| GET    | `/api/v1/movies/search`           | Search movies                   |
| GET    | `/api/v1/movies/{id}`             | Get movie details               |
| GET    | `/api/v1/movies/trending`         | Get trending movies             |
| GET    | `/api/v1/movies/{id}/streaming`   | Get streaming providers         |

---

## 🌐 Environment Variables

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_USE_MOCK_API=true
```

### Backend (`backend/.env`)
```env
GEMINI_API_KEY=your_key
TMDB_API_KEY=your_key
YOUTUBE_API_KEY=your_key
```

---

## 📌 Current Status

- ✅ Modern, beautiful UI with animations
- ✅ AI chat with mock responses (works without backend)
- ✅ Movie details with watch & download links
- ✅ Saved movies using localStorage
- ✅ Full multilingual support (EN / TH / MY)
- 🔄 Real backend available (requires API keys)

> **Note:** The frontend runs in **mock mode** by default. Set `VITE_USE_MOCK_API=false` to use the real backend.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss major changes.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## ❤️ Made For

Built for **movie lovers** who discover great films through social media clips.

---

<div align="center">

**⭐ Star this repo if you find it useful!**

</div>
