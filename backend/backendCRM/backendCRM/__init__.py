"""Django project package.

Importing the Celery app here makes `@shared_task` decorators discover the
right broker config. The import is wrapped in try/except so the project
still boots when Celery isn't installed (dev environments without Redis).
"""

try:
    from .celery import app as celery_app  # noqa: F401
    __all__ = ("celery_app",)
except Exception:  # noqa: BLE001
    # Celery optional — automation engine falls back to inline execution.
    pass
