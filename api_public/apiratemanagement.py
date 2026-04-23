from django.utils import timezone
from datetime import timedelta
from rest_framework.exceptions import Throttled
from .apirateredisclient import redis_client
from .models import APIUsage
from django.db.models import Sum  



def get_today_expiry_seconds():
    now = timezone.now()
    tomorrow = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    return int((tomorrow - now).total_seconds())



def consume_tokens(client_id, tokens_needed, rate_limit):
    key = f"api_client:{client_id}:tokens"

    # increment atomically
    tokens_used = redis_client.incrby(key, tokens_needed)

    # set expiry only if first time
    if tokens_used == tokens_needed:
        redis_client.expire(key, get_today_expiry_seconds())

    if tokens_used > rate_limit:
        raise Throttled(detail="API rate limit exceeded")



def get_monthly_usage(client):
    now = timezone.now()
    result = (
        APIUsage.objects
        .filter(
            client=client,
            date__year=now.year,
            date__month=now.month
        )
        .aggregate(
            tokens=Sum("tokens_used"),
            requests=Sum("request_count")
        )
    )
    return {
        "tokens_used": result["tokens"] or 0,
        "request_count": result["requests"] or 0
    }
