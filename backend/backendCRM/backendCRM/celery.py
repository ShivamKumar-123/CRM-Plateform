"""Celery application bootstrap.

This is loaded by `backendCRM/__init__.py` so `from celery import current_app`
works anywhere. The actual broker URL comes from `.env` via Django settings:

    CELERY_BROKER_URL=redis://localhost:6379/0
    CELERY_RESULT_BACKEND=redis://localhost:6379/1

When the env vars are blank the app object still exists, but tasks run
inline (see `automation_engine.dispatch`).

Start the worker locally with::

    celery -A backendCRM worker -l info
"""

import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backendCRM.settings")

app = Celery("backendCRM")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
