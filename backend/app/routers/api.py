from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from typing import Any

from app.database import get_db
from app.schemas import (
    MeResponse, CoursePathResponse, LessonResponse, StartAttemptResponse,
    SubmitAnswerRequest, SubmitAnswerResponse, CompleteAttemptResponse,
    HeartStatusResponse, HeartRefillResponse, LeaderboardResponse,
    ProfileResponse, UserStatsResponse
)
from app.services import duolingo_service

router = APIRouter(prefix="/api/v1")

def get_current_user_id(request: Request) -> int:
    """Mock auth middleware reading the X-User-Id header, defaulting to 1."""
    user_id_str = request.headers.get("X-User-Id", "1")
    try:
        return int(user_id_str)
    except ValueError:
        return 1

@router.get("/me", response_model=MeResponse)
def get_me(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> Any:
    return duolingo_service.get_user_me(db, user_id)

@router.get("/courses/{course_id}/path", response_model=CoursePathResponse)
def get_course_path(
    course_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> Any:
    return duolingo_service.get_course_path(db, course_id, user_id)

@router.get("/lessons/{lesson_id}", response_model=LessonResponse)
def get_lesson(
    lesson_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> Any:
    return duolingo_service.get_lesson(db, lesson_id, user_id)

@router.post("/lessons/{lesson_id}/start", response_model=StartAttemptResponse)
def start_lesson(
    lesson_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> Any:
    return duolingo_service.start_lesson_attempt(db, lesson_id, user_id)

@router.post("/attempts/{attempt_id}/answer", response_model=SubmitAnswerResponse)
def submit_answer(
    attempt_id: int,
    payload: SubmitAnswerRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> Any:
    return duolingo_service.submit_exercise_answer(db, attempt_id, payload, user_id)

@router.post("/attempts/{attempt_id}/complete", response_model=CompleteAttemptResponse)
def complete_attempt(
    attempt_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> Any:
    return duolingo_service.complete_lesson_attempt(db, attempt_id, user_id)

@router.post("/hearts/refill", response_model=HeartRefillResponse)
def refill_hearts(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> Any:
    return duolingo_service.refill_hearts(db, user_id)

@router.get("/hearts/status", response_model=HeartStatusResponse)
def get_hearts_status(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> Any:
    return duolingo_service.get_heart_status(db, user_id)

@router.get("/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard_ruby(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> Any:
    return duolingo_service.get_leaderboard(db, user_id)

@router.get("/profile/{profile_user_id}", response_model=ProfileResponse)
def get_user_profile(
    profile_user_id: int,
    db: Session = Depends(get_db)
) -> Any:
    return duolingo_service.get_profile(db, profile_user_id)

@router.post("/debug/advance-day", response_model=UserStatsResponse)
def debug_advance_day(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> Any:
    return duolingo_service.advance_day_debug(db, user_id)
