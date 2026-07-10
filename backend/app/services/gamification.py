from datetime import datetime, date, timedelta
from typing import Tuple

def calculate_heart_regen(current_hearts: int, max_hearts: int, last_refill_at: datetime, now: datetime) -> Tuple[int, int]:
    """
    Calculates current hearts based on time passed since last refill.
    Regenerates 1 heart every 4 hours.
    Returns:
        (new_hearts, seconds_until_next_refill)
    """
    if current_hearts >= max_hearts:
        return max_hearts, 0
        
    diff = now - last_refill_at
    seconds_passed = int(diff.total_seconds())
    if seconds_passed < 0:
        seconds_passed = 0
        
    seconds_per_heart = 4 * 3600  # 4 hours
    
    hearts_regenerated = seconds_passed // seconds_per_heart
    new_hearts = min(max_hearts, current_hearts + hearts_regenerated)
    
    if new_hearts >= max_hearts:
        return max_hearts, 0
        
    seconds_for_next = seconds_per_heart - (seconds_passed % seconds_per_heart)
    return new_hearts, seconds_for_next

def process_streak(current_streak: int, longest_streak: int, last_activity_date: date, today: date) -> Tuple[int, int]:
    """
    Processes the user's streak based on their last activity date.
    Returns:
        (new_streak, new_longest_streak)
    """
    if last_activity_date is None:
        new_streak = 1
    elif last_activity_date == today:
        new_streak = current_streak
    elif last_activity_date == today - timedelta(days=1):
        new_streak = current_streak + 1
    else:
        new_streak = 1
        
    new_longest = max(longest_streak, new_streak)
    return new_streak, new_longest

def calculate_xp(base_xp: int, hearts_lost: int, max_combo: int) -> Tuple[int, int, int]:
    """
    Calculates XP earned.
    Base XP is 10.
    Perfect lesson (0 hearts lost) = +5 XP.
    Combo bonus (3+ correct answers in a row) = +2 XP.
    Returns:
        (total_xp_earned, perfect_bonus, combo_bonus)
    """
    perfect_bonus = 5 if hearts_lost == 0 else 0
    combo_bonus = 2 if max_combo >= 3 else 0
    total_xp = base_xp + perfect_bonus + combo_bonus
    return total_xp, perfect_bonus, combo_bonus
