from django.utils import timezone
from datetime import timedelta
from rest_framework.exceptions import Throttled
from .apirateredisclient import redis_client
from .models import PublicAPIUsage
from django.db.models import Sum  



def get_today_expiry_seconds():
    now = timezone.now()
    tomorrow = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    return int((tomorrow - now).total_seconds())



def consume_tokens(api_key, tokens_needed):
    key = f"public_api_key:{api_key.id}:tokens"

    # increment atomically
    tokens_used = redis_client.incrby(key, tokens_needed)
     
    # set expiry only if first time
    if tokens_used == tokens_needed:
        redis_client.expire(key, get_today_expiry_seconds())

    if api_key.tokens_limit and tokens_used > api_key.tokens_limit:
        raise Throttled(detail="API key limit exceeded")
    
    client = api_key.client 

    monthly = get_monthly_usage(client)

    if monthly["tokens_used"] + tokens_needed > client.monthly_token_limit:
        raise Throttled(detail="Monthly limit exceeded")



def get_monthly_usage(client):
    now = timezone.now()
    result = (
        PublicAPIUsage.objects
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
