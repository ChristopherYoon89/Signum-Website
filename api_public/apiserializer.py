from rest_framework import serializers
from django.db import models
from main_app.models import (
	NewsArticle, 
	NewsSource, 
    Category, 
)
from .models import (
	APIClient,
    APIKey,
    APIUsage,
)
from django.utils import timezone
from django.db.models import Sum



##### PUBLIC API SERIALIZER FOR DASHBOARD #####

class APIClientSerializer(serializers.ModelSerializer):
	user = serializers.HiddenField(default=serializers.CurrentUserDefault())
	username = serializers.CharField(source="user.username", read_only=True)
	is_active = serializers.BooleanField()
	rate_limit = serializers.IntegerField()
	tokens_used_month = serializers.SerializerMethodField()
	date_created = serializers.DateTimeField()

	class Meta:
		model = APIClient
		fields = ('id', 'user', 'username', 'is_active', 'rate_limit', 
			'tokens_used_month', 'date_created')

	
	def get_tokens_used_month(self, obj):
		now = timezone.now()

		result = (
			APIUsage.objects
			.filter(
				client=obj,
				date__year=now.year,
				date__month=now.month
			)
			.aggregate(total=Sum("tokens_used"))
		)

		return result["total"] or 0



class APIKeySerializer(serializers.ModelSerializer):
	client = serializers.PrimaryKeyRelatedField(queryset=APIClient.objects.all())
	client_username = serializers.CharField(source="client.user.username", read_only=True)
	name_of_key = serializers.CharField()
	key = serializers.CharField()
	is_active = serializers.BooleanField()
	date_created = serializers.DateTimeField()

	class Meta:
		model = APIKey 
		fields = ('id', 'client', 'client_username', 'name_of_key', 
				  'key', 'is_active', 'date_created')
            


#### API Serializer for public API #### 

class PublicNewsArticleSerializer(serializers.ModelSerializer):
	source_name = serializers.CharField(source="source.name", read_only=True)
	category_primary_name = serializers.CharField(source="category_primary.name", read_only=True)
	category_secondary_name = serializers.CharField(source="category_secondary.name", read_only=True)
	source_rating = serializers.FloatField(source="source.average_rating", read_only=True)
	source_article_count = serializers.IntegerField(source="source.article_count", read_only=True)

	class Meta:
		model = NewsArticle
		fields = (
			'id',
			'title',
			'source_name',
			'source_url',
			'language',
			'category_primary_name',
			'category_secondary_name',
			'tag1',
			'tag2',
			'tag3',
			'date_posted',
			'algo_rating',
            'rating_count',
			'average_rating',
			'clicks_count',
            'source_rating',
			'source_article_count',
		)



class APIClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = APIClient
        fields = (
            "id",
            "rate_limit",
            "is_active",
            "date_created",
        )
        


class APIUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = APIUsage
        fields = (
            "id",
            "date",
            "tokens_used",
            "request_count",
        )
        


class APIKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = (
            "id",
            "name_of_key",
            "key",
            "is_active",
            "date_created",
        )



class PublicNewsSourceSerializer(serializers.ModelSerializer):
     class Meta:
          model = NewsSource
          fields = (
               "id",
               "name", 
               "viaplatform",
               "average_rating",
               "article_count",
               "average_algo_rating",
          )



class PublicCategorySerializer(serializers.ModelSerializer):
     class Meta:
          model = Category 
          fields = (
               "id",
               "name",
          )