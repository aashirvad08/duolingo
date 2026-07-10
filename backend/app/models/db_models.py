from datetime import datetime, date
from typing import List, Optional
from sqlalchemy import ForeignKey, Integer, String, Boolean, DateTime, Date, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String, unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String)
    avatar_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    stats: Mapped["UserStats"] = relationship(back_populates="user", cascade="all, delete-orphan", uselist=False)
    progress: Mapped[List["UserSkillProgress"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    attempts: Mapped[List["LessonAttempt"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    activity: Mapped[List["DailyActivity"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    leaderboard_entries: Mapped[List["LeaderboardEntry"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    achievements: Mapped[List["UserAchievement"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class UserStats(Base):
    __tablename__ = "user_stats"
    
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    total_xp: Mapped[int] = mapped_column(Integer, default=0)
    gems: Mapped[int] = mapped_column(Integer, default=500)
    hearts: Mapped[int] = mapped_column(Integer, default=5)
    max_hearts: Mapped[int] = mapped_column(Integer, default=5)
    last_heart_refill_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0)
    last_activity_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    daily_goal_xp: Mapped[int] = mapped_column(Integer, default=20)
    freeze_count: Mapped[int] = mapped_column(Integer, default=0)
    
    user: Mapped["User"] = relationship(back_populates="stats")


class Course(Base):
    __tablename__ = "courses"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    from_lang: Mapped[str] = mapped_column(String)
    to_lang: Mapped[str] = mapped_column(String)
    title: Mapped[str] = mapped_column(String)
    flag_emoji: Mapped[str] = mapped_column(String)
    
    units: Mapped[List["Unit"]] = relationship(back_populates="course", cascade="all, delete-orphan")


class Unit(Base):
    __tablename__ = "units"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    order_index: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String)
    color_hex: Mapped[str] = mapped_column(String, default="#58CC02")
    
    course: Mapped["Course"] = relationship(back_populates="units")
    skills: Mapped[List["Skill"]] = relationship(back_populates="unit", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    unit_id: Mapped[int] = mapped_column(ForeignKey("units.id", ondelete="CASCADE"), index=True)
    order_index: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String)
    icon_name: Mapped[str] = mapped_column(String)
    lessons_count: Mapped[int] = mapped_column(Integer, default=3)
    max_crowns: Mapped[int] = mapped_column(Integer, default=5)
    
    unit: Mapped["Unit"] = relationship(back_populates="skills")
    lessons: Mapped[List["Lesson"]] = relationship(back_populates="skill", cascade="all, delete-orphan")
    user_progress: Mapped[List["UserSkillProgress"]] = relationship(back_populates="skill", cascade="all, delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"), index=True)
    order_index: Mapped[int] = mapped_column(Integer)
    lesson_type: Mapped[str] = mapped_column(String)  # 'lesson'|'practice'|'unit_review'
    xp_reward: Mapped[int] = mapped_column(Integer, default=10)
    
    skill: Mapped["Skill"] = relationship(back_populates="lessons")
    exercises: Mapped[List["Exercise"]] = relationship(back_populates="lesson", cascade="all, delete-orphan")
    attempts: Mapped[List["LessonAttempt"]] = relationship(back_populates="lesson", cascade="all, delete-orphan")


class Exercise(Base):
    __tablename__ = "exercises"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"), index=True)
    order_index: Mapped[int] = mapped_column(Integer)
    type: Mapped[str] = mapped_column(String)  # 'MULTIPLE_CHOICE' | 'TRANSLATE' | 'MATCH_PAIRS' | 'FILL_BLANK' | 'TYPE_ANSWER'
    prompt: Mapped[str] = mapped_column(String)
    audio_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    payload: Mapped[dict] = mapped_column(JSON)
    
    lesson: Mapped["Lesson"] = relationship(back_populates="exercises")
    attempts: Mapped[List["ExerciseAttempt"]] = relationship(back_populates="exercise", cascade="all, delete-orphan")


class UserSkillProgress(Base):
    __tablename__ = "user_skill_progress"
    
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
    crowns: Mapped[int] = mapped_column(Integer, default=0)
    lessons_completed: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String, default="locked")  # 'locked'|'available'|'completed'|'legendary'
    
    user: Mapped["User"] = relationship(back_populates="progress")
    skill: Mapped["Skill"] = relationship(back_populates="user_progress")


class LessonAttempt(Base):
    __tablename__ = "lesson_attempts"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"), index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    xp_earned: Mapped[int] = mapped_column(Integer, default=0)
    hearts_lost: Mapped[int] = mapped_column(Integer, default=0)
    accuracy_pct: Mapped[Optional[float]] = mapped_column(Integer, nullable=True)
    is_complete: Mapped[bool] = mapped_column(Boolean, default=False)
    
    user: Mapped["User"] = relationship(back_populates="attempts")
    lesson: Mapped["Lesson"] = relationship(back_populates="attempts")
    exercise_attempts: Mapped[List["ExerciseAttempt"]] = relationship(back_populates="lesson_attempt", cascade="all, delete-orphan")


class ExerciseAttempt(Base):
    __tablename__ = "exercise_attempts"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_attempt_id: Mapped[int] = mapped_column(ForeignKey("lesson_attempts.id", ondelete="CASCADE"), index=True)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.id", ondelete="CASCADE"), index=True)
    user_answer: Mapped[dict] = mapped_column(JSON)
    is_correct: Mapped[bool] = mapped_column(Boolean)
    answered_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    lesson_attempt: Mapped["LessonAttempt"] = relationship(back_populates="exercise_attempts")
    exercise: Mapped["Exercise"] = relationship(back_populates="attempts")


class DailyActivity(Base):
    __tablename__ = "daily_activity"
    
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    date: Mapped[date] = mapped_column(Date, primary_key=True)
    xp_earned: Mapped[int] = mapped_column(Integer, default=0)
    lessons_completed: Mapped[int] = mapped_column(Integer, default=0)
    
    user: Mapped["User"] = relationship(back_populates="activity")


class LeaderboardEntry(Base):
    __tablename__ = "leaderboard_entries"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    league_tier: Mapped[str] = mapped_column(String)  # e.g., 'Bronze', 'Silver', 'Gold', etc.
    week_start: Mapped[date] = mapped_column(Date)
    weekly_xp: Mapped[int] = mapped_column(Integer, default=0)
    
    user: Mapped["User"] = relationship(back_populates="leaderboard_entries")


class Achievement(Base):
    __tablename__ = "achievements"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String, unique=True, index=True)
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String)
    icon: Mapped[str] = mapped_column(String)
    tiers: Mapped[dict] = mapped_column(JSON)
    
    user_achievements: Mapped[List["UserAchievement"]] = relationship(back_populates="achievement", cascade="all, delete-orphan")


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    achievement_id: Mapped[int] = mapped_column(ForeignKey("achievements.id", ondelete="CASCADE"), primary_key=True)
    tier_reached: Mapped[int] = mapped_column(Integer, default=1)
    unlocked_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    user: Mapped["User"] = relationship(back_populates="achievements")
    achievement: Mapped["Achievement"] = relationship(back_populates="user_achievements")
