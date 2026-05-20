"""Plugin / extension hook registry.

Lightweight in-process registry. Plugins register Python callables against
named hooks (e.g. `lead_created`, `deal_won`). When the host code fires
`run_hook(name, **payload)`, every registered callback is invoked with the
payload (best-effort — errors are logged but don't propagate).

The DB `Plugin` model is the **manifest** — name, version, status, config.
Actual code lives in `plugins/<slug>.py` modules; this scaffold provides the
loader entry point. A full marketplace UI is deferred.
"""

from __future__ import annotations

import importlib
import logging
from collections import defaultdict
from typing import Callable

logger = logging.getLogger(__name__)

# Global hook registry — module-level so it survives the request cycle.
_HOOKS: dict[str, list[Callable]] = defaultdict(list)


def register_hook(name: str, callback: Callable) -> None:
    if callback not in _HOOKS[name]:
        _HOOKS[name].append(callback)


def unregister_hook(name: str, callback: Callable) -> None:
    if callback in _HOOKS[name]:
        _HOOKS[name].remove(callback)


def run_hook(name: str, **payload):
    """Fire every callback for `name`. Logs but never raises."""
    results = []
    for cb in list(_HOOKS.get(name, [])):
        try:
            results.append(cb(**payload))
        except Exception as exc:  # noqa: BLE001
            logger.warning("plugin hook %s failed: %s", name, exc)
    return results


def load_plugin(plugin) -> bool:
    """Attempt to import `plugins.<slug>` and run its `register()` entry.

    Plugins live in `backend/backendCRM/plugins/<slug>.py` (we ship none by
    default — this is the extension point). A plugin module exposes::

        def register(config: dict) -> None:
            from api.services.plugins import register_hook
            def on_lead_created(lead, **_):
                ...
            register_hook("lead_created", on_lead_created)
    """
    try:
        mod = importlib.import_module(f"plugins.{plugin.slug}")
        if hasattr(mod, "register"):
            mod.register(plugin.config or {})
        plugin.status = "ENABLED"
        from django.utils import timezone
        plugin.last_run_at = timezone.now()
        plugin.save(update_fields=["status", "last_run_at"])
        return True
    except Exception as exc:  # noqa: BLE001
        plugin.status = "ERROR"
        plugin.save(update_fields=["status"])
        logger.warning("plugin %s failed to load: %s", plugin.slug, exc)
        return False


def load_enabled_plugins(org=None):
    """Boot-time loader — call from apps.ready() to wake up all enabled plugins."""
    from ..models import Plugin
    qs = Plugin.objects.filter(status="ENABLED")
    if org:
        qs = qs.filter(organization=org)
    for plugin in qs:
        load_plugin(plugin)


def registered_hooks() -> dict:
    """For the admin UI — show what's currently registered."""
    return {name: [getattr(cb, "__name__", repr(cb)) for cb in cbs] for name, cbs in _HOOKS.items()}
