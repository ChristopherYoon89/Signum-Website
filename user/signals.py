from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import (
	UserProfile, 
	UserSettings,
    UserFeed,
)
import logging
from django.contrib.auth.signals import (
	user_logged_in, 
	user_login_failed, 
	user_logged_out,
)


logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
        user = instance
        user.is_active = False
        user.save()



@receiver(post_save, sender=User)
def save_profile(sender, instance, **kwargs):
    instance.userprofile.save()



@receiver(post_save, sender=User)
def create_usersettings(sender, instance, created, **kwargs):
    if created:
        UserSettings.objects.create(user=instance)    



@receiver(post_save, sender=User)
def create_userfeed(sender, instance, created, **kwargs):
    if not created:
        return

    default_feeds = [
        {
            "feed_type": "all_articles",
            "title": "All Articles",
            "ranking": 1,
        },
        {
            "feed_type": "user_sources",
            "title": "My Sources",
            "ranking": 2,
        },
    ]

    for feed in default_feeds:
        UserFeed.objects.get_or_create(
            user=instance,
            ranking=feed["ranking"],  # unique ranking
            defaults={
                "feed_type": feed["feed_type"],
                "title": feed["title"],
                "publish_boolean": True,
                "category_included": [],
                "tags_included": [],
                "tags_excluded": [],
                "source_included": [],
                "source_excluded": [],
                "min_clicks": 0,
                "min_rating": 0,
                "min_algo_rating": 0,
                "min_source_rating": 0,
                "max_days_published": 0,
                "order_by": "by_date",
            }
        )



def get_ip_from_request(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


# Successful login
@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    logger.info("User user_id=%s with ip=%s logged in successfully",
				   user.id,
				   get_ip_from_request(request)
			)


# Failed login attempt
@receiver(user_login_failed)
def log_user_login_failed(sender, credentials, request, **kwargs):
    username = credentials.get("username") if credentials else "unknown"
    ip = get_ip_from_request(request)
    
    logger.warning(
        "Failed login attempt by user_id=%s with ip=%s and username=%s",
        None,  # user_id is always None here
        ip,
        username,
    )


# Logout
@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    logger.info(
        "User user_id=%s with ip=%s logged out",
        user.id if user else None,
        get_ip_from_request(request)
    )