from django.core.management.base import BaseCommand
from django.utils import timezone

from api_public.apirateredisclient import redis_client
from api_public.models import APIUsage, APIClient


class Command(BaseCommand):
    help = "Sync Redis API usage to database (daily)"

    def handle(self, *args, **kwargs):
        today = timezone.now().date()

        keys = redis_client.keys("api_client:*:tokens")

        for key in keys:
            # key = api_client:5:tokens
            client_id = key.split(":")[1]

            tokens = redis_client.get(key)

            if tokens is None:
                continue

            tokens = int(tokens)

            try:
                client = APIClient.objects.get(id=client_id)
            except APIClient.DoesNotExist:
                continue

            usage, created = APIUsage.objects.get_or_create(
                client=client,
                date=today,
                defaults={"tokens_used": tokens}
            )

            if not created:
                usage.tokens_used = tokens
                usage.save()

        self.stdout.write(self.style.SUCCESS("API usage synced"))