# Data Schema

Use these JSON structures for deterministic workflow handoff.

## 1) Collected questions (`questions.json`)

```json
[
  {
    "id": 1,
    "category": "Behavioral competency",
    "question": "Describe a time when you handled a conflict in a team.",
    "role": "Management trainee",
    "company": "Example Corp",
    "campus_evidence": "Source states graduate recruitment for class of 2026.",
    "source": "https://example.com/interview-post-1",
    "source_date": "2025-10-03"
  }
]
```

Required fields:
- `id` (int): stable sequence id.
- `category` (string): chosen taxonomy bucket.
- `question` (string): normalized interview question.
- `source` (string): URL that supports this question.
- `campus_evidence` (string): why the source is campus recruiting scope.

## 2) Answered questions (`answered_questions.json`)

```json
[
  {
    "id": 1,
    "category": "Behavioral competency",
    "question": "Describe a time when you handled a conflict in a team.",
    "sample_answer": "As a final-year student...",
    "interviewer_focus": "Conflict handling, ownership, communication.",
    "key_points": [
      "Use STAR structure",
      "Quantify outcome",
      "Show reflection"
    ],
    "common_mistakes": "Blaming teammates and missing personal ownership.",
    "source": "https://example.com/interview-post-1"
  }
]
```

Required fields:
- `id`, `category`, `question`
- `sample_answer`
- `interviewer_focus`
- `key_points`
- `common_mistakes`
- `source`
