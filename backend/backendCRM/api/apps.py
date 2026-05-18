from django.apps import AppConfig


class ApiConfig(AppConfig):
    name = "api"
    default_auto_field = "django.db.models.BigAutoField"

    def ready(self):
        # Register audit + notification signal handlers.
        from . import signals  # noqa: F401
