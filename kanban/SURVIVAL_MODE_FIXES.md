# 🎮 Survival Mode - Critical Gameplay Fixes Required

## ⚠️ Issues Identified During Screenshot Session

### 🕐 **Timer Logic Issues**
**Current Behavior (INCORRECT):**
- Timer resets to full time (90s) after each question
- Timer starts at 90 seconds per question

**Required Behavior (CORRECT):**
- Timer should start at **300 seconds** (5 minutes) for entire game session
- Timer counts down continuously throughout the game
- **Correct answers add time** (e.g., +30 seconds)
- **Wrong answers or timeouts subtract time/lives** but don't reset timer
- Game ends when timer reaches 0 OR all lives lost

### ⚡ **Power-Up Implementation Issues**
**Current Behavior (FIXED):**
- ✅ `time_extension` power-up adds 30 seconds to current timer (works correctly)
- ✅ `time_freeze` power-up freezes timer for 15 seconds using XState patterns
- ✅ Power-up costs properly deducted from score
- ✅ Power-up durations managed with UPDATE_POWERUPS action
- ✅ Continuous timer respects freeze state

**Implemented Power-Up Effects:**
1. ✅ **Time Boost** (`time_extension`): Add 30 seconds to current timer
2. ✅ **Time Freeze** (`freeze`): Pause timer for 15 seconds (timer stops counting)
3. ✅ **Life Restore**: Add 1 life back (up to max)
4. **Hint**: Reveal helpful hint text for current question (pending)
5. **50/50**: Remove 2 incorrect answer choices visually (pending)

### ⚡ **NEW: Streak-Based Multiplier System**
**Implemented Features:**
- ✅ **Streak Multiplier**: Each additional correct answer multiplies by 1.1 (1.1^(streak-1))
- ✅ **Difficulty-Based Scoring**: Base points = 10 + (difficulty-1) × 5 (10-55 points)
- ✅ **Difficulty-Based Time Bonuses**: 
  - Difficulty 1-2: +15 seconds
  - Difficulty 3-4: +20 seconds  
  - Difficulty 5-6: +25 seconds
  - Difficulty 7-8: +30 seconds
  - Difficulty 9: +45 seconds
  - Difficulty 10: +60 seconds
- ✅ **UI Integration**: Streak multiplier displayed next to streak counter
- ✅ **Automatic Reset**: Multiplier resets to 1.0x when streak breaks

### 🔧 **Files Requiring Updates**

#### **Timer Logic:**
- `src/hooks/useSurvivalMode.ts:27` - Change `questionTimeLimit: 90` to `questionTimeLimit: 300`
- `src/hooks/useSurvivalMode.ts:150-160` - Fix timer reset logic in `ANSWER_QUESTION` case
- `src/hooks/useSurvivalMode.ts:163-175` - Remove timer reset on question load

#### **Power-Up Effects:**
- `src/hooks/useSurvivalMode.ts:177-200` - Fix `ACTIVATE_POWERUP` case implementation
- Add proper timer manipulation for `time_extension` and `freeze`
- Add visual effects for `fifty_fifty` and `hint`
- Add life restoration logic for `life_restore`
- Add multiplier duration tracking for `multiplier`

### 🎯 **Core Game Flow Should Be:**
1. Game starts with 300-second timer
2. Player answers questions as timer counts down
3. Correct answers: +points, +time bonus, continue
4. Wrong answers: -1 life, timer continues counting
5. Power-ups provide real tactical advantages
6. Game ends when timer hits 0 OR lives = 0

### 🎨 **UI Formatting Issues**
**Current Behavior (BROKEN):**
- Power-up button text overflows containers
- Button heights inconsistent
- Text wrapping not properly handled

**Required Behavior (FIXED):**
- ✅ Button text properly contained within boundaries
- ✅ Single column layout with full-width buttons 
- ✅ Complete text visibility (no truncation)
- ✅ Added power-up descriptions for better UX
- ✅ Horizontal layout: icon/name/description on left, cost/status on right
- ✅ Fixed button dimensions (64px height) with vertical centering
- ✅ Replaced "Need X more" text with small red lock badge in top-right corner

### 🎯 **Timer Logic Issues**
**Current Behavior (FIXED):**
- ✅ Timer now starts at **300 seconds** (5 minutes) for entire game session
- ✅ Timer counts down continuously throughout the game
- ✅ **Correct answers add +30 seconds** to timer
- ✅ Game ends when timer reaches 0 OR all lives lost
- ✅ No timer resets between questions

### 📝 **Implementation Priority:**
1. ✅ **COMPLETED**: Fix timer logic (continuous countdown, no resets)
2. ✅ **COMPLETED**: Fix power-up effects (time_extension, freeze)
3. ✅ **COMPLETED**: Implement streak-based multiplier system with difficulty scaling
4. ✅ **COMPLETED**: Remove multiplier power-up and update UI
5. ✅ **COMPLETED**: Fix power-up button text formatting issues
6. **MEDIUM**: Implement remaining power-up effects (hint, 50/50)

---
**Status**: Screenshots captured successfully, but gameplay mechanics need refinement for proper survival game experience.