from datetime import datetime, date, timedelta
from app.services.gamification import calculate_heart_regen, process_streak, calculate_xp

def test_heart_regen_full():
    now = datetime(2026, 7, 10, 12, 0, 0)
    refill_time = now - timedelta(hours=10)
    hearts, next_refill = calculate_heart_regen(5, 5, refill_time, now)
    assert hearts == 5
    assert next_refill == 0

def test_heart_regen_partial_no_increment():
    now = datetime(2026, 7, 10, 12, 0, 0)
    # Refill was 2 hours ago. Each heart takes 4 hours, so no new heart yet.
    refill_time = now - timedelta(hours=2)
    hearts, next_refill = calculate_heart_regen(4, 5, refill_time, now)
    assert hearts == 4
    assert next_refill == 2 * 3600  # 2 hours remaining

def test_heart_regen_partial_with_increment():
    now = datetime(2026, 7, 10, 12, 0, 0)
    # Refill was 5 hours ago. 1 heart gained, 3 hours passed of the next one.
    refill_time = now - timedelta(hours=5)
    hearts, next_refill = calculate_heart_regen(3, 5, refill_time, now)
    assert hearts == 4
    assert next_refill == 3 * 3600  # 3 hours remaining (4 hours - 1 hour remainder)

def test_heart_regen_max_cap():
    now = datetime(2026, 7, 10, 12, 0, 0)
    # Refill was 24 hours ago. 3 hearts missing, but 24 hours can refill up to 6 hearts.
    refill_time = now - timedelta(hours=24)
    hearts, next_refill = calculate_heart_regen(3, 5, refill_time, now)
    assert hearts == 5
    assert next_refill == 0

def test_streak_first_time():
    today = date(2026, 7, 10)
    streak, longest = process_streak(0, 0, None, today)
    assert streak == 1
    assert longest == 1

def test_streak_same_day():
    today = date(2026, 7, 10)
    streak, longest = process_streak(5, 10, today, today)
    assert streak == 5
    assert longest == 10

def test_streak_next_day():
    today = date(2026, 7, 10)
    yesterday = today - timedelta(days=1)
    streak, longest = process_streak(5, 5, yesterday, today)
    assert streak == 6
    assert longest == 6

def test_streak_broken():
    today = date(2026, 7, 10)
    two_days_ago = today - timedelta(days=2)
    streak, longest = process_streak(5, 10, two_days_ago, today)
    assert streak == 1
    assert longest == 10

def test_calculate_xp_standard():
    xp, perf, combo = calculate_xp(10, 1, 0)
    assert xp == 10
    assert perf == 0
    assert combo == 0

def test_calculate_xp_perfect():
    xp, perf, combo = calculate_xp(10, 0, 0)
    assert xp == 15
    assert perf == 5
    assert combo == 0

def test_calculate_xp_combo():
    xp, perf, combo = calculate_xp(10, 2, 3)
    assert xp == 12
    assert perf == 0
    assert combo == 2

def test_calculate_xp_perfect_combo():
    xp, perf, combo = calculate_xp(10, 0, 5)
    assert xp == 17
    assert perf == 5
    assert combo == 2
