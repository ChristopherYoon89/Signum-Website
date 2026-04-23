from rest_framework import serializers
from .models import (
	NewsArticle, 
	NewsSource,
	BookmarkNews, 
	UserRating,
	UserClick,
	UserSourceFollow,
	Category,
	BookmarkFeed,
)
from user.models import (
	UserSettings, 
	UserProfile, 
	SupportContact,
	UserFeed,
)
from django.contrib.auth.models import User



class NewsArticleSerializer(serializers.ModelSerializer):
	source_name = serializers.CharField(source="source.name", read_only=True)
	source_id = serializers.IntegerField(source='source.id', read_only=True)
	category_primary_name = serializers.CharField(source="category_primary.name", read_only=True)
	category_primary_id = serializers.IntegerField(source="category_primary.id", read_only=True)
	category_secondary_name = serializers.CharField(source="category_secondary.name", read_only=True)
	category_secondary_id = serializers.IntegerField(source="category_secondary.id", read_only=True)
	average_sourcerating = serializers.FloatField(source="source.average_rating", read_only=True)
	average_algo_sourcerating = serializers.FloatField(source="source.average_algo_rating", read_only=True)

	class Meta:
		model = NewsArticle
		fields = ('id', 'source', 'source_name', 'source_id', 'source_url', 'title', 'language', 
				  'category_primary', 'category_primary_name', 'category_primary_id', 'category_secondary',
				  'category_secondary_name', 'category_secondary_id',
				  'tag1', 'tag2', 'tag3', 'snippet', 'date_posted', 'publish', 
				  'algo_rating', 'average_sourcerating', 'rating_sum', 'rating_count',
				  'average_rating', 'average_algo_sourcerating', 'clicks_count')



class CategorySerializer(serializers.ModelSerializer):
	class Meta:
		model = Category
		fields = ('id', 'name', 'publish')



class NewsSourceSerializer(serializers.ModelSerializer):
	class Meta:
		model = NewsSource
		fields = ('id', 'name', 'viaplatform', 'rating_sum', 'rating_count', 
			'average_rating', 'article_count', 'algo_rating_sum', 
			'algo_rating_count', 'average_algo_rating')



class BookmarkFeedSerializer(serializers.ModelSerializer):
	user = serializers.HiddenField(default=serializers.CurrentUserDefault())
	class Meta:
		model = BookmarkFeed
		fields = ('id', 'user', 'title', 'ranking', 'order_by', 
			'publish_boolean', 'date_created')
		


class BookmarkNewsSerializer(serializers.ModelSerializer):
	user = serializers.HiddenField(default=serializers.CurrentUserDefault())
	feeds = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True
    )
	newsarticle_bookmarked = serializers.PrimaryKeyRelatedField(queryset=NewsArticle.objects.all())
	date_created = serializers.DateTimeField(read_only=True)

	class Meta:
		model = BookmarkNews 
		fields = ('id', 'user', 'feeds', 'newsarticle_bookmarked', 'date_created')



class UserRatingSerializer(serializers.ModelSerializer): 
	user = serializers.HiddenField(default=serializers.CurrentUserDefault())
	newsarticle = serializers.PrimaryKeyRelatedField(queryset=NewsArticle.objects.all())
	userrating = serializers.IntegerField()
	date_created = serializers.DateTimeField(read_only=True)

	class Meta:
		model = UserRating
		fields = ('id', 'user', 'newsarticle', 'userrating', 'date_created')



class UserClickSerializer(serializers.ModelSerializer):
	newsarticle = serializers.PrimaryKeyRelatedField(queryset=UserClick.objects.all())
	date_created = serializers.DateTimeField(read_only=True)

	class Meta:
		model = UserClick 
		fields = ('id', 'newsarticle', 'date_created')



class UserSourceFollowSerializer(serializers.ModelSerializer):
	user = serializers.HiddenField(
		default=serializers.CurrentUserDefault()
	)
	source = serializers.PrimaryKeyRelatedField(queryset=NewsSource.objects.all())
	date_created = serializers.DateTimeField(read_only=True)

	class Meta:
		model = UserSourceFollow 
		fields = ('id', 'user', 'source', 'date_created')



class UserSerializer(serializers.ModelSerializer):
	username = serializers.CharField()
	profile_image = serializers.SerializerMethodField()
	user_score = serializers.SerializerMethodField()

	class Meta:
		model = User
		fields = ['id', 'username', 'profile_image', 'user_score']

	def get_profile_image(self, obj):
		try:
			return obj.userprofile.image.url if obj.userprofile.image else None
		except AttributeError:
			return None 
		
	def get_userscore(self, obj):
		return obj.userscoring.score if obj.userscoring.score else None



class UserSettingsSerializer(serializers.ModelSerializer):
	user = serializers.HiddenField(
		default=serializers.CurrentUserDefault()
	)
	show_article_tags = serializers.BooleanField()
	show_article_timestamp = serializers.BooleanField()

	class Meta:
		model = UserSettings
		fields = ['id', 'user', 'show_article_tags', 
				  'show_article_timestamp'
				  ]



class UserFeedSerializer(serializers.ModelSerializer):
	user = serializers.HiddenField(default=serializers.CurrentUserDefault())
	category_included = serializers.ListField(
		child=serializers.IntegerField(), required=False, allow_empty=True
	)
	tags_included = serializers.ListField(
		child=serializers.CharField(), required=False, allow_empty=True
	)
	tags_excluded = serializers.ListField(
		child=serializers.CharField(), required=False, allow_empty=True
	)
	source_included = serializers.ListField(
		child=serializers.IntegerField(), required=False, allow_empty=True
	)
	source_excluded = serializers.ListField(
		child=serializers.IntegerField(), required=False, allow_empty=True
	) 

	class Meta:
		model = UserFeed 
		fields = ['id', 'user', 'feed_type', 'title', 'ranking', 'order_by', 
				  'publish_boolean', 'category_included', 'tags_included', 
				  'tags_excluded', 'source_included', 'source_excluded', 
				  'min_clicks', 'min_rating', 'min_algo_rating', 
				  'min_source_rating', 'max_days_published'
				]
		read_only_fields = ["user"]



class UserProfileImageSerializer(serializers.ModelSerializer):
	class Meta:
		model = UserProfile
		fields = ['image']



class UserSerializer(serializers.ModelSerializer):
	username = serializers.CharField()
	email = serializers.EmailField()
	password = serializers.CharField(write_only=True, required=False)
	
	class Meta:
		model = User 
		fields = ['id', 'username', 'email', 'password']

	def validate_password(self, value):
		if value and len(value) < 8:
			raise serializers.ValidationError("Password must be at least 8 characters long.")
		return value



class SupportContactSerializer(serializers.ModelSerializer):
	user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
	subject = serializers.CharField()
	email = serializers.EmailField()
	message = serializers.CharField()
	date_posted = serializers.DateTimeField()

	class Meta:
		model = SupportContact
		fields = ['id', 'user', 'subject', 'email', 'message', 'date_posted']



class SearchNewsArticleSerializer(serializers.ModelSerializer):
	source_name = serializers.CharField(source="source.name", read_only=True)
	source_id = serializers.IntegerField(source='source.id', read_only=True)
	category_primary_name = serializers.CharField(source="category_primary.name", read_only=True)
	category_primary_id = serializers.IntegerField(source="category_primary.id", read_only=True)
	category_secondary_name = serializers.CharField(source="category_secondary.name", read_only=True)
	category_secondary_id = serializers.IntegerField(source="category_secondary.id", read_only=True)
	average_sourcerating = serializers.FloatField(source="source.average_rating", read_only=True)
	average_algo_sourcerating = serializers.FloatField(source="source.average_algo_rating", read_only=True)

	class Meta:
		model = NewsArticle
		fields = ('id', 'source', 'source_name', 'source_id', 'source_url', 'title', 'language', 
				  'category_primary', 'category_primary_name', 'category_primary_id', 'category_secondary',
				  'category_secondary_name', 'category_secondary_id',
				  'tag1', 'tag2', 'tag3', 'snippet', 'date_posted', 'publish', 
				   'algo_rating', 'average_rating', 'clicks_count', 'average_sourcerating',
				   'average_algo_sourcerating')
		

