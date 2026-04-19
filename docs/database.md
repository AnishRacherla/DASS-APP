# Database Schema

**Database:** MongoDB (via Mongoose ODM)

---

## Collections Overview

| Collection   | Model     | Purpose                                      |
| ------------ | --------- | -------------------------------------------- |
| `users`      | User      | Child profiles (name, age, language)         |
| `games`      | Game      | All game content (balloon, whack, etc.)      |
| `quizzes`    | Quiz      | Planet-based quiz questions with audio       |
| `marsgames`  | MarsGame  | Mars word-to-image matching game             |
| `lessons`    | Lesson    | Word flashcards with image & audio           |
| `scores`     | Score     | Per-session score records for every game     |
| `progresses` | Progress  | Per-user cumulative progress per language    |

---

## Entity-Relationship Diagram (text)

```
User  ──1:N──▶  Score
User  ──1:N──▶  Progress

Game   (standalone – referenced by gameId in Score)
Quiz   (standalone – referenced by _id in Score.quizId)
MarsGame (standalone)
Lesson   (standalone)
```

---

## 1. `users`

| Field        | Type     | Constraints                       |
| ------------ | -------- | --------------------------------- |
| `_id`        | ObjectId | Auto-generated primary key        |
| `name`       | String   | Required, trimmed                 |
| `age`        | Number   | Required, min: 3, max: 8          |
| `language`   | String   | Required, enum: `hindi`, `telugu` |
| `createdAt`  | Date     | Default: now                      |
| `lastActive` | Date     | Default: now                      |

---

## 2. `games`

Unified collection for **all mini-games** (balloon, whack, memory, spelling, etc.).

| Field                     | Type     | Constraints / Notes                                                      |
| ------------------------- | -------- | ------------------------------------------------------------------------ |
| `_id`                     | ObjectId | Auto PK                                                                  |
| `gameType`                | String   | Required, enum: `quiz`, `balloon`, `memory`, `spelling`, `story`, `tracing`, `whack` |
| `gameId`                  | String   | Required, **unique** (e.g. `whack-hindi-3`)                             |
| `title`                   | String   | Required                                                                 |
| `description`             | String   | Optional                                                                 |
| `language`                | String   | Required, enum: `hindi`, `telugu`, `english`                             |
| `level`                   | Number   | Required, min: 1                                                         |
| `difficulty`              | String   | Enum: `easy`, `medium`, `hard` (default `easy`)                          |
| `gameData`                | Mixed    | **Flexible** – shape depends on `gameType` (see below)                   |
| `config.timeLimit`        | Number   | Seconds, 0 = no limit                                                    |
| `config.pointsPerCorrect` | Number  | Default: 10                                                              |
| `config.pointsPerIncorrect` | Number | Default: −5                                                             |
| `config.numberOfRounds`   | Number   | Default: 5                                                               |
| `config.speed`            | String   | Enum: `slow`, `medium`, `fast`                                           |
| `assets.images[]`         | Array    | `{ name, url }`                                                          |
| `assets.audio[]`          | Array    | `{ name, url, data (Buffer), contentType }`                              |
| `assets.videos[]`         | Array    | `{ name, url }`                                                          |
| `isActive`                | Boolean  | Default: true                                                            |
| `createdAt`               | Date     | Default: now                                                             |
| `updatedAt`               | Date     | Auto-updated on save                                                     |

### `gameData` shapes by type

| gameType   | gameData structure                                                               |
| ---------- | -------------------------------------------------------------------------------- |
| `balloon`  | `{ rounds: [{ targetLetter, letters: [{ letter, isCorrect }] }] }`              |
| `whack`    | `{ targetLetter, allLetters: [String] }` — 9-letter pool for the 3×3 grid       |
| `quiz`     | `{ questions: [...] }` (alternative to the Quiz collection)                      |
| `memory`   | Card pairs (TBD)                                                                 |
| `spelling` | Words to spell (TBD)                                                             |

---

## 3. `quizzes`

Planet-based audio quizzes.

| Field                          | Type     | Constraints                       |
| ------------------------------ | -------- | --------------------------------- |
| `_id`                          | ObjectId | Auto PK                           |
| `language`                     | String   | Required, enum: `hindi`, `telugu` |
| `level`                        | Number   | Required, min: 1                  |
| `planetName`                   | String   | Required                          |
| `questions[]`                  | Array    | Embedded sub-documents            |
| `questions[].questionId`       | Number   | Required                          |
| `questions[].audioText`        | String   | Required – text hint of the audio |
| `questions[].audioFileName`    | String   | Required                          |
| `questions[].audioData`        | Buffer   | Raw audio bytes (optional)        |
| `questions[].audioContentType` | String   | Default: `audio/mpeg`             |
| `questions[].correctAnswer`    | String   | Required                          |
| `questions[].options[]`        | [String] | Required – answer choices         |
| `questions[].difficulty`       | String   | Enum: `easy`, `medium`, `hard`    |
| `createdAt`                    | Date     | Default: now                      |

---

## 4. `marsgames`

Word-to-image matching game.

| Field                              | Type     | Constraints                       |
| ---------------------------------- | -------- | --------------------------------- |
| `_id`                              | ObjectId | Auto PK                           |
| `language`                         | String   | Required, enum: `hindi`, `telugu` |
| `level`                            | Number   | Required                          |
| `title`                            | String   | Required                          |
| `description`                      | String   | Optional                          |
| `questions[]`                      | Array    | Embedded sub-documents            |
| `questions[].word`                 | String   | Required – the word to match      |
| `questions[].audioUrl`             | String   | Optional                          |
| `questions[].images[]`             | [String] | Required – image URLs/paths       |
| `questions[].correctImageIndex`    | Number   | Required – 0-based index          |
| `isActive`                         | Boolean  | Default: true                     |
| `createdAt`                        | Date     | Default: now                      |

---

## 5. `lessons`

Vocabulary flashcards.

| Field       | Type     | Constraints                       |
| ----------- | -------- | --------------------------------- |
| `_id`       | ObjectId | Auto PK                           |
| `language`  | String   | Required, enum: `hindi`, `telugu` |
| `word`      | String   | Required                          |
| `imageUrl`  | String   | Required                          |
| `audioUrl`  | String   | Optional                          |
| `order`     | Number   | Required – display order          |
| `createdAt` | Date     | Default: now                      |

---

## 6. `scores`

One document per completed game session.

| Field              | Type     | Constraints / Notes                                                      |
| ------------------ | -------- | ------------------------------------------------------------------------ |
| `_id`              | ObjectId | Auto PK                                                                  |
| `userId`           | ObjectId | **Ref → User**, required                                                 |
| `gameType`         | String   | Enum: `quiz`, `balloon`, `mars`, `memory`, `spelling`, `story`, `tracing`, `whack` |
| `gameId`           | String   | Optional – matches `Game.gameId`                                         |
| `quizId`           | ObjectId | Optional – **Ref → Quiz**                                               |
| `language`         | String   | Required, enum: `hindi`, `telugu`, `english`                             |
| `level`            | Number   | Required                                                                 |
| `score`            | Number   | Required, min: 0                                                         |
| `correctAnswers`   | Number   | Default: 0                                                               |
| `totalQuestions`   | Number   | Default: 5                                                               |
| `timeTaken`        | Number   | Seconds, default: 0                                                      |
| `completedAt`      | Date     | Default: now                                                             |
| `answers[]`        | Array    | Optional embedded detail                                                 |
| `answers[].questionId`     | Number  |                                                                |
| `answers[].selectedAnswer` | String  |                                                                |
| `answers[].isCorrect`      | Boolean |                                                                |
| `answers[].timeTaken`      | Number  |                                                                |

---

## 7. `progresses`

Aggregated per-user, per-language progress.

| Field              | Type     | Constraints                       |
| ------------------ | -------- | --------------------------------- |
| `_id`              | ObjectId | Auto PK                           |
| `userId`           | ObjectId | **Ref → User**, required          |
| `language`         | String   | Required, enum: `hindi`, `telugu` |
| `currentLevel`     | Number   | Default: 1, min: 1                |
| `totalScore`       | Number   | Default: 0                        |
| `quizzesCompleted` | Number   | Default: 0                        |
| `updatedAt`        | Date     | Default: now                      |

---

## Indexes

| Collection | Index                                  | Type   |
| ---------- | -------------------------------------- | ------ |
| `games`    | `gameId`                               | Unique |
| `users`    | `_id` (default)                        | Unique |
| `scores`   | `userId` + `gameType` (implicit query) | —      |

---

## Notes

- **MongoDB** is used as the primary (and only) datastore.
- All `_id` fields are auto-generated `ObjectId`s.
- The `Game` collection uses a **polymorphic `gameData` (Mixed)** field — its shape varies by `gameType`.
- Audio can be stored either as **binary blobs** (`Buffer` in Quiz/Game assets) or as **URL references** to static files served from `backend/assets/audio/`.
- Images follow the same pattern — binary or URL references under `backend/assets/images/`.
