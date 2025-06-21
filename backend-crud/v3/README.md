# StudyAid Backend API Documentation

## Overview
This backend powers the StudyAid application, providing endpoints for user management, collections, highlights, summaries, quizzes, and AI-powered features. It is built with Flask, SQLAlchemy, and integrates with an AI service for generating summaries and quizzes.

---

## Table of Contents
- [Authentication](#authentication)
- [User Endpoints](#user-endpoints)
- [Collection Endpoints](#collection-endpoints)
- [Highlight Endpoints](#highlight-endpoints)
- [Summary Endpoints](#summary-endpoints)
- [Quiz Endpoints](#quiz-endpoints)
- [Quiz Attempt Endpoints](#quiz-attempt-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Database Schema](#database-schema)
- [AI Services](#ai-services)
  - [Summary Generation Prompt](#summary-generation-prompt)
  - [Quiz Generation Prompt & Format](#quiz-generation-prompt--format)

---

## Authentication
All endpoints (except registration and login) require JWT authentication. Obtain a token via `/auth/login` and include it in the `Authorization: Bearer <token>` header.

---

## User Endpoints
- `POST /auth/register` — Register a new user
- `POST /auth/login` — Login and receive JWT token
- `GET /users/me` — Get current user profile
- `PUT /users/me` — Update current user profile
- `DELETE /users/me` — Delete current user

---

## Collection Endpoints
- `POST /collections` — Create a new collection
- `GET /collections` — List all collections for the user
- `GET /collections/<collection_id>` — Get a specific collection
- `PUT /collections/<collection_id>` — Update a collection
- `DELETE /collections/<collection_id>` — Delete a collection
- `POST /collections/<collection_id>/collaborators` — Add a collaborator
- `DELETE /collections/<collection_id>/collaborators/<user_id>` — Remove a collaborator

---

## Highlight Endpoints
- `POST /highlights` — Add a highlight to a collection
- `GET /highlights` — List all highlights for the user
- `GET /highlights/<highlight_id>` — Get a specific highlight
- `PUT /highlights/<highlight_id>` — Update a highlight
- `DELETE /highlights/<highlight_id>` — Delete a highlight

---

## Summary Endpoints
- `POST /summaries` — Create a summary for a collection (AI-powered)
- `GET /summaries` — List all summaries for the user
- `GET /summaries/<summary_id>` — Get a specific summary
- `PUT /summaries/<summary_id>` — Update a summary
- `DELETE /summaries/<summary_id>` — Delete a summary
- `POST /summaries/<summary_id>/regenerate` — Regenerate a summary with AI
- `GET /collections/<collection_id>/summaries` — List all summaries for a collection

---

## Quiz Endpoints
- `POST /quizzes` — Generate a quiz for a summary (AI-powered)
- `GET /quizzes/<quiz_id>` — Get a specific quiz
- `PUT /quizzes/<quiz_id>` — Update a quiz
- `DELETE /quizzes/<quiz_id>` — Delete a quiz
- `POST /quizzes/<quiz_id>/regenerate` — Regenerate a quiz with AI
- `GET /summaries/<summary_id>/quiz` — Get the quiz for a summary

---

## Quiz Attempt Endpoints
- `POST /quizzes/<quiz_id>/attempt` — Submit a quiz attempt
- `GET /quizzes/<quiz_id>/attempts` — List all attempts for a quiz (admin/owner)
- `GET /quizzes/<quiz_id>/attempts/me` — Get the current user's attempt for a quiz

---

## Admin Endpoints
- `GET /admin/users` — List all users
- `GET /admin/collections` — List all collections
- `GET /admin/summaries` — List all summaries
- `GET /admin/quizzes` — List all quizzes
- `GET /admin/highlights` — List all highlights
- `DELETE /admin/users/<user_id>` — Delete a user
- `DELETE /admin/collections/<collection_id>` — Delete a collection
- `DELETE /admin/summaries/<summary_id>` — Delete a summary
- `DELETE /admin/quizzes/<quiz_id>` — Delete a quiz
- `DELETE /admin/highlights/<highlight_id>` — Delete a highlight

---

## Database Schema

### User
- `id` (UUID, PK)
- `email` (string, unique)
- `password_hash` (string)
- `is_admin` (bool)
- ...

### Collection
- `id` (UUID, PK)
- `title` (string)
- `user_id` (FK to User)
- ...

### Highlight
- `id` (UUID, PK)
- `text` (string)
- `url` (string, optional)
- `collection_id` (FK to Collection)
- ...

### Summary
- `id` (UUID, PK)
- `content` (text)
- `timestamp` (datetime)
- `collection_id` (FK to Collection)
- `user_id` (FK to User)
- ...
- **Many-to-many:** Highlights (via `summary_highlights` table)

### Quiz
- `id` (UUID, PK)
- `title` (string)
- `questions` (JSON array)
- `timestamp` (datetime)
- `summary_id` (FK to Summary, unique)

### QuizAttempt
- `id` (UUID, PK)
- `quiz_id` (FK to Quiz)
- `user_id` (FK to User)
- `answers` (JSON array)
- `score` (int)
- `total_questions` (int)
- `percentage` (int)

### summary_highlights (Join Table)
- `summary_id` (FK to Summary)
- `highlight_id` (FK to Highlight)

---

## AI Services

### Summary Generation Prompt
The AI is prompted as follows to generate summaries:

```
You are an expert content summarizer.

Given a list of key highlights selected by a user from various texts or articles, generate a **clear, concise, and informative summary**. The summary should capture the main ideas, insights, and any essential details presented in the highlights.

**Instructions:**
- Summarize only the information provided in the highlights.
- Do not add external knowledge.
- Use clear and professional language.
- Focus on conveying the main points without redundancy.

**Highlights:**
- <list of highlights>

**Output:**
A well-structured summary based on the above highlights:
```

### Quiz Generation Prompt & Format
The AI is prompted as follows to generate quizzes:

```
You are a professional quiz generator.

Your task is to create a multiple-choice quiz based on the provided summary.

Follow these strict rules:
1. Generate exactly 4 unique and non-redundant questions strictly related to the summary.
2. Each question must have only one correct answer.
3. Each question must contain 4 distinct answer options labeled "A", "B", "C", and "D".
4. The correct answer label ("A", "B", "C", or "D") must be randomly assigned for each question.
5. Avoid repeating or rephrasing the same question in any way.
6. Return only a valid JSON array in the following format — no explanations, no extra text:

[
    {
        "question": "First unique question?",
        "options": {
            "A": "Option text",
            "B": "Option text",
            "C": "Option text",
            "D": "Option text"
        },
        "correct_answer": "A"
    },
    ...
]

==== Summary ====
<summary>
```

#### Quiz JSON Format (API Response)
```json
{
  "title": "Quiz based on the summary",
  "questions": [
    {
      "question": "...",
      "options": {
        "A": "...",
        "B": "...",
        "C": "...",
        "D": "..."
      },
      "correct_answer": "A"
    },
    ...
  ]
}
```

---

## Notes
- All endpoints require JWT authentication unless otherwise specified.
- Only collection owners or collaborators can access certain resources.
- Admin endpoints require an admin user.
- The AI service will fall back to static content if the AI is unavailable.

---

## Contact
For questions or support, please contact the StudyAid backend team. 