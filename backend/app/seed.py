import os
import sys
from datetime import datetime, date, timedelta
import random

# Add root directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal, engine
from app.models.base import Base
from app.models.db_models import (
    User, UserStats, Course, Unit, Skill, Lesson, Exercise,
    UserSkillProgress, DailyActivity, LeaderboardEntry,
    Achievement, UserAchievement
)

def seed_db():
    from sqlalchemy import text
    db = SessionLocal()
    
    # 1. Clear database
    print("Clearing database...")
    if engine.dialect.name == "postgresql":
        # Truncate tables and reset all auto-increment sequences to 1
        db.execute(text("""
            TRUNCATE TABLE 
                user_achievements, 
                achievements, 
                leaderboard_entries, 
                daily_activity, 
                user_skill_progress, 
                exercises, 
                lessons, 
                skills, 
                units, 
                courses, 
                user_stats, 
                users 
            RESTART IDENTITY CASCADE
        """))
        db.commit()
    else:
        # Fallback for SQLite
        db.query(UserAchievement).delete()
        db.query(Achievement).delete()
        db.query(LeaderboardEntry).delete()
        db.query(DailyActivity).delete()
        db.query(UserSkillProgress).delete()
        db.query(Exercise).delete()
        db.query(Lesson).delete()
        db.query(Skill).delete()
        db.query(Unit).delete()
        db.query(Course).delete()
        db.query(UserStats).delete()
        db.query(User).delete()
        db.commit()

    print("Seeding database...")

    # 2. Create achievements
    achievements = [
        Achievement(
            code="wildfire",
            title="Wildfire",
            description="Reach a streak of days completing lessons",
            icon="streak",
            tiers=[
                {"tier": 1, "goal": 3, "reward_gems": 50},
                {"tier": 2, "goal": 7, "reward_gems": 100},
                {"tier": 3, "goal": 14, "reward_gems": 200},
                {"tier": 4, "goal": 30, "reward_gems": 500}
            ]
        ),
        Achievement(
            code="sage",
            title="Sage",
            description="Earn total XP across all lessons",
            icon="xp",
            tiers=[
                {"tier": 1, "goal": 100, "reward_gems": 50},
                {"tier": 2, "goal": 500, "reward_gems": 100},
                {"tier": 3, "goal": 1000, "reward_gems": 200},
                {"tier": 4, "goal": 5000, "reward_gems": 500}
            ]
        ),
        Achievement(
            code="scholar",
            title="Scholar",
            description="Learn new words in a language",
            icon="book",
            tiers=[
                {"tier": 1, "goal": 10, "reward_gems": 50},
                {"tier": 2, "goal": 50, "reward_gems": 100},
                {"tier": 3, "goal": 100, "reward_gems": 200},
                {"tier": 4, "goal": 250, "reward_gems": 500}
            ]
        ),
        Achievement(
            code="champion",
            title="Champion",
            description="Advance through leaderboard leagues",
            icon="trophy",
            tiers=[
                {"tier": 1, "goal": 1, "reward_gems": 50},  # reach silver
                {"tier": 2, "goal": 3, "reward_gems": 150}, # reach ruby
                {"tier": 3, "goal": 5, "reward_gems": 300}  # reach diamond
            ]
        ),
        Achievement(
            code="sharpshooter",
            title="Sharpshooter",
            description="Complete a lesson with 100% accuracy",
            icon="bullseye",
            tiers=[
                {"tier": 1, "goal": 1, "reward_gems": 50},
                {"tier": 2, "goal": 5, "reward_gems": 100},
                {"tier": 3, "goal": 20, "reward_gems": 300}
            ]
        ),
        Achievement(
            code="superstar",
            title="Superstar",
            description="Earn crowns on skills",
            icon="crown",
            tiers=[
                {"tier": 1, "goal": 5, "reward_gems": 50},
                {"tier": 2, "goal": 20, "reward_gems": 150},
                {"tier": 3, "goal": 50, "reward_gems": 300}
            ]
        ),
        Achievement(
            code="legendary",
            title="Legendary",
            description="Upgrade skills to Legendary level",
            icon="purple_crown",
            tiers=[
                {"tier": 1, "goal": 1, "reward_gems": 100},
                {"tier": 2, "goal": 5, "reward_gems": 250},
                {"tier": 3, "goal": 10, "reward_gems": 500}
            ]
        ),
        Achievement(
            code="weekend_warrior",
            title="Weekend Warrior",
            description="Complete lessons on Saturday or Sunday",
            icon="shield",
            tiers=[
                {"tier": 1, "goal": 2, "reward_gems": 50},
                {"tier": 2, "goal": 10, "reward_gems": 150},
                {"tier": 3, "goal": 30, "reward_gems": 300}
            ]
        )
    ]
    for ach in achievements:
        db.add(ach)
    db.commit()

    # 3. Create Course
    course = Course(
        from_lang="en",
        to_lang="es",
        title="Spanish",
        flag_emoji="🇪🇸"
    )
    db.add(course)
    db.commit()

    # 4. Create Units
    unit1 = Unit(
        course_id=course.id,
        order_index=1,
        title="Basics",
        description="Form basic sentences, introduce yourself",
        color_hex="#58CC02"  # Green
    )
    unit2 = Unit(
        course_id=course.id,
        order_index=2,
        title="Greetings",
        description="Say hello, ask for directions, be polite",
        color_hex="#1CB0F6"  # Blue
    )
    unit3 = Unit(
        course_id=course.id,
        order_index=3,
        title="Food",
        description="Order at a restaurant, discuss foods and drinks",
        color_hex="#CE82FF"  # Purple
    )
    db.add_all([unit1, unit2, unit3])
    db.commit()

    # 5. Create Skills
    skills = [
        # Unit 1 Skills
        Skill(unit_id=unit1.id, order_index=1, title="Intro", icon_name="home", lessons_count=3, max_crowns=5),
        Skill(unit_id=unit1.id, order_index=2, title="Travel", icon_name="headphones", lessons_count=3, max_crowns=5),
        Skill(unit_id=unit1.id, order_index=3, title="Family", icon_name="users", lessons_count=3, max_crowns=5),
        Skill(unit_id=unit1.id, order_index=4, title="People", icon_name="user", lessons_count=3, max_crowns=5),
        
        # Unit 2 Skills
        Skill(unit_id=unit2.id, order_index=5, title="Greetings", icon_name="microphone", lessons_count=3, max_crowns=5),
        Skill(unit_id=unit2.id, order_index=6, title="Work", icon_name="briefcase", lessons_count=3, max_crowns=5),
        Skill(unit_id=unit2.id, order_index=7, title="Leisure", icon_name="compass", lessons_count=3, max_crowns=5),
        Skill(unit_id=unit2.id, order_index=8, title="Shopping", icon_name="shopping-bag", lessons_count=3, max_crowns=5),
        
        # Unit 3 Skills
        Skill(unit_id=unit3.id, order_index=9, title="Food", icon_name="coffee", lessons_count=3, max_crowns=5),
        Skill(unit_id=unit3.id, order_index=10, title="Dining", icon_name="utensils", lessons_count=3, max_crowns=5),
        Skill(unit_id=unit3.id, order_index=11, title="Breakfast", icon_name="egg", lessons_count=3, max_crowns=5),
        Skill(unit_id=unit3.id, order_index=12, title="Groceries", icon_name="shopping-cart", lessons_count=3, max_crowns=5)
    ]
    db.add_all(skills)
    db.commit()

    # 6. Create Lessons & Exercises (varied types)
    # We need 3 lessons per skill, 7 exercises per lesson.
    # Vocabulary pool for generating interesting exercises
    vocab = [
        {"es": "hola", "en": "hello", "type": "greeting"},
        {"es": "adiós", "en": "goodbye", "type": "greeting"},
        {"es": "gracias", "en": "thanks", "type": "greeting"},
        {"es": "por favor", "en": "please", "type": "greeting"},
        {"es": "el hombre", "en": "the man", "type": "noun"},
        {"es": "la mujer", "en": "the woman", "type": "noun"},
        {"es": "el niño", "en": "the boy", "type": "noun"},
        {"es": "la niña", "en": "the girl", "type": "noun"},
        {"es": "el gato", "en": "the cat", "type": "noun"},
        {"es": "el perro", "en": "the dog", "type": "noun"},
        {"es": "pan", "en": "bread", "type": "food"},
        {"es": "agua", "en": "water", "type": "food"},
        {"es": "manzana", "en": "apple", "type": "food"},
        {"es": "leche", "en": "milk", "type": "food"},
        {"es": "pescado", "en": "fish", "type": "food"},
        {"es": "carne", "en": "meat", "type": "food"},
        {"es": "queso", "en": "cheese", "type": "food"},
        {"es": "arroz", "en": "rice", "type": "food"},
        {"es": "pollo", "en": "chicken", "type": "food"},
        {"es": "come", "en": "eats", "type": "verb"},
        {"es": "bebe", "en": "drinks", "type": "verb"},
        {"es": "yo", "en": "I", "type": "pronoun"},
        {"es": "tú", "en": "you", "type": "pronoun"},
        {"es": "él", "en": "he", "type": "pronoun"},
        {"es": "ella", "en": "she", "type": "pronoun"},
        {"es": "un", "en": "a", "type": "article"},
        {"es": "una", "en": "a", "type": "article"}
    ]

    print("Generating lessons and exercises...")
    for skill in skills:
        for l_idx in range(1, 4):
            lesson = Lesson(
                skill_id=skill.id,
                order_index=l_idx,
                lesson_type="lesson",
                xp_reward=10
            )
            db.add(lesson)
            db.commit()

            # Generate 7 exercises of different types
            # Let's seed distinct templates to make them feel highly real
            # Exercise 1: MULTIPLE_CHOICE (Simple vocabulary translation with options)
            ex1_v = random.choice([v for v in vocab if v["type"] in ["noun", "food"]])
            others = [v for v in vocab if v != ex1_v and v["type"] == ex1_v["type"]][:3]
            if len(others) < 3:
                others = [v for v in vocab if v != ex1_v][:3]
            
            options = [{"id": ex1_v["es"], "text": ex1_v["es"], "image_url": None}]
            for o in others:
                options.append({"id": o["es"], "text": o["es"], "image_url": None})
            random.shuffle(options)

            ex1 = Exercise(
                lesson_id=lesson.id,
                order_index=1,
                type="MULTIPLE_CHOICE",
                prompt=f'Select the correct translation for "{ex1_v["en"]}"',
                payload={
                    "options": options,
                    "correct_id": ex1_v["es"]
                }
            )

            # Exercise 2: TRANSLATE (Translate English sentence to Spanish using word bank)
            # e.g., "The boy eats bread" -> "El niño come pan"
            sub = random.choice([{"es": "El niño", "en": "The boy"}, {"es": "El hombre", "en": "The man"}, {"es": "La mujer", "en": "The woman"}, {"es": "La niña", "en": "The girl"}])
            verb = random.choice([{"es": "come", "en": "eats"}, {"es": "bebe", "en": "drinks"}])
            obj = random.choice([{"es": "pan", "en": "bread"}, {"es": "agua", "en": "water"}, {"es": "leche", "en": "milk"}, {"es": "una manzana", "en": "an apple"}])
            
            correct_words = sub["es"].split() + [verb["es"]] + obj["es"].split()
            distractors = ["adiós", "hola", "perro", "gato", "gracias"]
            word_bank = list(set(correct_words + distractors))
            random.shuffle(word_bank)

            ex2 = Exercise(
                lesson_id=lesson.id,
                order_index=2,
                type="TRANSLATE",
                prompt=f'Translate this sentence: "{sub["en"]} {verb["en"]} {obj["en"]}"',
                payload={
                    "word_bank": word_bank,
                    "correct_sequence": correct_words,
                    "distractors": distractors
                }
            )

            # Exercise 3: FILL_BLANK (Select correct word to fill blank)
            # e.g. "Yo ___ agua" -> options: [como, bebo, gracias] -> correct: bebo
            ex3_data = random.choice([
                {"sentence": "Yo ___ pan", "options": ["como", "bebo", "gracias"], "correct": "como", "prompt": "Complete the sentence"},
                {"sentence": "Yo ___ agua", "options": ["como", "bebo", "hola"], "correct": "bebo", "prompt": "Complete the sentence"},
                {"sentence": "El niño ___ leche", "options": ["bebe", "come", "mujer"], "correct": "bebe", "prompt": "Complete the sentence"},
                {"sentence": "La mujer ___ una manzana", "options": ["come", "bebe", "adiós"], "correct": "come", "prompt": "Complete the sentence"}
            ])

            ex3 = Exercise(
                lesson_id=lesson.id,
                order_index=3,
                type="FILL_BLANK",
                prompt=ex3_data["prompt"],
                payload={
                    "sentence": ex3_data["sentence"],
                    "options": ex3_data["options"],
                    "correct": ex3_data["correct"]
                }
            )

            # Exercise 4: MATCH_PAIRS (Match 4 Spanish words with English equivalents)
            pairs_pool = random.sample(vocab, 4)
            pairs = [{"left": p["es"], "right": p["en"]} for p in pairs_pool]

            ex4 = Exercise(
                lesson_id=lesson.id,
                order_index=4,
                type="MATCH_PAIRS",
                prompt="Tap the matching pairs",
                payload={
                    "pairs": pairs
                }
            )

            # Exercise 5: TYPE_ANSWER (Type in the English meaning of a Spanish sentence)
            ex5_data = random.choice([
                {"es": "Hola, buenos días", "en": "Hello, good morning", "accepted": ["hello good morning", "hello, good morning", "hi good morning"]},
                {"es": "Gracias, adiós", "en": "Thanks, goodbye", "accepted": ["thanks goodbye", "thanks, goodbye", "thank you, goodbye", "thank you goodbye"]},
                {"es": "El gato come pescado", "en": "The cat eats fish", "accepted": ["the cat eats fish", "a cat eats fish", "cat eats fish"]},
                {"es": "Por favor, agua", "en": "Please, water", "accepted": ["please water", "please, water", "water please"]}
            ])

            ex5 = Exercise(
                lesson_id=lesson.id,
                order_index=5,
                type="TYPE_ANSWER",
                prompt=f'Write this in English: "{ex5_data["es"]}"',
                payload={
                    "source_text": ex5_data["es"],
                    "accepted_answers": ex5_data["accepted"]
                }
            )

            # Exercise 6: MULTIPLE_CHOICE (Image choice, text prompts)
            ex6_v = random.choice([v for v in vocab if v["type"] in ["noun", "food"]])
            others6 = [v for v in vocab if v != ex6_v and v["type"] == ex6_v["type"]][:2]
            if len(others6) < 2:
                others6 = [v for v in vocab if v != ex6_v][:2]
            
            options6 = [{"id": ex6_v["es"], "text": ex6_v["es"], "image_url": f"/images/vocab/{ex6_v['es']}.png"}]
            for o in others6:
                options6.append({"id": o["es"], "text": o["es"], "image_url": f"/images/vocab/{o['es']}.png"})
            random.shuffle(options6)

            ex6 = Exercise(
                lesson_id=lesson.id,
                order_index=6,
                type="MULTIPLE_CHOICE",
                prompt=f'Which of these is "{ex6_v["en"]}"?',
                payload={
                    "options": options6,
                    "correct_id": ex6_v["es"]
                }
            )

            # Exercise 7: TRANSLATE (Spanish to English word block sequence)
            # e.g., "El perro bebe leche" -> "The dog drinks milk"
            correct_words_eng = ["the", "dog", "drinks", "milk"]
            distractors_eng = ["cat", "bread", "thanks", "hello", "water"]
            word_bank_eng = list(set(correct_words_eng + distractors_eng))
            random.shuffle(word_bank_eng)

            ex7 = Exercise(
                lesson_id=lesson.id,
                order_index=7,
                type="TRANSLATE",
                prompt='Translate this sentence: "El perro bebe leche"',
                payload={
                    "word_bank": word_bank_eng,
                    "correct_sequence": correct_words_eng,
                    "distractors": distractors_eng
                }
            )

            db.add_all([ex1, ex2, ex3, ex4, ex5, ex6, ex7])
            db.commit()

    # 7. Create Users & Stats
    # Learner user (id=1)
    learner = User(
        id=1,
        username="learner",
        display_name="Learner Duo",
        avatar_url="/images/avatars/duo.png"
    )
    db.add(learner)
    db.commit()

    # Learner stats (Unit 1 complete, Unit 2 partial)
    today_date = date.today()
    learner_stats = UserStats(
        user_id=learner.id,
        total_xp=1240,
        gems=500,
        hearts=4,
        max_hearts=5,
        last_heart_refill_at=datetime.utcnow(),
        current_streak=12,
        longest_streak=12,
        last_activity_date=today_date,
        daily_goal_xp=20,
        freeze_count=0
    )
    db.add(learner_stats)
    db.commit()

    # Add 10 other mock users for leaderboard
    leaderboard_names = [
        ("luis_es", "Luis", 1800),
        ("maria_g", "Maria", 1500),
        ("juan_23", "Juan", 1100),
        ("ana_chef", "Ana", 950),
        ("carlos_m", "Carlos", 800),
        ("sofia_x", "Sofia", 600),
        ("diego_v", "Diego", 450),
        ("laura_w", "Laura", 300),
        ("pablo_99", "Pablo", 150),
        ("lucia_r", "Lucia", 50)
    ]
    
    mock_users = []
    for idx, (username, display, xp) in enumerate(leaderboard_names, start=2):
        u = User(
            id=idx,
            username=username,
            display_name=display,
            avatar_url=f"/images/avatars/avatar_{idx}.png"
        )
        db.add(u)
        db.commit()
        
        # UserStats for mock users
        stats = UserStats(
            user_id=u.id,
            total_xp=xp,
            gems=200,
            hearts=5,
            max_hearts=5,
            last_heart_refill_at=datetime.utcnow(),
            current_streak=idx * 2,
            longest_streak=idx * 3,
            last_activity_date=today_date,
            daily_goal_xp=20,
            freeze_count=0
        )
        db.add(stats)
        db.commit()
        mock_users.append((u, xp))

    # 8. User skill progress
    # Unit 1 Done: Skills 1-4 completed (crowns=5, status='legendary', lessons_completed=3)
    # Unit 2 Partially Done: Skill 5 unlocked (crowns=1, status='available', lessons_completed=1)
    # Skills 6-12: status='locked' or 'available' depending on logic
    # Let's seed these in database
    for s in skills:
        if s.order_index <= 4:
            # Unit 1 skills completed
            progress = UserSkillProgress(
                user_id=learner.id,
                skill_id=s.id,
                crowns=5,
                lessons_completed=3,
                status="legendary"
            )
        elif s.order_index == 5:
            # First skill of Unit 2: partially done
            progress = UserSkillProgress(
                user_id=learner.id,
                skill_id=s.id,
                crowns=1,
                lessons_completed=1,
                status="available"
            )
        elif s.order_index == 6:
            # Second skill of Unit 2: unlocked because skill 5 has crowns >= 1
            progress = UserSkillProgress(
                user_id=learner.id,
                skill_id=s.id,
                crowns=0,
                lessons_completed=0,
                status="available"
            )
        else:
            # Locked skills
            progress = UserSkillProgress(
                user_id=learner.id,
                skill_id=s.id,
                crowns=0,
                lessons_completed=0,
                status="locked"
            )
        db.add(progress)
    db.commit()

    # 9. Daily activity heatmap data (last 30 days)
    print("Generating activity heatmap data...")
    for d in range(30):
        act_date = today_date - timedelta(days=d)
        # Randomize activity, but make sure today has 20 XP and streak is maintained
        if d == 0:
            xp_earned = 20
            lessons_comp = 2
        else:
            # Keep streak intact (mostly active days)
            is_active = random.random() > 0.15
            xp_earned = random.choice([10, 20, 30, 40]) if is_active else 0
            lessons_comp = xp_earned // 10
            
        activity = DailyActivity(
            user_id=learner.id,
            date=act_date,
            xp_earned=xp_earned,
            lessons_completed=lessons_comp
        )
        db.add(activity)
    db.commit()

    # 10. Leaderboard entries
    # Current week's Monday
    monday = today_date - timedelta(days=today_date.weekday())
    
    # Learner's entry
    db.add(LeaderboardEntry(
        user_id=learner.id,
        league_tier="Ruby",
        week_start=monday,
        weekly_xp=320 # learner weekly xp
    ))
    
    # Mock users entries
    for u, xp in mock_users:
        db.add(LeaderboardEntry(
            user_id=u.id,
            league_tier="Ruby",
            week_start=monday,
            weekly_xp=xp // 3  # Portion of total xp for this week
        ))
    db.commit()

    # 11. User Achievements progress
    # Let's unlock a few achievements for the learner
    # Resolve dynamic achievement IDs (Postgres sequences don't reset automatically on delete)
    db_achievements = db.query(Achievement).all()
    ach_map = {ach.code: ach.id for ach in db_achievements}

    wildfire_id = ach_map.get("wildfire", 1)
    sage_id = ach_map.get("sage", 2)
    sharpshooter_id = ach_map.get("sharpshooter", 5)
    superstar_id = ach_map.get("superstar", 6)

    user_achs = [
        UserAchievement(user_id=learner.id, achievement_id=wildfire_id, tier_reached=2, unlocked_at=datetime.utcnow() - timedelta(days=5)), # Wildfire
        UserAchievement(user_id=learner.id, achievement_id=sage_id, tier_reached=3, unlocked_at=datetime.utcnow() - timedelta(days=2)), # Sage
        UserAchievement(user_id=learner.id, achievement_id=sharpshooter_id, tier_reached=2, unlocked_at=datetime.utcnow() - timedelta(days=1)), # Sharpshooter
        UserAchievement(user_id=learner.id, achievement_id=superstar_id, tier_reached=2, unlocked_at=datetime.utcnow() - timedelta(days=3))  # Superstar
    ]
    db.add_all(user_achs)
    db.commit()

    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_db()
