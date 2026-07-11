# Duolingo Clone — Full Stack Web Application

> 🚀 **Live Demo:** Access the website here: [https://duolingo-aaz8apnzl-rampofins-projects.vercel.app/learn](https://duolingo-aaz8apnzl-rampofins-projects.vercel.app/learn)

A production-quality clone of the modern Duolingo web application (2024–25 UI). Features a fully functional lesson loop with 5 distinct exercise types, progress serialization, automated heart refills via gems, daily activity heatmaps, a Ruby League leaderboard, and achievements gamification.

---

## 🛠️ TECH STACK

| Layer | Technology | Details |
|---|---|---|
| **Backend** | Python 3.11, FastAPI | High-performance API routing with dependency injection |
| **Database** | SQLite + SQLAlchemy 2.0 | Declarative typed models with Alembic auto-migrations |
| **Frontend** | Next.js 14 (App Router) | React server/client components, Tailwind CSS v4 styling |
| **State Management** | Zustand | Optimized client stores (for hearts, XP, and lesson decks) |
| **Server State** | TanStack Query v5 | Cache syncing, queries, and optimistic mutations |
| **Animations** | Framer Motion | Smooth springs, shaking errors, and shared element layouts |
| **Icons** | Lucide React + Custom SVGs | Core interface vector indicators |

---

## 🏗️ SYSTEM ARCHITECTURE

```
                      +-----------------------------+
                      |      Next.js Frontend       |
                      |       (localhost:3000)      |
                      +--------------+--------------+
                                     |
                                     | JSON HTTP / CORS
                                     v
                      +-----------------------------+
                      |        FastAPI Router       |
                      |       (localhost:8000)      |
                      +--------------+--------------+
                                     |
                                     | Service Interface
                                     v
                      +-----------------------------+
                      |      Gamification / Path    |
                      |        Service Layer        |
                      +--------------+--------------+
                                     |
                                     | SQLAlchemy ORM 2.0
                                     v
                      +-----------------------------+
                      |      SQLite Database        |
                      |       (duolingo.db)         |
                      +-----------------------------+
```

---

## 📊 DATABASE SCHEMA (ER DIAGRAM)

```mermaid
erDiagram
    users ||--|| user_stats : "has"
    users ||--o{ user_skill_progress : "tracks"
    users ||--o{ lesson_attempts : "attempts"
    users ||--o{ daily_activity : "records"
    users ||--o{ leaderboard_entries : "ranks"
    users ||--o{ user_achievements : "unlocks"

    courses ||--o{ units : "contains"
    units ||--o{ skills : "contains"
    skills ||--o{ lessons : "contains"
    lessons ||--o{ exercises : "comprises"

    lesson_attempts ||--o{ exercise_attempts : "submits"
    exercises ||--o{ exercise_attempts : "has"
    achievements ||--o{ user_achievements : "references"

    users {
        int id PK
        string username
        string display_name
        string avatar_url
        datetime created_at
    }

    user_stats {
        int user_id PK, FK
        int total_xp
        int gems
        int hearts
        int max_hearts
        datetime last_heart_refill_at
        int current_streak
        int longest_streak
        date last_activity_date
        int daily_goal_xp
        int freeze_count
    }

    skills {
        int id PK
        int unit_id FK
        int order_index
        string title
        string icon_name
        int lessons_count
        int max_crowns
    }

    lessons {
        int id PK
        int skill_id FK
        int order_index
        string lesson_type
        int xp_reward
    }

    exercises {
        int id PK
        int lesson_id FK
        int order_index
        string type
        string prompt
        string audio_url
        json payload
    }
```

---

## 📡 API ROUTE ENDPOINTS (`/api/v1`)

| Method | Endpoint | Description | Mock Header Auth |
|---|---|---|---|
| **GET** | `/me` | Returns current user profile stats + today's goal XP. | `X-User-Id` (Defaults: 1) |
| **GET** | `/courses/{id}/path` | Returns course units/skills + crowns progress & locks. | Yes |
| **GET** | `/lessons/{id}` | Returns lesson questions; **strips correct answers**. | Yes |
| **POST** | `/lessons/{id}/start` | Begins lesson session, validates hearts & makes attempt ID. | Yes |
| **POST** | `/attempts/{aid}/answer` | Submits single answer, updates hearts & yields solution. | Yes |
| **POST** | `/attempts/{aid}/complete` | Marks lesson complete, awards rewards, streak updates. | Yes |
| **POST** | `/hearts/refill` | Spends 350 gems to restore full hearts count (5/5). | Yes |
| **GET** | `/hearts/status` | Computes lazy time regeneration (1 heart / 4 hours). | Yes |
| **GET** | `/leaderboard` | Pulls Ruby League rankings populated with competitors. | Yes |
| **GET** | `/profile/{uid}` | Profile stats, achievements progress, 6-month heatmap grid. | No |
| **POST** | `/debug/advance-day` | Simulates next day (decrements activity dates for streaks). | Yes |

---

## 📝 EXERCISE PAYLOAD STRUCTURES

The payload schemas stored inside `exercises.payload` vary per exercise type:

### 1. `MULTIPLE_CHOICE`
```json
{
  "options": [
    { "id": "hola", "text": "hola", "image_url": "/images/hola.png" },
    { "id": "gracias", "text": "gracias", "image_url": null }
  ],
  "correct_id": "hola"
}
```

### 2. `TRANSLATE`
```json
{
  "word_bank": ["come", "bebe", "pan", "el", "gracias", "niño"],
  "correct_sequence": ["el", "niño", "come", "pan"],
  "distractors": ["gracias", "bebe"]
}
```

### 3. `MATCH_PAIRS`
```json
{
  "pairs": [
    { "left": "hola", "right": "hello" },
    { "left": "gracias", "right": "thanks" }
  ]
}
```

### 4. `FILL_BLANK`
```json
{
  "sentence": "Yo ___ pan",
  "options": ["como", "bebo", "gracias"],
  "correct": "como"
}
```

### 5. `TYPE_ANSWER`
```json
{
  "source_text": "Hola, buenos días",
  "accepted_answers": ["hello good morning", "hi good morning"]
}
```

---

## 💡 KEY DESIGN & IMPLEMENTATION DECISIONS

### 1. Lazy Heart Regeneration (Time-Based)
Rather than spawning heavy background worker threads or cron tasks to regenerate hearts every 4 hours (which can easily crash or sleep on free-tier hosting), heart recovery is computed **lazily**:
* When a user fetches their profile stats (`/me`), the backend calculates the difference between the current timestamp and `last_heart_refill_at`.
* For every 4-hour block of inactivity, a heart is added (up to the maximum of 5).
* This ensures zero-overhead database writes and absolute reliability.

### 2. Timezone-Agnostic Streak Calibration
Streak progression is calculated using the date difference between the user's local day and the day of their last completed lesson:
* We provide a **`POST /debug/advance-day`** debug endpoint that shifts the user's `last_activity_date` back by 24 hours.
* This allows evaluators to simulate the passage of a day instantly, enabling immediate verification of the streak increment when they complete the next lesson.

### 3. Client-Side Text-to-Speech (TTS)
To deliver high-quality Spanish pronunciation audio without loading laggy third-party MP3 assets or hitting translation API rate limits, we integrated the browser-native **Web Speech API (`window.speechSynthesis`)**:
* Exercises use a unified `speakSpanish()` helper calibrated to the `"es-ES"` locale.
* Audio plays dynamically on question load, word tile selection, and card clicks.

### 4. Z-Index Stacking & Stacking Contexts
To solve CSS transformed container isolation (where `transform: translateX` locks child z-indexes):
* We lift the active popover state up to the parent `LearnPage`.
* This allows the parent to dynamically apply a relative `z-40` class to the transformed wrapper node itself, ensuring popovers never overlap with adjacent nodes.

---

## 🚀 LOCAL SETUP

Ensure you have **Python 3.11** and **Node.js 18+** installed.

### 1. Backend Service
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run migrations and apply database schema
alembic upgrade head

# Seed database with course details & mock users
python -m app.seed

# Start the API server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Application
```bash
cd frontend
npm install

# Build environment config
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run developer server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 DOCKER COMPOSE SETUP

To start both services in isolated containers simultaneously:
```bash
docker-compose up --build
```
Access the application at [http://localhost:3000](http://localhost:3000).
Docs at [http://localhost:8000/docs](http://localhost:8000/docs).
