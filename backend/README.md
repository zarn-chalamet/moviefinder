# 🎬 MovieFinder Backend

Spring Boot backend for the MovieFinder application - AI-powered movie identification from social media clips.

## 📋 Prerequisites

- **Java 17** or higher
- **Maven 3.8+** (or use included Maven wrapper)

### Check your Java version:
```bash
java -version
# Should show: openjdk version "17.x.x" or higher
```

## 🚀 Quick Start

### Step 1: Clone/Copy the backend folder
```bash
cd backend
```

### Step 2: Set up API Keys

Copy the example env file:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
GEMINI_API_KEY=your-gemini-api-key-here
TMDB_API_KEY=your-tmdb-api-key-here
```

### Step 3: Run the application

**Option A: Using Maven Wrapper (Recommended)**
```bash
# Linux/Mac
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

**Option B: Using installed Maven**
```bash
mvn spring-boot:run
```

### Step 4: Verify it's running

Open in browser:
- **API Health:** http://localhost:8080/api/v1/health
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **H2 Console:** http://localhost:8080/h2-console

## 🔑 Getting FREE API Keys

| API | How to Get | Link |
|-----|------------|------|
| **Google Gemini** | Sign in → Get API Key | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **TMDB** | Sign up → Settings → API | [themoviedb.org](https://www.themoviedb.org/settings/api) |
| **YouTube** | Google Console → Enable API | [console.cloud.google.com](https://console.cloud.google.com/) |

## 📡 API Endpoints

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/chat/send` | Send chat message |
| POST | `/api/v1/chat/analyze-url` | Analyze TikTok/FB/IG/YT URL |
| POST | `/api/v1/chat/analyze-image` | Upload screenshot |

### Movies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/movies/search?q=` | Search movies |
| GET | `/api/v1/movies/{id}` | Get movie details |
| GET | `/api/v1/movies/{id}/streaming` | Get streaming providers |
| GET | `/api/v1/movies/{id}/similar` | Get similar movies |
| GET | `/api/v1/movies/trending` | Get trending movies |

## 📁 Project Structure

```
backend/
├── src/main/java/com/moviefinder/
│   ├── MovieFinderApplication.java    # Main entry point
│   ├── config/                         # Configurations
│   │   ├── CorsConfig.java
│   │   ├── CacheConfig.java
│   │   └── WebClientConfig.java
│   ├── controller/                     # REST Controllers
│   │   ├── ChatController.java
│   │   ├── MovieController.java
│   │   └── HealthController.java
│   ├── service/                        # Business Logic
│   │   ├── ChatService.java
│   │   ├── GeminiService.java
│   │   ├── TmdbService.java
│   │   └── UrlAnalyzerService.java
│   ├── dto/                            # Data Transfer Objects
│   │   ├── request/
│   │   └── response/
│   └── exception/                      # Error Handling
│       └── GlobalExceptionHandler.java
├── src/main/resources/
│   └── application.yml                 # App configuration
├── pom.xml                             # Maven dependencies
└── .env.example                        # Environment template
```

## 🔧 Configuration

### application.yml
Key settings you can modify:

```yaml
# Server port
server:
  port: 8080

# Allowed frontend origins
cors:
  allowed-origins: http://localhost:5173,http://localhost:3000

# API Keys (from environment variables)
api:
  gemini:
    api-key: ${GEMINI_API_KEY}
  tmdb:
    api-key: ${TMDB_API_KEY}
```

## 🐛 Troubleshooting

### "Port 8080 already in use"
```bash
# Find and kill the process
lsof -i :8080
kill -9 <PID>

# Or change port in application.yml
server:
  port: 8081
```

### "JAVA_HOME not set"
```bash
# Mac (with Homebrew)
export JAVA_HOME=$(/usr/libexec/java_home)

# Linux
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk

# Add to ~/.bashrc or ~/.zshrc for persistence
```

### "API key not working"
1. Check that `.env` file exists and has correct keys
2. Restart the application after changing `.env`
3. Verify keys are active in respective dashboards

## 🔗 Connecting to Frontend

Update the frontend `.env`:
```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_USE_MOCK_API=false
```

Then restart the frontend:
```bash
cd ../  # Go to frontend directory
npm run dev
```

## 📦 Building for Production

```bash
# Create JAR file
./mvnw clean package -DskipTests

# Run the JAR
java -jar target/moviefinder-backend-1.0.0.jar
```

## 🚀 Deployment

### Deploy to Render.com (Free)
1. Push to GitHub
2. Create new Web Service on Render
3. Connect your repo
4. Set environment variables
5. Deploy!

### Environment Variables for Production
```
GEMINI_API_KEY=xxx
TMDB_API_KEY=xxx
SPRING_PROFILES_ACTIVE=prod
```

---

Made with ❤️ for Myanmar & Thai movie lovers 🇲🇲 🇹🇭
