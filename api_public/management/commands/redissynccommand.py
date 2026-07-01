from django.core.management.base import BaseCommand
from django.utils import timezone

from api_public.apirateredisclient import redis_client
from api_public.models import PublicAPIUsage, PublicAPIClient, PublicAPIKey


class Command(BaseCommand):
    help = "Sync Redis API usage to database (daily)"

    def handle(self, *args, **kwargs):
        today = timezone.now().date()

        keys = redis_client.keys("public_api_key:*:tokens")

        for key in keys:
            # key = api_client:5:tokens
            api_key_id = key.split(":")[1]

            tokens = redis_client.get(key)

            if tokens is None:
                continue

            tokens = int(tokens)

            try:
                api_key = PublicAPIKey.objects.get(id=api_key_id)
            except PublicAPIKey.DoesNotExist:
                continue

            usage, created = PublicAPIUsage.objects.get_or_create(
                public_api_key=api_key,
                date=today,
                defaults={"tokens_used": tokens}
            )

            if not created:
                usage.tokens_used = tokens
                usage.save()

        self.stdout.write(self.style.SUCCESS("API usage synced"))