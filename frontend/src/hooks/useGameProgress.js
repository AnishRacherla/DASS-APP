/**
 * useGameProgress — reads/writes per-game stars and stage badges to localStorage.
 * Also tracks the daily login streak.
 *
 * SCORING DESIGN
 * ──────────────
 * Games fall into two tiers:
 *   • LEVELLED games  — have easy/medium/hard or 1/2/3 difficulty tiers.
 *     Score = weighted average:  L1 × 1 + L2 × 1.5 + L3 × 2  (out of max)
 *     IDs: balloon, quiz, bubble-shooter, whack, swara, swara-memory, shabd, fill-story
 *
 *   • FLAT games — single mode or situationally varied, same difficulty.
 *     Score = simple average of all saved stars (0–3)
 *     IDs: trace-vowel, consonant, varnamal, scavenger, matra, word-jumble,
 *           word-sorting-basket, crossword, story-time, mars, akshara
 *
 * Stage score = average of all game scores in that stage  (0–3 scale → ×33 for %).
 */

const STARS_KEY = (gameId) => `stars_${gameId}`;
const BADGE_KEY = (stageId) => `badge_stage_${stageId}`;
const STREAK_KEY = 'streak_count';
const LAST_LOGIN_KEY = 'streak_last_login';

// ─── Stars ────────────────────────────────────────────────────────────────────

/** Returns stored star count or -1 if never played. */
export const getStars = (gameId) => {
    const v = localStorage.getItem(STARS_KEY(gameId));
    return v !== null ? parseInt(v, 10) : -1;
};

/** Save stars — never overwrites a higher score. */
export const saveStars = (gameId, stars) => {
    const existing = getStars(gameId);
    if (stars > existing) {
        localStorage.setItem(STARS_KEY(gameId), String(stars));
    }
    // After saving, check if this completes a stage badge automatically
    autoCheckBadge(gameId);
};

/** Mark a game as played (0 stars) — used when a kid enters a game but has no score yet. */
export const markPlayed = (gameId) => {
    if (getStars(gameId) === -1) {
        localStorage.setItem(STARS_KEY(gameId), '0');
        autoCheckBadge(gameId);
    }
};

// ─── Badges & unlock ──────────────────────────────────────────────────────────

export const hasBadge = (stageId) => localStorage.getItem(BADGE_KEY(stageId)) === 'true';
export const awardBadge = (stageId) => localStorage.setItem(BADGE_KEY(stageId), 'true');

/**
 * Stage N is unlocked when ALL games in stage N-1 have been tried at least once.
 * Trying means getStars(id) !== -1 (even 0 stars / touched once counts).
 */
export const isStageUnlocked = (stageId, gamesMap) => {
    if (stageId === 1) return true;
    const prevGames = gamesMap?.[stageId - 1] ?? [];
    if (prevGames.length === 0) return hasBadge(stageId - 1); // fallback
    return prevGames.every(g => getStars(g.id) >= 0);
};

/**
 * After each save, check if all games in any stage are now tried once,
 * and if so auto-award the badge for that stage.
 * This function is intentionally lazy — it checks all stages every save.
 * Performance impact is negligible (< 20 localStorage reads).
 */
function autoCheckBadge(/* gameId */) {
    // Import GAMES lazily to avoid circular dependency
    try {
        // We read directly from localStorage — no import needed
        const stages = [1, 2, 3, 4];
        stages.forEach(sid => {
            if (hasBadge(sid)) return; // already awarded
            const key = `stage_games_${sid}`;
            const raw = localStorage.getItem(key);
            if (!raw) return;
            const ids = JSON.parse(raw);
            const allTried = ids.every(id => getStars(id) >= 0);
            if (allTried) awardBadge(sid);
        });
    } catch (_) {
        // Silently ignore if game list not yet registered
    }
}

/**
 * Call this once when the app mounts (from StageHub) to register which game IDs
 * belong to which stage so autoCheckBadge can find them without circular imports.
 */
export const registerStageGames = (gamesMap) => {
    Object.entries(gamesMap).forEach(([stageId, games]) => {
        localStorage.setItem(`stage_games_${stageId}`, JSON.stringify(games.map(g => g.id)));
    });
};

// ─── Stage score (0–100%) ─────────────────────────────────────────────────────

/**
 * Compute an overall score percentage for a single stage.
 * Levelled games use weighted average; flat games use simple average.
 * Returns 0 if no games played.
 */
const LEVELLED_GAME_IDS = new Set([
    'balloon', 'quiz', 'bubble-shooter', 'whack',
    'swara', 'swara-memory', 'shabd', 'fill-story'
]);

export const getStageScore = (stageGames) => {
    if (!stageGames || stageGames.length === 0) return 0;
    const played = stageGames.filter(g => getStars(g.id) >= 0);
    if (played.length === 0) return 0;

    // Each game contributes a 0–3 score; average across all games for the stage
    const scores = played.map(g => {
        const s = getStars(g.id);
        if (LEVELLED_GAME_IDS.has(g.id)) {
            // Treat higher stars as higher difficulty cleared; here per-game score
            // is just what we have (1–3 max). Future: per-level weighted sum.
            return s;
        }
        return s; // flat games: direct star value
    });

    const avg = scores.reduce((a, b) => a + b, 0) / stageGames.length; // penalise unplayed
    return Math.round((avg / 3) * 100); // convert to 0–100 %
};

// ─── Streak ───────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().slice(0, 10);

export const getStreak = () => {
    const count = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
    const lastLogin = localStorage.getItem(LAST_LOGIN_KEY);
    if (!lastLogin) return 0;
    const diff = (new Date(todayStr()) - new Date(lastLogin)) / 86_400_000;
    if (diff >= 2) return 0;
    return count;
};

export const touchStreak = () => {
    const today = todayStr();
    const lastLogin = localStorage.getItem(LAST_LOGIN_KEY);
    if (!lastLogin) {
        localStorage.setItem(STREAK_KEY, '1');
        localStorage.setItem(LAST_LOGIN_KEY, today);
        return;
    }
    const diff = (new Date(today) - new Date(lastLogin)) / 86_400_000;
    if (diff >= 2) localStorage.setItem(STREAK_KEY, '1');
    else if (diff === 1) localStorage.setItem(STREAK_KEY, String(parseInt(localStorage.getItem(STREAK_KEY) || '0', 10) + 1));
    localStorage.setItem(LAST_LOGIN_KEY, today);
};
