from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime, date

# Basic schemas
class UserBase(BaseModel):
    id: int
    username: str
    display_name: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True

class UserStatsResponse(BaseModel):
    total_xp: int
    gems: int
    hearts: int
    max_hearts: int
    current_streak: int
    longest_streak: int
    last_activity_date: Optional[date] = None
    daily_goal_xp: int
    freeze_count: int

    class Config:
        from_attributes = True

class MeResponse(BaseModel):
    user: UserBase
    stats: UserStatsResponse
    daily_goal_progress: float # e.g. percentage of daily goal achieved today (0.0 to 1.0)

# Path nested structure
class SkillPathResponse(BaseModel):
    id: int
    order_index: int
    title: str
    icon_name: str
    lessons_count: int
    max_crowns: int
    crowns: int
    lessons_completed: int
    status: str # 'locked' | 'available' | 'completed' | 'legendary'

    class Config:
        from_attributes = True

class UnitPathResponse(BaseModel):
    id: int
    order_index: int
    title: str
    description: str
    color_hex: str
    skills: List[SkillPathResponse]

    class Config:
        from_attributes = True

class CoursePathResponse(BaseModel):
    course_id: int
    title: str
    from_lang: str
    to_lang: str
    flag_emoji: str
    units: List[UnitPathResponse]

# Exercise schema (answers stripped)
class ExerciseResponse(BaseModel):
    id: int
    order_index: int
    type: str # MULTIPLE_CHOICE | TRANSLATE | MATCH_PAIRS | FILL_BLANK | TYPE_ANSWER
    prompt: str
    audio_url: Optional[str] = None
    payload: Dict[str, Any] # Correct answers are stripped out of payload here

    class Config:
        from_attributes = True

class LessonResponse(BaseModel):
    id: int
    skill_id: int
    order_index: int
    lesson_type: str
    xp_reward: int
    exercises: List[ExerciseResponse]

    class Config:
        from_attributes = True

# Start & Answer
class StartAttemptResponse(BaseModel):
    attempt_id: int
    lesson_id: int
    started_at: datetime

class SubmitAnswerRequest(BaseModel):
    exercise_id: int
    answer: Any # can be string, array of strings, pair dict

class SubmitAnswerResponse(BaseModel):
    is_correct: bool
    correct_answer: Any # instructions/correct sequence/text
    hearts_remaining: int
    explanation: Optional[str] = None

class CompleteAttemptResponse(BaseModel):
    xp_earned: int
    accuracy: float # 0.0 to 100.0
    time_sec: int
    combo_bonus: int
    new_crowns: int
    streak: int

class HeartStatusResponse(BaseModel):
    hearts: int
    next_refill_in_sec: int

class HeartRefillResponse(BaseModel):
    success: bool
    hearts: int
    gems: int
    message: str

# Leaderboard
class LeaderboardUser(BaseModel):
    username: str
    display_name: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True

class LeaderboardRank(BaseModel):
    rank: int
    user: LeaderboardUser
    weekly_xp: int
    current_streak: int

class LeaderboardResponse(BaseModel):
    league_tier: str
    week_start: date
    rankings: List[LeaderboardRank]

# Profile
class AchievementTierInfo(BaseModel):
    tier: int
    goal: int
    reward_gems: int

class AchievementResponse(BaseModel):
    code: str
    title: str
    description: str
    icon: str
    current_tier: int
    unlocked: bool
    progress_value: int
    next_tier_goal: Optional[int] = None
    max_tier_reached: bool

class ActivityHeatmapEntry(BaseModel):
    date: date
    xp_earned: int
    lessons_completed: int

class ProfileResponse(BaseModel):
    user: UserBase
    stats: UserStatsResponse
    achievements: List[AchievementResponse]
    activity_heatmap: List[ActivityHeatmapEntry]
