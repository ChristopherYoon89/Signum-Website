from django.utils import timezone
from django.db.models import Sum
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from .models import (
	APIUsage, 
	APIClient,
)



@receiver(post_save, sender=APIUsage)
def update_total_tokens_used(sender, instance, **kwargs):
    now = timezone.now()
    total = (
        APIUsage.objects
        .filter(
            client=instance.client,
            date__year=now.year,
            date__month=now.month
        )
        .aggregate(total=Sum("tokens_used"))
    )["total"] or 0

    APIClient.objects.filter(
        id=instance.client_id
    ).update(total_tokens_used=total)