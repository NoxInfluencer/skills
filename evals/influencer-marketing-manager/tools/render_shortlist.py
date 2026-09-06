#!/usr/bin/env python3
"""Prototype: render a reviewed selection; check structure/arithmetic, not source truth."""

from __future__ import annotations

import html
import json
import re
import sys
from decimal import Decimal
from urllib.parse import urlsplit


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def text(value: object, label: str) -> str:
    require(isinstance(value, str) and bool(value.strip()), f"{label} must be nonempty text")
    return value.strip()


def cell(value: str) -> str:
    escaped = html.escape(value, quote=False)
    escaped = re.sub(r"([\\`*_\[\]|])", r"\\\1", escaped)
    return "<br>".join(escaped.splitlines())


def money(quote: object, creator_id: str) -> tuple[Decimal, str, str] | None:
    if quote is None:
        return None
    require(isinstance(quote, dict), f"{creator_id}: quote must be an object or null")
    amount = quote.get("amount")
    require(isinstance(amount, str) and bool(re.fullmatch(r"\d+(?:\.\d+)?", amount)),
            f"{creator_id}: quote.amount must be a plain nonnegative decimal string")
    currency = quote.get("currency")
    require(isinstance(currency, str) and bool(re.fullmatch(r"[A-Z]{3}", currency)),
            f"{creator_id}: quote.currency must be a three-letter uppercase code")
    return Decimal(amount), currency, text(quote.get("terms"), f"{creator_id}: quote.terms")


def render(document: dict) -> dict:
    require(isinstance(document, dict), "input must be a JSON object")
    target = document.get("target_count")
    require(target is None or (type(target) is int and target > 0), "target_count must be a positive integer or null")
    human_required = document.get("require_human_reply")
    require(type(human_required) is bool, "require_human_reply must state the project rule explicitly")
    columns = document.get("columns")
    require(isinstance(columns, list) and bool(columns), "columns must be a nonempty list")
    for column in columns:
        require(isinstance(column, list) and len(column) == 2, "each column is [key, label]")
        text(column[0], "column key")
        text(column[1], "column label")
    keys = [column[0] for column in columns]
    require(len(keys) == len(set(keys)) and "creator" in keys, "columns need unique keys including creator")

    records = document.get("records")
    require(isinstance(records, list), "records must be a list")
    indexed = {}
    for record in records:
        require(isinstance(record, dict), "each record must be an object")
        creator_id = text(record.get("id"), "record.id")
        require(creator_id not in indexed, f"duplicate record ID: {creator_id}")
        text(record.get("name"), f"{creator_id}: name")
        require(type(record.get("eligible")) is bool, f"{creator_id}: eligible must be an explicit business assessment")
        require(record.get("reply_type") in ("human", "automatic", "none", "unknown"), f"{creator_id}: invalid reply_type")
        indexed[creator_id] = record

    selected = document.get("selected_ids")
    require(isinstance(selected, list) and all(isinstance(item, str) for item in selected), "selected_ids must be a list of IDs")
    require(len(selected) == len(set(selected)), "duplicate selected ID")
    admissible = {key for key, record in indexed.items()
                  if record["eligible"] and (not human_required or record["reply_type"] == "human")}
    require(set(selected) <= admissible, "selected IDs must exist and meet the declared eligibility and reply rules")
    if target is not None:
        require(len(selected) == min(target, len(admissible)), "selection count must match the target or the available admissible pool")

    lines = ["| " + " | ".join(cell(label) for _, label in columns) + " |",
             "| " + " | ".join("---" for _ in columns) + " |"]
    quotes = {}
    unknown_quotes = []
    for creator_id in selected:
        record = indexed[creator_id]
        values = record.get("cells", {})
        require(isinstance(values, dict), f"{creator_id}: cells must be an object")
        require("quote" in record, f"{creator_id}: quote must be explicit; use null when unknown")
        quote = money(record["quote"], creator_id)
        if quote:
            require("quote" in keys, "known quotes must be displayed in a quote column")
            amount, currency, terms = quote
            quotes.setdefault(currency, []).append((creator_id, amount))
            quoted = f"{currency} {amount:,f}; {terms}"
        else:
            unknown_quotes.append(creator_id)
            quoted = text(document.get("unknown_quote_label", "Not quoted"), "unknown_quote_label")
        row = []
        for key in keys:
            if key == "creator":
                name = cell(text(record["name"], f"{creator_id}: name"))
                url = record.get("url")
                if url:
                    require(isinstance(url, str), f"{creator_id}: url must be text")
                    parsed = urlsplit(url)
                    require(parsed.scheme in ("http", "https") and bool(parsed.netloc)
                            and not parsed.username and not re.search(r"[\s<>()|\\]", url), f"{creator_id}: unsafe source URL")
                    name = f"[{name}]({url})"
                row.append(name)
            elif key == "quote":
                row.append(cell(quoted))
            else:
                row.append(cell(text(values.get(key), f"{creator_id}: cells.{key}")))
        lines.append("| " + " | ".join(row) + " |")

    minima = {}
    for currency, items in quotes.items():
        minimum = min(amount for _, amount in items)
        minima[currency] = {"amount": str(minimum), "ids": [key for key, amount in items if amount == minimum]}
    return {
        "validation_scope": "Declared selection, table structure and quote arithmetic only; not source truth or business approval",
        "selected_ids": selected,
        "selected_count": len(selected),
        "target_count": target,
        "shortfall": max(0, target - len(selected)) if target is not None else None,
        "known_quoted_minima_by_currency": minima,
        "unknown_quote_ids": unknown_quotes,
        "markdown": "\n".join(lines),
    }


def main() -> int:
    try:
        result = render(json.load(sys.stdin))
    except (ValueError, TypeError, KeyError) as exc:
        print(f"Shortlist input error: {exc}", file=sys.stderr)
        return 2
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
