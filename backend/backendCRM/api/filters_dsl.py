"""Recursive filter DSL — converts a JSON AST into a Django Q object.

Used by the Advanced Filter Builder UI and by DistributionRule.match_filter.

AST shape::

    {
      "op": "AND",            # AND | OR | NOT
      "children": [
        {"field": "status",  "op": "equals",   "value": "NEW"},
        {"field": "score",   "op": "between",  "value": [40, 80]},
        {
          "op": "OR",
          "children": [
            {"field": "city",     "op": "in",       "value": ["Pune", "Mumbai"]},
            {"field": "tags",     "op": "contains", "value": "vip"},
          ],
        },
      ],
    }

Supported leaf operators::

    equals, not_equals, contains, icontains,
    gt, gte, lt, lte, between,
    is_empty, not_empty,
    in, not_in,
    starts_with, ends_with

Whitelist of fields per module prevents users probing private columns.
"""

from __future__ import annotations

from django.db.models import Q


# Per-module field whitelist. Keep this conservative — any field listed here
# is queryable from the public Filter Builder UI.
FIELD_WHITELIST = {
    "lead": {
        "id", "name", "email", "phone", "city", "state", "pincode",
        "status", "score", "priority", "leads_source",
        "product_name", "product_category", "brand_name",
        "base_price", "tags", "assigned_to", "created_at", "updated_at",
        "last_activity_at",
    },
    "deal": {
        "id", "status", "deal_value", "cost_price", "expected_close_date",
        "assigned_to", "created_at", "updated_at",
    },
    "task": {
        "id", "title", "status", "priority", "assigned_to", "due_date",
        "created_at", "updated_at",
    },
    "customer": {
        "id", "name", "email", "phone", "city", "state", "status",
        "tags", "assigned_to", "created_at", "updated_at",
    },
}


class FilterError(ValueError):
    """Raised when the AST is invalid — bubbles up to a 400 response."""


def _leaf_to_q(node: dict, allowed_fields: set[str]) -> Q:
    field = node.get("field")
    op = (node.get("op") or "equals").lower()
    value = node.get("value")

    if not field:
        raise FilterError("Filter leaf is missing 'field'.")
    if field not in allowed_fields:
        raise FilterError(f"Field '{field}' is not queryable for this module.")

    if op == "equals":
        return Q(**{field: value})
    if op == "not_equals":
        return ~Q(**{field: value})
    if op in ("contains", "icontains"):
        return Q(**{f"{field}__icontains": value})
    if op == "starts_with":
        return Q(**{f"{field}__istartswith": value})
    if op == "ends_with":
        return Q(**{f"{field}__iendswith": value})
    if op == "gt":
        return Q(**{f"{field}__gt": value})
    if op == "gte":
        return Q(**{f"{field}__gte": value})
    if op == "lt":
        return Q(**{f"{field}__lt": value})
    if op == "lte":
        return Q(**{f"{field}__lte": value})
    if op == "between":
        if not isinstance(value, (list, tuple)) or len(value) != 2:
            raise FilterError("'between' expects a 2-element [low, high] list.")
        return Q(**{f"{field}__gte": value[0], f"{field}__lte": value[1]})
    if op == "in":
        if not isinstance(value, (list, tuple)):
            raise FilterError("'in' expects a list of values.")
        return Q(**{f"{field}__in": list(value)})
    if op == "not_in":
        if not isinstance(value, (list, tuple)):
            raise FilterError("'not_in' expects a list of values.")
        return ~Q(**{f"{field}__in": list(value)})
    if op == "is_empty":
        return Q(**{f"{field}__isnull": True}) | Q(**{field: ""})
    if op == "not_empty":
        return ~(Q(**{f"{field}__isnull": True}) | Q(**{field: ""}))

    raise FilterError(f"Unsupported operator '{op}'.")


def ast_to_q(ast: dict | None, module: str) -> Q:
    """Convert an AST dict to a Q object. Empty/None AST returns Q() (no filter)."""
    if not ast:
        return Q()

    allowed = FIELD_WHITELIST.get(module)
    if allowed is None:
        raise FilterError(f"Unknown module '{module}'.")

    return _node_to_q(ast, allowed)


def _node_to_q(node: dict, allowed: set[str]) -> Q:
    if not isinstance(node, dict):
        raise FilterError("Filter node must be a JSON object.")

    op = (node.get("op") or "equals").lower()

    # Group operators
    if op in ("and", "or", "not"):
        children = node.get("children") or []
        if not isinstance(children, list) or not children:
            return Q()
        parts = [_node_to_q(c, allowed) for c in children]
        if op == "and":
            combined = parts[0]
            for p in parts[1:]:
                combined &= p
            return combined
        if op == "or":
            combined = parts[0]
            for p in parts[1:]:
                combined |= p
            return combined
        # NOT — invert the AND of children.
        combined = parts[0]
        for p in parts[1:]:
            combined &= p
        return ~combined

    # Otherwise treat as leaf.
    return _leaf_to_q(node, allowed)


def supported_operators_for_field(field: str, module: str) -> list[str]:
    """Suggest which operators make sense for a given field (used by the UI)."""
    # Simple heuristic — refine when we add field type metadata.
    numeric = {"score", "base_price", "deal_value", "cost_price"}
    date = {"created_at", "updated_at", "last_activity_at", "expected_close_date", "due_date"}
    if field in numeric:
        return ["equals", "not_equals", "gt", "gte", "lt", "lte", "between", "is_empty", "not_empty"]
    if field in date:
        return ["equals", "gt", "gte", "lt", "lte", "between"]
    return [
        "equals", "not_equals", "contains", "starts_with", "ends_with",
        "in", "not_in", "is_empty", "not_empty",
    ]
