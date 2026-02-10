#!/usr/bin/env python3
"""Return the next batch of questions and persist progress state."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def load_questions(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(data, list):
        raise ValueError("Input JSON must be a list of question objects.")
    return data


def load_state(path: Path) -> dict[str, int]:
    if not path.exists():
        return {"next_index": 0}
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    next_index = data.get("next_index", 0)
    if not isinstance(next_index, int) or next_index < 0:
        raise ValueError("State field 'next_index' must be a non-negative integer.")
    return {"next_index": next_index}


def save_state(path: Path, next_index: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {"next_index": next_index}
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, help="Path to collected questions JSON.")
    parser.add_argument(
        "--state",
        required=True,
        help="Path to session state JSON storing next_index.",
    )
    parser.add_argument("--size", type=int, default=10, help="Batch size (default: 10).")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Reset progress to the first batch before slicing.",
    )
    args = parser.parse_args()

    if args.size <= 0:
        raise ValueError("--size must be a positive integer.")

    questions = load_questions(Path(args.input))
    state_path = Path(args.state)
    state = {"next_index": 0} if args.reset else load_state(state_path)
    start = state["next_index"]
    end = min(start + args.size, len(questions))
    batch = questions[start:end]
    save_state(state_path, end)
    print(json.dumps(batch, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
