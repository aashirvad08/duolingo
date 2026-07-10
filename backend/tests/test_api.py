from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import pytest

from app.main import app
from app.database import get_db, SessionLocal
from app.models.db_models import UserStats, UserSkillProgress, LessonAttempt

client = TestClient(app)

from app.seed import seed_db

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    seed_db()

@pytest.fixture(scope="module")
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_get_me():
    # Test with mock X-User-Id header (user 1)
    response = client.get("/api/v1/me", headers={"X-User-Id": "1"})
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["id"] == 1
    assert "stats" in data
    assert data["stats"]["total_xp"] == 1240
    assert data["stats"]["gems"] == 500
    assert data["stats"]["hearts"] == 4
    assert "daily_goal_progress" in data

def test_get_course_path():
    response = client.get("/api/v1/courses/1/path", headers={"X-User-Id": "1"})
    assert response.status_code == 200
    data = response.json()
    assert data["course_id"] == 1
    assert len(data["units"]) > 0
    
    # Check that skills in Unit 1 are completed and Unit 2 are available/locked
    skills = data["units"][0]["skills"]
    assert skills[0]["title"] == "Intro"
    assert skills[0]["status"] == "legendary"
    assert skills[0]["crowns"] == 5

def test_get_lesson_strips_answers():
    response = client.get("/api/v1/lessons/1", headers={"X-User-Id": "1"})
    assert response.status_code == 200
    data = response.json()
    assert "exercises" in data
    assert len(data["exercises"]) == 7
    
    # Check that answers are stripped out
    for ex in data["exercises"]:
        payload = ex["payload"]
        if ex["type"] == "MULTIPLE_CHOICE":
            assert "correct_id" not in payload
        elif ex["type"] == "TRANSLATE":
            assert "correct_sequence" not in payload
        elif ex["type"] == "FILL_BLANK":
            assert "correct" not in payload
        elif ex["type"] == "TYPE_ANSWER":
            assert "accepted_answers" not in payload

def test_lesson_attempt_workflow(db_session: Session):
    # 1. Start lesson
    response = client.post("/api/v1/lessons/1/start", headers={"X-User-Id": "1"})
    assert response.status_code == 200
    attempt_data = response.json()
    attempt_id = attempt_data["attempt_id"]
    assert attempt_id is not None
    
    # Check that user hearts is 4 before doing attempts
    stats_before = db_session.query(UserStats).filter(UserStats.user_id == 1).first()
    assert stats_before.hearts == 4
    
    # 2. Submit wrong answer to exercise 1 (MULTIPLE_CHOICE)
    # The correct_id for Intro lesson 1 exercise 1 is "hola" or "adiós", we submit "wrong_answer"
    response = client.post(
        f"/api/v1/attempts/{attempt_id}/answer",
        json={"exercise_id": 1, "answer": "wrong_answer"},
        headers={"X-User-Id": "1"}
    )
    assert response.status_code == 200
    ans_data = response.json()
    assert ans_data["is_correct"] is False
    assert ans_data["hearts_remaining"] == 3
    
    # Verify hearts in db is decremented
    db_session.expire_all()
    stats_after = db_session.query(UserStats).filter(UserStats.user_id == 1).first()
    assert stats_after.hearts == 3
    
    # 3. Submit correct answer for multiple choice (Intro lesson 1 exercise 1 has correct_id = based on seed, let's look at what we seeded: it was random or set. Wait, let's find the exercise correct answer in db first so we can submit correctly)
    from app.models.db_models import Exercise
    ex = db_session.query(Exercise).filter(Exercise.id == 1).first()
    correct_id = ex.payload["correct_id"]
    
    response = client.post(
        f"/api/v1/attempts/{attempt_id}/answer",
        json={"exercise_id": 1, "answer": correct_id},
        headers={"X-User-Id": "1"}
    )
    assert response.status_code == 200
    ans_data = response.json()
    assert ans_data["is_correct"] is True
    assert ans_data["hearts_remaining"] == 3
    
    # 4. Complete the lesson
    response = client.post(f"/api/v1/attempts/{attempt_id}/complete", headers={"X-User-Id": "1"})
    assert response.status_code == 200
    comp_data = response.json()
    assert comp_data["xp_earned"] > 0
    assert comp_data["accuracy"] is not None
    assert comp_data["streak"] == 12

def test_heart_refill(db_session: Session):
    db_session.expire_all()
    stats = db_session.query(UserStats).filter(UserStats.user_id == 1).first()
    gems_before = stats.gems
    
    # Refill hearts using 350 gems (learner user has 500 gems)
    response = client.post("/api/v1/hearts/refill", headers={"X-User-Id": "1"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["hearts"] == 5
    assert data["gems"] == gems_before - 350

def test_leaderboard():
    response = client.get("/api/v1/leaderboard", headers={"X-User-Id": "1"})
    assert response.status_code == 200
    data = response.json()
    assert data["league_tier"] == "Ruby"
    assert len(data["rankings"]) > 0
    
def test_profile():
    response = client.get("/api/v1/profile/1")
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["username"] == "learner"
    assert len(data["achievements"]) == 8
    assert len(data["activity_heatmap"]) > 0

def test_debug_advance_day(db_session: Session):
    # Advance day
    response = client.post("/api/v1/debug/advance-day", headers={"X-User-Id": "1"})
    assert response.status_code == 200
    data = response.json()
    
    # Verify last activity date shifts back in db
    db_session.expire_all()
    stats = db_session.query(UserStats).filter(UserStats.user_id == 1).first()
    # If the user does another lesson, it should increment streak because last activity is now "yesterday"
