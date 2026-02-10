#!/usr/bin/env python3
"""Convert answered interview questions JSON into Feishu-ready Markdown."""

from __future__ import annotations

import argparse
import json
from collections import OrderedDict
from pathlib import Path
from typing import Any


def load_items(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(data, list):
        raise ValueError("Input JSON must be a list.")
    return data


def as_lines(items: list[dict[str, Any]]) -> list[str]:
    grouped: "OrderedDict[str, list[dict[str, Any]]]" = OrderedDict()
    for idx, item in enumerate(items, start=1):
        category = str(item.get("category", "Uncategorized")).strip() or "Uncategorized"
        if category not in grouped:
            grouped[category] = []
        row = dict(item)
        row["_serial"] = item.get("id", idx)
        grouped[category].append(row)

    lines: list[str] = []
    for category, rows in grouped.items():
        lines.append(f"# {category}")
        lines.append("")
        for row in rows:
            serial = row["_serial"]
            question = str(row.get("question", "")).strip()
            answer = str(row.get("sample_answer", "")).strip()
            intent = str(row.get("interviewer_focus", "")).strip()
            key_points = row.get("key_points", [])
            pitfalls = str(row.get("common_mistakes", "")).strip()
            source = str(row.get("source", "")).strip()

            lines.append(f"## {serial}. {question}")
            lines.append("")
            lines.append("**Sample answer (fresh graduate)**")
            lines.append(answer or "TBD")
            lines.append("")
            lines.append("**What interviewer evaluates**")
            lines.append(intent or "TBD")
            lines.append("")
            lines.append("**Key points**")
            if isinstance(key_points, list) and key_points:
                for point in key_points:
                    lines.append(f"- {point}")
            elif isinstance(key_points, str) and key_points.strip():
                lines.append(f"- {key_points.strip()}")
            else:
                lines.append("- TBD")
            lines.append("")
            lines.append("**Common mistakes**")
            lines.append(pitfalls or "TBD")
            lines.append("")
            lines.append("**Campus source**")
            lines.append(source or "TBD")
            lines.append("")
        lines.append("")
    return lines


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, help="Answered questions JSON path.")
    parser.add_argument("--output", required=True, help="Markdown output path.")
    args = parser.parse_args()

    items = load_items(Path(args.input))
    lines = as_lines(items)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
