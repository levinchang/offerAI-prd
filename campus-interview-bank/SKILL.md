---
name: campus-interview-bank
description: Build campus recruiting interview banks for a target company and non-technical role. Use when the user provides company plus role and needs campus-only role discovery from official campus pages, web collection of at least 60 campus interview questions, categorized question sets, fresh-graduate sample answers with interviewer-focus analysis, batched delivery in groups of 10 questions, and Feishu-ready structured output.
---

# Campus Interview Bank

## Overview

Create a complete campus interview preparation bank for a specific company and non-technical role.
Keep the workflow campus-only, produce at least 60 unique questions, answer in 10-question batches when needed, and output in Feishu-ready Markdown.

## Workflow

1. Confirm input scope.
- Read company name and target role from the user.
- Confirm the role is non-technical and campus recruiting related.
- If the requested role is technical or unclear, map it to the closest non-technical campus role and state the mapping explicitly.

2. Identify official campus recruiting roles.
- Browse the company's official campus recruiting site first.
- Accept fallback official channels only when campus site is unavailable (official HR WeChat, official career portal, official graduate program pages).
- Keep evidence for each role source: URL, page title, publish date (if available), and why it is campus recruiting.
- Keep only non-technical popular roles relevant to campus recruiting.

3. Collect campus interview questions from the web.
- Search campus interview experiences and question-sharing posts for the chosen role.
- Include only campus recruiting evidence; exclude social hiring and experienced-hire content.
- Gather at least 60 unique questions.
- Track source URL and source date for each question.
- Normalize wording and deduplicate near-duplicate questions.

4. Classify questions.
- Group questions into clear categories, for example:
  - Motivation and role fit
  - Resume deep dive
  - Behavioral competency
  - Business and industry awareness
  - Scenario and problem solving
  - Group interview and case style
  - Career planning and offer decision
- Keep the taxonomy stable for the full output.

5. Answer questions as a fresh graduate candidate.
- For each question, provide:
  - Sample answer in candidate voice
  - What interviewer evaluates
  - Key answering points
  - Common mistakes to avoid
- Keep answers realistic for entry-level campus candidates.
- If output length is too large, answer only 10 questions per response and continue in order until all questions are completed.
- Use `scripts/chunk_questions.py` to enforce deterministic 10-question batches.

6. Generate Feishu-ready document content.
- Use `scripts/build_feishu_markdown.py` to convert answered question JSON into a structured Markdown document.
- Use this heading structure:
  - Level-1 heading: question type/category
  - Level-2 heading: numbered question text
- Include sequence numbers for every question.
- Follow template rules in `references/feishu_markdown_template.md`.

7. Run quality gates before finalizing.
- Confirm total question count is 60 or more.
- Confirm all questions are campus recruiting scope.
- Confirm every question has at least one source URL.
- Confirm numbering is continuous and categories are consistent.
- Confirm no unanswered questions remain.

## Operating Rules

- Prefer primary and official sources for role discovery.
- Treat role popularity claims as evidence-backed; do not invent popularity metrics.
- Keep claim dates explicit when available.
- When source quality is mixed, prioritize official pages and high-signal interview reports.
- Keep question wording concise and interview-ready.

## Data Contracts

- Use schemas in `references/data_schema.md`.
- Keep question collection in a JSON file before answer generation.
- Keep answered results in a JSON file before Feishu Markdown generation.

## Command Shortcuts

- Next 10 questions:
  - `python scripts/chunk_questions.py --input data/questions.json --state data/session_state.json --size 10`
- Reset batch progress:
  - `python scripts/chunk_questions.py --input data/questions.json --state data/session_state.json --size 10 --reset`
- Build Feishu Markdown:
  - `python scripts/build_feishu_markdown.py --input data/answered_questions.json --output data/feishu_doc.md`

## Resources

- `references/data_schema.md`: JSON schema expectations for collected and answered question datasets.
- `references/feishu_markdown_template.md`: final Markdown format rules for Feishu docs.
- `scripts/chunk_questions.py`: deterministic 10-question batch progression.
- `scripts/build_feishu_markdown.py`: convert answered JSON to Feishu-ready Markdown grouped by category.
