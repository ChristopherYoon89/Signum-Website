from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import (
	UserRating, 
	NewsSource, 
	NewsArticle, 
	UserClick,
    NewsArticle,
)
from django.db.models.signals import post_delete, pre_save, post_delete
from django.db.models import F, Value, Case, When, FloatField



@receiver(pre_save, sender=UserRating)
def store_old_rating(sender, instance, **kwargs):
    '''
    Store old rating if user updates his rating.
    '''
    if instance.pk:
        try:
            instance._old_rating = UserRating.objects.get(pk=instance.pk).userrating
        except UserRating.DoesNotExist:
            instance._old_rating = instance.userrating
            


@receiver(post_save, sender=UserRating)
def update_ratings(sender, instance, created, **kwargs):
    '''
    Update ratings with atomic calculations, atomic is necessary because 
    of race conditions, several users can give user rating at the same time
    '''
    source = instance.newsarticle.source
    article = instance.newsarticle
    old = getattr(instance, "_old_rating", None)

    if created:
        # Article
        NewsArticle.objects.filter(pk=article.pk).update(
            rating_sum=F('rating_sum') + instance.userrating,
            rating_count=F('rating_count') + 1
        )
        # Source
        if source:
            NewsSource.objects.filter(pk=source.pk).update(
                rating_sum=F('rating_sum') + instance.userrating,
                rating_count=F('rating_count') + 1
            )
    else:
        if old is not None:
            diff = instance.userrating - old
            # Article
            NewsArticle.objects.filter(pk=article.pk).update(
                rating_sum=F('rating_sum') + diff
            )
            # Source
            if source:
                NewsSource.objects.filter(pk=source.pk).update(
                    rating_sum=F('rating_sum') + diff
                )
    # Recalculate averages
    NewsArticle.objects.filter(pk=article.pk).update(
        average_rating=Case(                              
            When(
                rating_count__gt=0,
                then=F('rating_sum') * 1.0 / F('rating_count')
            ),
            default=Value(0.0),                            
            output_field=FloatField()
        )
    )
    if source:
        NewsSource.objects.filter(pk=source.pk).update(
            average_rating=Case(
                When(
                    rating_count__gt=0,
                    then=F('rating_sum') * 1.0 / F('rating_count')
                ),
                default=Value(0.0),
                output_field=FloatField()
            )
        )



@receiver(post_delete, sender=UserRating)
def update_ratings_delete(sender, instance, **kwargs):
    source = instance.newsarticle.source
    article = instance.newsarticle
    # Article
    NewsArticle.objects.filter(pk=article.pk).update(
        rating_sum=F('rating_sum') - instance.userrating,
        rating_count=F('rating_count') - 1
    )
    # Source
    if source:
        NewsSource.objects.filter(pk=source.pk).update(
            rating_sum=F('rating_sum') - instance.userrating,
            rating_count=F('rating_count') - 1
        )
    # Recalculate averages
    NewsArticle.objects.filter(pk=article.pk).update(
        average_rating=Case(
            When(
                rating_count__gt=0,
                then=F('rating_sum') * 1.0 / F('rating_count')
            ),
            default=Value(0.0),
            output_field=FloatField()
        )
    )

    if source:
        NewsSource.objects.filter(pk=source.pk).update(
            average_rating=Case(
                When(
                    rating_count__gt=0,
                    then=F('rating_sum') * 1.0 / F('rating_count')
                ),
                default=Value(0.0), 
                output_field=FloatField()
            )
        )



@receiver(post_save, sender=UserClick)
def increment_article_clicks(sender, instance, created, **kwargs):
    if not created:
        return
    NewsArticle.objects.filter(pk=instance.newsarticle_id).update(
        clicks_count=F('clicks_count') + 1
    )



@receiver(pre_save, sender=NewsArticle)
def store_old_source_algo_rating(sender, instance, **kwargs):
    '''
    Store old algo rating just in case when algorithm rating is updated 
    for a specific article
    '''
    if instance.pk:
        try:
            old = NewsArticle.objects.get(pk=instance.pk)
            instance._old_algo_rating = old.algo_rating
            instance._old_source_id = old.source_id
        except NewsArticle.DoesNotExist:
            instance._old_algo_rating = instance.algo_rating
            instance._old_source_id = instance.source_id
    else:
        instance._old_algo_rating = None
        instance._old_source_id = None



@receiver(post_save, sender=NewsArticle)
def update_avg_algo_ratings(sender, instance, created, **kwargs):
    source = instance.source
    #article = instance.newsarticle
    old = getattr(instance, "_old_algo_rating", None)
    old_source_id = getattr(instance, "_old_source_id", None)

    if created:
        if source:
            NewsSource.objects.filter(pk=source.pk).update(
                algo_rating_sum=F('algo_rating_sum') + instance.algo_rating,
                algo_rating_count=F('algo_rating_count') + 1
            )
    else:
        if old_source_id and old_source_id != instance.source_id:
            # subtract from OLD source
            NewsSource.objects.filter(pk=old_source_id).update(
                algo_rating_sum=F('algo_rating_sum') - old,
                algo_rating_count=F('algo_rating_count') - 1
            )
            # add to NEW source
            if source:
                NewsSource.objects.filter(pk=source.pk).update(
                    algo_rating_sum=F('algo_rating_sum') + instance.algo_rating,
                    algo_rating_count=F('algo_rating_count') + 1
                )
        elif old is not None and source:
            diff = instance.algo_rating - old
            NewsSource.objects.filter(pk=source.pk).update(
                algo_rating_sum=F('algo_rating_sum') + diff
            )
    # Recalculate averages when 
    if source:
        NewsSource.objects.filter(pk=source.pk).update(
            average_algo_rating=Case(
                When(
                    algo_rating_count__gt=0,
                    then=F('algo_rating_sum') * 1.0 / F('algo_rating_count')
                ),
                default=Value(0.0),
                output_field=FloatField()
            )
        )
    
    if old_source_id and old_source_id != instance.source_id:
        NewsSource.objects.filter(pk=old_source_id).update(
            average_algo_rating=Case(
                When(
                    algo_rating_count__gt=0,
                    then=F('algo_rating_sum') * 1.0 / F('algo_rating_count')
                ),
                default=Value(0.0),
                output_field=FloatField()
            )
        )
