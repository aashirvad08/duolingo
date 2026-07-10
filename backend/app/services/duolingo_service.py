from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta
from fastapi import HTTPException
import random

from app.models.db_models import (
    User, UserStats, Course, Unit, Skill, Lesson, Exercise,
    UserSkillProgress, LessonAttempt, ExerciseAttempt, DailyActivity,
    LeaderboardEntry, Achievement, UserAchievement
)
from app.schemas import (
    MeResponse, UserBase, UserStatsResponse, CoursePathResponse,
    UnitPathResponse, SkillPathResponse, LessonResponse, ExerciseResponse,
    StartAttemptResponse, SubmitAnswerRequest, SubmitAnswerResponse,
    CompleteAttemptResponse, HeartStatusResponse, HeartRefillResponse,
    LeaderboardResponse, LeaderboardRank, LeaderboardUser, ProfileResponse,
    AchievementResponse, ActivityHeatmapEntry
)
from app.services.gamification import calculate_heart_regen, process_streak, calculate_xp

def normalize_text(text: str) -> str:
    """Normalizes text for comparison by removing punctuation and converting to lowercase."""
    import string
    text = text.lower().strip()
    # Remove punctuation
    text = text.translate(str.maketrans("", "", string.punctuation))
    return " ".join(text.split())

def update_user_hearts_lazy(db: Session, stats: UserStats, now: datetime) -> UserStats:
    """Lazily updates user hearts based on elapsed time."""
    new_hearts, next_refill = calculate_heart_regen(
        current_hearts=stats.hearts,
        max_hearts=stats.max_hearts,
        last_refill_at=stats.last_heart_refill_at,
        now=now
    )
    if new_hearts != stats.hearts:
        stats.hearts = new_hearts
        stats.last_heart_refill_at = now
        db.add(stats)
        db.commit()
    return stats

def get_user_me(db: Session, user_id: int) -> MeResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update hearts lazily
    stats = update_user_hearts_lazy(db, user.stats, datetime.utcnow())
    
    # Calculate today's XP
    today = date.today()
    today_activity = db.query(DailyActivity).filter(
        DailyActivity.user_id == user_id,
        DailyActivity.date == today
    ).first()
    
    today_xp = today_activity.xp_earned if today_activity else 0
    daily_goal_progress = min(1.0, today_xp / max(1, stats.daily_goal_xp))
    
    return MeResponse(
        user=UserBase.model_validate(user),
        stats=UserStatsResponse.model_validate(stats),
        daily_goal_progress=daily_goal_progress
    )

def get_course_path(db: Session, course_id: int, user_id: int) -> CoursePathResponse:
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    units = db.query(Unit).filter(Unit.course_id == course_id).order_by(Unit.order_index.asc()).all()
    
    # Fetch user progress
    progress_dict = {
        p.skill_id: p for p in db.query(UserSkillProgress).filter(UserSkillProgress.user_id == user_id).all()
    }
    
    # Order skills by unit and order_index
    unit_responses = []
    
    # To determine locks, we keep track of the crowns of the previous skill.
    # The first skill is always unlocked (order_index = 1).
    previous_skill_crowns = 1  # Init with 1 so first skill is available
    
    all_skills_sorted = []
    for unit in units:
        unit_skills = db.query(Skill).filter(Skill.unit_id == unit.id).order_by(Skill.order_index.asc()).all()
        all_skills_sorted.extend(unit_skills)
        
    # Build computed status map
    skill_statuses = {}
    for idx, skill in enumerate(all_skills_sorted):
        prog = progress_dict.get(skill.id)
        
        if prog:
            crowns = prog.crowns
            lessons_completed = prog.lessons_completed
            # Keep seeded database status unless logic demands change
            status = prog.status
        else:
            crowns = 0
            lessons_completed = 0
            # If previous skill has crowns >= 1, this is available. Otherwise locked.
            if idx == 0 or previous_skill_crowns >= 1:
                status = "available"
            else:
                status = "locked"
                
        skill_statuses[skill.id] = {
            "crowns": crowns,
            "lessons_completed": lessons_completed,
            "status": status
        }
        previous_skill_crowns = crowns

    # Format output nested hierarchy
    for unit in units:
        unit_skills = db.query(Skill).filter(Skill.unit_id == unit.id).order_by(Skill.order_index.asc()).all()
        skill_responses = []
        for s in unit_skills:
            st = skill_statuses[s.id]
            skill_responses.append(SkillPathResponse(
                id=s.id,
                order_index=s.order_index,
                title=s.title,
                icon_name=s.icon_name,
                lessons_count=s.lessons_count,
                max_crowns=s.max_crowns,
                crowns=st["crowns"],
                lessons_completed=st["lessons_completed"],
                status=st["status"]
            ))
            
        unit_responses.append(UnitPathResponse(
            id=unit.id,
            order_index=unit.order_index,
            title=unit.title,
            description=unit.description,
            color_hex=unit.color_hex,
            skills=skill_responses
        ))
        
    return CoursePathResponse(
        course_id=course.id,
        title=course.title,
        from_lang=course.from_lang,
        to_lang=course.to_lang,
        flag_emoji=course.flag_emoji,
        units=unit_responses
    )

def get_lesson(db: Session, lesson_id: int, user_id: int) -> LessonResponse:
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    # Get exercises and shuffle options where necessary, and STRIP answers
    exercises = db.query(Exercise).filter(Exercise.lesson_id == lesson_id).order_by(Exercise.order_index.asc()).all()
    
    exercise_responses = []
    for ex in exercises:
        stripped_payload = ex.payload.copy()
        
        # Strip answers based on type
        if ex.type == "MULTIPLE_CHOICE":
            stripped_payload.pop("correct_id", None)
        elif ex.type == "TRANSLATE":
            stripped_payload.pop("correct_sequence", None)
        elif ex.type == "FILL_BLANK":
            stripped_payload.pop("correct", None)
        elif ex.type == "TYPE_ANSWER":
            stripped_payload.pop("accepted_answers", None)
        # MATCH_PAIRS doesn't have a single separate correct answer field;
        # the payload is just {"pairs": [{"left":..., "right":...}]}.
        # To shuffle for the client, we send items separately but do NOT send the explicit link
        # Actually, let's keep MATCH_PAIRS payload but client side it should shuffle left list and right list separately.
        # This is standard.

        exercise_responses.append(ExerciseResponse(
            id=ex.id,
            order_index=ex.order_index,
            type=ex.type,
            prompt=ex.prompt,
            audio_url=ex.audio_url,
            payload=stripped_payload
        ))
        
    return LessonResponse(
        id=lesson.id,
        skill_id=lesson.skill_id,
        order_index=lesson.order_index,
        lesson_type=lesson.lesson_type,
        xp_reward=lesson.xp_reward,
        exercises=exercise_responses
    )

def start_lesson_attempt(db: Session, lesson_id: int, user_id: int) -> StartAttemptResponse:
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if not stats:
        raise HTTPException(status_code=404, detail="User stats not found")
        
    # Update hearts lazily
    stats = update_user_hearts_lazy(db, stats, datetime.utcnow())
    
    if stats.hearts <= 0:
        raise HTTPException(status_code=400, detail="Out of hearts! Refill or practice.")
        
    # Create lesson attempt
    attempt = LessonAttempt(
        user_id=user_id,
        lesson_id=lesson_id,
        started_at=datetime.utcnow(),
        xp_earned=0,
        hearts_lost=0,
        is_complete=False
    )
    db.add(attempt)
    db.commit()
    
    return StartAttemptResponse(
        attempt_id=attempt.id,
        lesson_id=lesson_id,
        started_at=attempt.started_at
    )

def submit_exercise_answer(db: Session, attempt_id: int, request: SubmitAnswerRequest, user_id: int) -> SubmitAnswerResponse:
    attempt = db.query(LessonAttempt).filter(LessonAttempt.id == attempt_id, LessonAttempt.user_id == user_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Lesson attempt not found")
        
    if attempt.is_complete:
        raise HTTPException(status_code=400, detail="Lesson attempt already completed")
        
    exercise = db.query(Exercise).filter(Exercise.id == request.exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
        
    # Check answer
    is_correct = False
    correct_answer = None
    explanation = None
    
    payload = exercise.payload
    
    if exercise.type == "MULTIPLE_CHOICE":
        correct_id = payload.get("correct_id")
        is_correct = (str(request.answer).strip() == str(correct_id).strip())
        correct_answer = correct_id
    elif exercise.type == "TRANSLATE":
        correct_seq = payload.get("correct_sequence", [])
        is_correct = (request.answer == correct_seq)
        correct_answer = correct_seq
    elif exercise.type == "FILL_BLANK":
        correct = payload.get("correct")
        is_correct = (str(request.answer).strip().lower() == str(correct).strip().lower())
        correct_answer = correct
    elif exercise.type == "MATCH_PAIRS":
        # Request answer is list of pairs e.g. [{"left": "hola", "right": "hello"}, ...]
        # DB pairs is payload["pairs"]
        db_pairs = payload.get("pairs", [])
        user_pairs = request.answer
        
        # Verify matching
        if isinstance(user_pairs, list) and len(user_pairs) == len(db_pairs):
            matches_count = 0
            for u_pair in user_pairs:
                # Find matching left in db_pairs
                match_found = False
                for db_pair in db_pairs:
                    if db_pair["left"] == u_pair.get("left") and db_pair["right"] == u_pair.get("right"):
                        match_found = True
                        break
                if match_found:
                    matches_count += 1
            is_correct = (matches_count == len(db_pairs))
        correct_answer = db_pairs
    elif exercise.type == "TYPE_ANSWER":
        accepted = payload.get("accepted_answers", [])
        normalized_user = normalize_text(str(request.answer))
        is_correct = any(normalize_text(acc) == normalized_user for acc in accepted)
        correct_answer = accepted[0] if accepted else ""
        
    # Save exercise attempt
    ex_attempt = ExerciseAttempt(
        lesson_attempt_id=attempt.id,
        exercise_id=exercise.id,
        user_answer=request.answer,
        is_correct=is_correct,
        answered_at=datetime.utcnow()
    )
    db.add(ex_attempt)
    
    # Handle hearts if wrong
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if not is_correct:
        attempt.hearts_lost += 1
        stats.hearts = max(0, stats.hearts - 1)
        db.add(stats)
        
        # If no hearts remaining, terminate attempt
        if stats.hearts <= 0:
            attempt.completed_at = datetime.utcnow()
            attempt.is_complete = True  # We mark the attempt record complete, but is_complete indicates done
            # Note: client will see 0 hearts and trigger out-of-hearts modal
            
    db.commit()
    
    return SubmitAnswerResponse(
        is_correct=is_correct,
        correct_answer=correct_answer,
        hearts_remaining=stats.hearts,
        explanation=explanation
    )

def complete_lesson_attempt(db: Session, attempt_id: int, user_id: int) -> CompleteAttemptResponse:
    attempt = db.query(LessonAttempt).filter(LessonAttempt.id == attempt_id, LessonAttempt.user_id == user_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Lesson attempt not found")
        
    if attempt.is_complete and attempt.completed_at is not None:
        # Prevent double completions
        stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
        return CompleteAttemptResponse(
            xp_earned=attempt.xp_earned,
            accuracy=attempt.accuracy_pct or 0.0,
            time_sec=int((attempt.completed_at - attempt.started_at).total_seconds()),
            combo_bonus=0,
            new_crowns=0,
            streak=stats.current_streak
        )
        
    # Get all exercise attempts
    ex_attempts = db.query(ExerciseAttempt).filter(ExerciseAttempt.lesson_attempt_id == attempt_id).all()
    total_answers = len(ex_attempts)
    correct_answers = sum(1 for e in ex_attempts if e.is_correct)
    accuracy = (correct_answers / total_answers * 100.0) if total_answers > 0 else 0.0
    
    # Compute max consecutive correct answers (combo)
    max_combo = 0
    current_combo = 0
    # Order attempts by answered_at
    sorted_attempts = sorted(ex_attempts, key=lambda x: x.answered_at)
    for sa in sorted_attempts:
        if sa.is_correct:
            current_combo += 1
            max_combo = max(max_combo, current_combo)
        else:
            current_combo = 0
            
    # Calculate XP
    lesson = db.query(Lesson).filter(Lesson.id == attempt.lesson_id).first()
    base_xp = lesson.xp_reward if lesson else 10
    total_xp, perfect_bonus, combo_bonus = calculate_xp(base_xp, attempt.hearts_lost, max_combo)
    
    # Save completion state
    attempt.completed_at = datetime.utcnow()
    attempt.xp_earned = total_xp
    attempt.accuracy_pct = accuracy
    attempt.is_complete = True
    db.add(attempt)
    
    # Update user stats
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    stats.total_xp += total_xp
    
    # Update Streak
    today_val = date.today()
    new_streak, new_longest = process_streak(
        current_streak=stats.current_streak,
        longest_streak=stats.longest_streak,
        last_activity_date=stats.last_activity_date,
        today=today_val
    )
    # Check streak freeze/break if active date is older?
    # Spec: "Only counts once daily_goal_xp is met? No - Duolingo increments on any lesson. Increment on first lesson of the day."
    # If the user's last activity date was not today, increment streak.
    if stats.last_activity_date != today_val:
        stats.current_streak = new_streak
        stats.longest_streak = new_longest
        
    stats.last_activity_date = today_val
    db.add(stats)
    
    # Update DailyActivity
    daily_act = db.query(DailyActivity).filter(
        DailyActivity.user_id == user_id,
        DailyActivity.date == today_val
    ).first()
    
    if daily_act:
        daily_act.xp_earned += total_xp
        daily_act.lessons_completed += 1
    else:
        daily_act = DailyActivity(
            user_id=user_id,
            date=today_val,
            xp_earned=total_xp,
            lessons_completed=1
        )
        db.add(daily_act)
        
    # Update crowns and skill progress
    skill = db.query(Skill).filter(Skill.id == lesson.skill_id).first()
    new_crowns_earned = 0
    if skill:
        prog = db.query(UserSkillProgress).filter(
            UserSkillProgress.user_id == user_id,
            UserSkillProgress.skill_id == skill.id
        ).first()
        
        if not prog:
            prog = UserSkillProgress(
                user_id=user_id,
                skill_id=skill.id,
                crowns=0,
                lessons_completed=0,
                status="available"
            )
            db.add(prog)
            
        prog.lessons_completed += 1
        if prog.lessons_completed >= skill.lessons_count:
            prog.crowns = min(skill.max_crowns, prog.crowns + 1)
            prog.lessons_completed = 0
            new_crowns_earned = 1
            
            # Check status upgrade
            if prog.crowns >= skill.max_crowns:
                prog.status = "legendary"
            else:
                prog.status = "completed"
                
            # If crowns went from 0 to 1, we must unlock the NEXT skill!
            # Find next skill by order_index
            next_skill = db.query(Skill).filter(
                Skill.unit_id == skill.unit_id,
                Skill.order_index == skill.order_index + 1
            ).first()
            if next_skill:
                next_prog = db.query(UserSkillProgress).filter(
                    UserSkillProgress.user_id == user_id,
                    UserSkillProgress.skill_id == next_skill.id
                ).first()
                if not next_prog:
                    next_prog = UserSkillProgress(
                        user_id=user_id,
                        skill_id=next_skill.id,
                        crowns=0,
                        lessons_completed=0,
                        status="available"
                    )
                    db.add(next_prog)
                elif next_prog.status == "locked":
                    next_prog.status = "available"
                    db.add(next_prog)
                    
        db.add(prog)
        
    # Check Achievements
    check_achievements(db, user_id)
    
    db.commit()
    
    time_sec = int((attempt.completed_at - attempt.started_at).total_seconds())
    
    return CompleteAttemptResponse(
        xp_earned=total_xp,
        accuracy=accuracy,
        time_sec=time_sec,
        combo_bonus=combo_bonus,
        new_crowns=new_crowns_earned,
        streak=stats.current_streak
    )

def check_achievements(db: Session, user_id: int):
    """Evaluates learner achievements and awards gems on tier unlocks."""
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if not stats:
        return
        
    achievements = db.query(Achievement).all()
    user_achs = {ua.achievement_id: ua for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()}
    
    for ach in achievements:
        progress_val = 0
        
        # Calculate metric based on achievement code
        if ach.code == "wildfire":
            progress_val = stats.current_streak
        elif ach.code == "sage":
            progress_val = stats.total_xp
        elif ach.code == "scholar":
            # Count how many type translation exercises completed or mock it
            # Let's count lessons completed * 5
            lessons_count = db.query(func.count(LessonAttempt.id)).filter(
                LessonAttempt.user_id == user_id,
                LessonAttempt.is_complete == True
            ).scalar() or 0
            progress_val = lessons_count * 5
        elif ach.code == "champion":
            # User is in Ruby league, Ruby is tier 2 (Bronze=0, Silver=1, Ruby=2, Gold=3...)
            progress_val = 2
        elif ach.code == "sharpshooter":
            # Count of perfect attempts
            progress_val = db.query(func.count(LessonAttempt.id)).filter(
                LessonAttempt.user_id == user_id,
                LessonAttempt.is_complete == True,
                LessonAttempt.hearts_lost == 0
            ).scalar() or 0
        elif ach.code == "superstar":
            # Sum of crowns
            progress_val = db.query(func.sum(UserSkillProgress.crowns)).filter(
                UserSkillProgress.user_id == user_id
            ).scalar() or 0
        elif ach.code == "legendary":
            # Sum of legendary skills
            progress_val = db.query(func.count(UserSkillProgress.skill_id)).filter(
                UserSkillProgress.user_id == user_id,
                UserSkillProgress.status == "legendary"
            ).scalar() or 0
        elif ach.code == "weekend_warrior":
            # Completed lessons on weekends
            # Check LessonAttempts completed_at day of week
            weekend_attempts = 0
            completed_attempts = db.query(LessonAttempt).filter(
                LessonAttempt.user_id == user_id,
                LessonAttempt.is_complete == True
            ).all()
            for ca in completed_attempts:
                if ca.completed_at and ca.completed_at.weekday() in [5, 6]:
                    weekend_attempts += 1
            progress_val = weekend_attempts
            
        # Determine highest tier reached
        highest_tier = 0
        gems_rewarded = 0
        for tier in ach.tiers:
            if progress_val >= tier["goal"]:
                highest_tier = tier["tier"]
                
        # If user has unlocked a new tier
        ua = user_achs.get(ach.id)
        if not ua:
            if highest_tier > 0:
                # Earned tier 1+ from scratch
                # Sum reward gems up to highest_tier
                for t in ach.tiers:
                    if t["tier"] <= highest_tier:
                        gems_rewarded += t["reward_gems"]
                        
                ua = UserAchievement(
                    user_id=user_id,
                    achievement_id=ach.id,
                    tier_reached=highest_tier,
                    unlocked_at=datetime.utcnow()
                )
                db.add(ua)
        else:
            if highest_tier > ua.tier_reached:
                # Earned higher tier
                # Sum reward gems for intermediate tiers
                for t in ach.tiers:
                    if ua.tier_reached < t["tier"] <= highest_tier:
                        gems_rewarded += t["reward_gems"]
                ua.tier_reached = highest_tier
                ua.unlocked_at = datetime.utcnow()
                db.add(ua)
                
        if gems_rewarded > 0:
            stats.gems += gems_rewarded
            db.add(stats)

def refill_hearts(db: Session, user_id: int) -> HeartRefillResponse:
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if not stats:
        raise HTTPException(status_code=404, detail="User stats not found")
        
    stats = update_user_hearts_lazy(db, stats, datetime.utcnow())
    
    if stats.hearts >= stats.max_hearts:
        return HeartRefillResponse(
            success=False,
            hearts=stats.hearts,
            gems=stats.gems,
            message="Hearts are already full!"
        )
        
    cost = 350
    if stats.gems < cost:
        return HeartRefillResponse(
            success=False,
            hearts=stats.hearts,
            gems=stats.gems,
            message="Not enough gems! Cost is 350 gems."
        )
        
    stats.gems -= cost
    stats.hearts = stats.max_hearts
    stats.last_heart_refill_at = datetime.utcnow()
    db.add(stats)
    db.commit()
    
    return HeartRefillResponse(
        success=True,
        hearts=stats.hearts,
        gems=stats.gems,
        message="Hearts successfully refilled!"
    )

def get_heart_status(db: Session, user_id: int) -> HeartStatusResponse:
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if not stats:
        raise HTTPException(status_code=404, detail="User stats not found")
        
    stats = update_user_hearts_lazy(db, stats, datetime.utcnow())
    
    _, next_refill = calculate_heart_regen(
        current_hearts=stats.hearts,
        max_hearts=stats.max_hearts,
        last_refill_at=stats.last_heart_refill_at,
        now=datetime.utcnow()
    )
    
    return HeartStatusResponse(
        hearts=stats.hearts,
        next_refill_in_sec=next_refill
    )

def get_leaderboard(db: Session, user_id: int) -> LeaderboardResponse:
    # Get current week's Monday
    today = date.today()
    monday = today - timedelta(days=today.weekday())
    
    entries = db.query(LeaderboardEntry).filter(
        LeaderboardEntry.league_tier == "Ruby",
        LeaderboardEntry.week_start == monday
    ).order_by(LeaderboardEntry.weekly_xp.desc()).all()
    
    rankings = []
    for rank, entry in enumerate(entries, start=1):
        u = entry.user
        rankings.append(LeaderboardRank(
            rank=rank,
            user=LeaderboardUser(
                username=u.username,
                display_name=u.display_name,
                avatar_url=u.avatar_url
            ),
            weekly_xp=entry.weekly_xp,
            current_streak=u.stats.current_streak if u.stats else 0
        ))
        
    return LeaderboardResponse(
        league_tier="Ruby",
        week_start=monday,
        rankings=rankings
    )

def get_profile(db: Session, profile_user_id: int) -> ProfileResponse:
    user = db.query(User).filter(User.id == profile_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    stats = update_user_hearts_lazy(db, user.stats, datetime.utcnow())
    
    # Calculate achievements progress
    achievements = db.query(Achievement).all()
    user_achs = {ua.achievement_id: ua for ua in db.query(UserAchievement).filter(UserAchievement.user_id == profile_user_id).all()}
    
    achievement_responses = []
    for ach in achievements:
        ua = user_achs.get(ach.id)
        current_tier = ua.tier_reached if ua else 0
        
        # Calculate metric progress
        progress_val = 0
        if ach.code == "wildfire":
            progress_val = stats.current_streak
        elif ach.code == "sage":
            progress_val = stats.total_xp
        elif ach.code == "scholar":
            lessons_count = db.query(func.count(LessonAttempt.id)).filter(
                LessonAttempt.user_id == profile_user_id,
                LessonAttempt.is_complete == True
            ).scalar() or 0
            progress_val = lessons_count * 5
        elif ach.code == "champion":
            progress_val = 2
        elif ach.code == "sharpshooter":
            progress_val = db.query(func.count(LessonAttempt.id)).filter(
                LessonAttempt.user_id == profile_user_id,
                LessonAttempt.is_complete == True,
                LessonAttempt.hearts_lost == 0
            ).scalar() or 0
        elif ach.code == "superstar":
            progress_val = db.query(func.sum(UserSkillProgress.crowns)).filter(
                UserSkillProgress.user_id == profile_user_id
            ).scalar() or 0
        elif ach.code == "legendary":
            progress_val = db.query(func.count(UserSkillProgress.skill_id)).filter(
                UserSkillProgress.user_id == profile_user_id,
                UserSkillProgress.status == "legendary"
            ).scalar() or 0
        elif ach.code == "weekend_warrior":
            weekend_attempts = 0
            completed_attempts = db.query(LessonAttempt).filter(
                LessonAttempt.user_id == profile_user_id,
                LessonAttempt.is_complete == True
            ).all()
            for ca in completed_attempts:
                if ca.completed_at and ca.completed_at.weekday() in [5, 6]:
                    weekend_attempts += 1
            progress_val = weekend_attempts
            
        # Find next tier details
        max_tier_reached = True
        next_goal = None
        for tier in ach.tiers:
            if tier["tier"] == current_tier + 1:
                next_goal = tier["goal"]
                max_tier_reached = False
                break
                
        achievement_responses.append(AchievementResponse(
            code=ach.code,
            title=ach.title,
            description=ach.description,
            icon=ach.icon,
            current_tier=current_tier,
            unlocked=(current_tier > 0),
            progress_value=progress_val,
            next_tier_goal=next_goal,
            max_tier_reached=max_tier_reached
        ))
        
    # Get last 6 months activity heatmap
    six_months_ago = date.today() - timedelta(days=180)
    heatmap_records = db.query(DailyActivity).filter(
        DailyActivity.user_id == profile_user_id,
        DailyActivity.date >= six_months_ago
    ).order_by(DailyActivity.date.asc()).all()
    
    activity_heatmap = [
        ActivityHeatmapEntry(
            date=r.date,
            xp_earned=r.xp_earned,
            lessons_completed=r.lessons_completed
        ) for r in heatmap_records
    ]
    
    return ProfileResponse(
        user=UserBase.model_validate(user),
        stats=UserStatsResponse.model_validate(stats),
        achievements=achievement_responses,
        activity_heatmap=activity_heatmap
    )

def advance_day_debug(db: Session, user_id: int) -> UserStatsResponse:
    """Debug utility to shift user streak dates backward by 1 day, simulating the passage of time."""
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if not stats:
        raise HTTPException(status_code=404, detail="Stats not found")
        
    # Move last activity back by 1 day
    if stats.last_activity_date:
        stats.last_activity_date = stats.last_activity_date - timedelta(days=1)
        
    # Move heart refill date back by 4 hours to simulate heart regen
    stats.last_heart_refill_at = stats.last_heart_refill_at - timedelta(hours=4)
    db.add(stats)
    db.commit()
    
    # Re-fetch with heart update
    stats = update_user_hearts_lazy(db, stats, datetime.utcnow())
    return UserStatsResponse.model_validate(stats)
