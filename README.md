  <div align="center">
    <br />
    <h1>📚 WebStash</h1>
    <p>
      <strong>Smart Bookmark Manager — Powered by AI</strong>
    </p>
    <p>
      Save links, get instant AI summaries, auto-generated tags, and semantic search.
      Never lose track of why you bookmarked something again.
    </p>
    <br />
  </div>

---

## ✨ Features

| Feature | Description |
|---|---|
| **🔗 Save Bookmarks** | Save any URL with an optional title — or let AI auto-generate one |
| **🤖 AI Summaries** | Every bookmark gets a concise, meaningful AI-generated summary so you always remember why you saved it |
| **🏷️ Auto Tags** | AI automatically tags bookmarks with relevant keywords |
| **🔍 Semantic Search** | Search by describing *what you remember*, not just exact titles. AI understands meaning, not just keywords |
| **📱 Responsive UI** | Beautiful dark-theme interface that works on desktop and mobile |
| **🔐 JWT Authentication** | Secure sign-up, login, and session management |
| **🐳 Dockerized** | One command to run everything — database and backend in one container |

---

## 🧱 Tech Stack

<div align="center">

| Layer | Technology |
|---|---:|
| **Frontend** | React 19, Vite, Tailwind CSS 4, Motion (Framer Motion) |
| **Backend** | Spring Boot 4 (Java 21), Spring Security, JPA/Hibernate |
| **Database** | PostgreSQL 16 |
| **AI (Summaries + Semantic Search)** | Groq (Llama 3.3 70B) via OpenAI-compatible API |
| **Web Scraping** | Jsoup |
| **Containerization** | Docker & Docker Compose |

</div>

---

## 🏗️ Architecture Overview

```
                          ┌─────────────────────────────────────┐
                          │         Spring Boot (Java 21)        │
                          │                                      │
┌─────────────┐           │  ┌──────────────────┐               │
│   Browser   │──────────▶│  │  React Frontend   │  (served as  │
│  (React)    │           │  │  (static files)   │   static)    │
└─────────────┘           │  └──────────────────┘               │
        │                 │                                      │
        │                 │  ┌──────────────────┐  ┌───────────┐ │
        └─────────────────│─▶│  API Controllers  │─▶│ Groq AI   │ │
                          │  │  (REST endpoints) │  │(Summaries │ │
                          │  └──────┬───────────┘  │+ Search)  │ │
                          │         │              └───────────┘ │
                          │         ▼                            │
                          │  ┌──────────────────┐               │
                          │  │  BookmarkService  │               │
                          │  │  + ScraperService │               │
                          │  └────────┬─────────┘               │
                          │           │                          │
                          └───────────┼──────────────────────────┘
                                      │
                                      ▼
                               ┌────────────┐
                               │ PostgreSQL  │
                               └────────────┘
```

### Data Flow

1. **You save a URL** in the React frontend
2. The request goes **directly** to the Spring Boot backend (no middleware)
3. The backend **instantly saves** the bookmark to PostgreSQL
4. In the background, it **scrapes** the URL content using Jsoup
5. The scraped content is sent to **Groq AI** (via Llama 3.3) to generate a summary and relevant tags
6. The AI data is saved back to the bookmark

When you search, the query and all your bookmarks are sent to **Groq AI**, which understands meaning and returns semantically relevant results — not just keyword matches.

### SPA Routing

When you refresh the page or navigate directly to a route like `/dashboard`, the `SpaRedirectFilter` forwards the request to `index.html` so React Router can handle it client-side. API calls (starting with `/api`) and static assets (`.js`, `.css`) pass through without interference.

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- API keys:
  - [Groq API Key](https://console.groq.com/) (for AI summaries and semantic search)
  - (Optional) A JWT secret for token signing

### Quick Start with Docker

```bash
# 1. Clone the repository
git clone https://github.com/your-username/webstash.git
cd webstash

# 2. Create a .env file with your API keys
echo "GROQ_API_KEY=gsk_your_groq_key_here" >> .env

# 3. Run everything (builds React + Java in one multi-stage Docker build)
docker compose up --build
```

The app will be available at **http://localhost** (port 80 maps to Spring Boot on port 8080).

### Running Without Docker

```bash
# Terminal 1: Start PostgreSQL with pgvector
docker compose up postgres -d

# Terminal 2: Start the Java backend
./mvnw spring-boot:run

# Terminal 3: Start the frontend dev server (with hot reload)
cd frontend
npm install
npm run dev
```

> The Vite dev server (port 5173) proxies `/api` requests to the Java backend on port 8080 automatically.
> For production-like testing without Docker: run `cd frontend && npm run build`, copy `frontend/dist/*` to `src/main/resources/static/`, then run `./mvnw spring-boot:run`.

---

## 🔐 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | Your Groq API key for AI summaries and semantic search |
| `JWT_SECRET` | ❌ No | Secret for signing JWT tokens (auto-generated if not set) |

---

## 📁 Project Structure

```
bookmarkmanager/
│
├── frontend/                          # React single-page application
│   ├── public/
│   │   └── favicon.svg               # App favicon
│   ├── src/
│   │   ├── main.jsx                  # Entry point — renders the app
│   │   ├── App.jsx                   # Top-level component (screen router)
│   │   ├── index.css                 # Global styles (Tailwind + custom)
│   │   └── components/
│   │       ├── LandingPage.jsx       # Marketing homepage
│   │       ├── AtelierLogin.jsx      # Sign-in / Register form
│   │       └── PrivateDashboard.jsx  # Bookmark management workspace
│   ├── vite.config.js                # Vite build configuration
│   ├── index.html                    # HTML shell
│   └── package.json                  # Dependencies & scripts
│
├── src/main/java/com/parvash/bookmarkmanager/
│   ├── controller/
│   │   ├── AuthController.java       # /api/auth/login & /api/auth/register
│   │   ├── BookmarkController.java   # CRUD + search endpoints
│   │   ├── HealthController.java     # /api/health endpoint
│   │   └── SpaRedirectFilter.java    # SPA routing filter
│   ├── service/
│   │   ├── BookmarkService.java      # Business logic, AI integration
│   │   └── ScraperService.java       # Web scraping with Jsoup
│   ├── entity/
│   │   ├── Bookmark.java             # Database model for bookmarks
│   │   └── User.java                 # Database model for users
│   ├── repository/
│   │   ├── BookmarkRepository.java   # Bookmark DB queries
│   │   └── UserRepository.java       # User DB queries
│   ├── security/
│   │   ├── SecurityConfig.java       # Spring Security configuration
│   │   ├── JwtService.java           # JWT token generation/validation
│   │   └── JwtAuthenticationFilter.java  # Token auth filter
│   ├── dto/
│   │   ├── AuthRequest.java          # Login/Register request body
│   │   ├── AuthResponse.java         # JWT token response
│   │   └── BookmarkRequest.java      # Bookmark creation/update body
    │   └── exception/
│       └── GlobalExceptionHandler.java  # Centralized error handling
│
├── compose.yaml                      # Docker Compose (postgres + backend)
├── Dockerfile                        # Multi-stage build: React + Java → single JAR
├── pom.xml                           # Maven project config
└── README.md                         # This file!
```

---

## 🖥️ Frontend Overview

The frontend is a **single-page application (SPA)** built with React. It has three screens:

| Screen | Component | What it does |
|---|---|---|
| **🏠 Landing** | `LandingPage.jsx` | Marketing page with hero section, AI search demo, and feature highlights |
| **🔑 Auth** | `AtelierLogin.jsx` | Sign in / Register form with JWT authentication |
| **📊 Dashboard** | `PrivateDashboard.jsx` | Full bookmark management — view, create, edit, delete, search |

State management is handled with React's built-in `useState` and `useEffect`. Session data is persisted in `localStorage` so you stay logged in even after closing the browser.

### Key React Concepts Used

| Concept | Where | Purpose |
|---|---|---|
| `useState` | Every component | Tracks changing data (bookmarks list, form inputs, loading states) |
| `useEffect` | Dashboard, Landing | Fetches data when component first loads (API calls) |
| `useRef` | Dashboard | Holds a timer reference for debounced search |
| Props | All components | Passes data from parent to child (e.g., `userEmail` → Dashboard) |
| Conditional rendering | `App.jsx` | Shows different screens based on `view` state |
| Modals | Dashboard | Pop-up forms for creating / editing bookmarks |

---

## 📡 API Endpoints

All endpoints are served by the Spring Boot backend at `http://localhost/api/...`.

### System

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | ❌ No | Health check (returns status + timestamp) |

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ No | Create a new account |
| `POST` | `/api/auth/login` | ❌ No | Sign in and get JWT token |

### Bookmarks (all require `Authorization: Bearer <token>` header)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/bookmarks` | Get all your bookmarks |
| `GET` | `/api/bookmarks/{id}` | Get a single bookmark |
| `POST` | `/api/bookmarks` | Create a new bookmark |
| `PUT` | `/api/bookmarks/{id}` | Update a bookmark |
| `DELETE` | `/api/bookmarks/{id}` | Delete a bookmark |
| `GET` | `/api/bookmarks/search?q=...` | Semantic AI search |

---

## 🤖 How the AI Works

This project integrates AI at two levels, both running entirely within the Spring Boot backend:

### 1. AI Summaries & Tags (Groq / Llama 3.3)

When you save a bookmark:
1. The bookmark is saved to the database **immediately** for a fast response
2. In the background (`CompletableFuture.runAsync`), the backend:
   - Scrapes the webpage content using **Jsoup**
   - Sends the content to **Groq's Llama 3.3 70B** model with a prompt asking it to extract:
     - A concise 2–3 sentence summary
     - 3–5 specific topic tags
     - A refined title (if you didn't provide one)
3. The AI output is saved back to the bookmark

The frontend polls the bookmark endpoint periodically to pick up the AI-generated data.

### 2. Semantic Search (Groq LLM)

When you search, the app sends your query along with all your bookmarks (titles, summaries, and tags) to **Groq's Llama 3.3 70B** model. The LLM understands the semantic meaning of your query and returns only the bookmarks that are truly relevant — even if they share no exact keywords.

This means you can search for "healthy dinner recipes" and find bookmarks tagged "mediterranean meal prep" even though they share no exact words.

If the LLM search fails for any reason, the app falls back to a simple database text search as a safety net.

### Why This Architecture

- **Groq** handles both text generation (summaries) and semantic search — one API key, no extra infrastructure
- Groq's Llama 3.3 70B is fast and has a generous free tier
- No vector database or embedding models needed — simpler deployment and fewer moving parts
- Everything is accessed directly from the Java backend — no intermediate Node.js server needed

---

## 🐳 Docker Build Process

The Dockerfile uses a **multi-stage build**:

```
Stage 1 (frontend-build):  Node + npm → builds React into static files (dist/)
Stage 2 (backend-build):   Maven + JDK → copies React dist/ into src/main/resources/static/, then builds JAR
Stage 3 (runtime):         JRE only → runs the JAR (no Node.js, no Maven)
```

The final container contains only a JRE and a single JAR file. The React frontend is embedded inside the JAR as static resources.

---

## 🧪 Scripts Reference

### Frontend (`frontend/`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with hot reload (port 5173) |
| `npm run build` | Build React app for production into `dist/` |
| `npm run preview` | Preview the built app locally |
| `npm run clean` | Remove `dist/` build output |

### Backend (`./`)

| Command | Description |
|---|---|
| `./mvnw spring-boot:run` | Start the Java backend (port 8080) |
| `./mvnw test` | Run tests |
| `./mvnw clean package` | Build JAR (make sure frontend is built first) |

---

## 📝 License

This project is built for learning and portfolio purposes.

---

<div align="center">
  <p>
    Built with React, Spring Boot, and ❤️
  </p>
</div>
