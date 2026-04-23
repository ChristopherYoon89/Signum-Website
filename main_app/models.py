from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.urls import reverse
from django.db.models import Count


class NewsSource(models.Model):
	name = models.CharField(max_length=300, db_index=True)
	viaplatform = models.CharField(max_length=300, null=True, blank=True, default=None, db_index=True)
	rating_sum = models.IntegerField(default=0)
	rating_count = models.IntegerField(default=0)
	average_rating = models.FloatField(default=0.0, db_index=True)
	article_count = models.IntegerField(default=0, db_index=True)
	algo_rating_sum = models.FloatField(default=0.0)
	algo_rating_count = models.IntegerField(default=0)
	average_algo_rating = models.FloatField(default=0.0, db_index=True)

	class Meta:
		indexes = [
			models.Index(fields=[
				"name", "viaplatform", "average_rating", "article_count", "average_algo_rating"
				]),
		]

	def __str__(self):
		return self.name
	
	def save(self, *args, **kwargs):
		super().save(*args, **kwargs)



class Category(models.Model):
	name = models.CharField(max_length=300, db_index=True)
	publish = models.BooleanField(default=True, db_index=True)

	class Meta:
		indexes = [
			models.Index(fields=['name', 'publish'])
		]

	def __str__(self):
		return self.name 
	
	def save(self, *args, **kwargs):
		super().save(*args, **kwargs)



LANGUAGECHOICES = (
	('German', 'German'),
	('English', 'English'), 
	('Other', 'Other'),
)



class NewsArticle(models.Model):
	source = models.ForeignKey(NewsSource, on_delete=models.SET_NULL, null=True, blank=True, default=None)
	source_url = models.CharField(max_length=500)
	title = models.CharField(max_length=300, blank=True)
	language = models.CharField(max_length=300, default='German', choices = LANGUAGECHOICES)
	category_primary = models.ForeignKey(Category, on_delete=models.SET_NULL, db_index=True, blank=True, null=True, related_name='category1')
	category_secondary = models.ForeignKey(Category, on_delete=models.SET_NULL, db_index=True, blank=True, null=True, related_name='category2')
	tag1 = models.CharField(max_length=300, blank=True, db_index=True)
	tag2 = models.CharField(max_length=300, blank=True, db_index=True)
	tag3 = models.CharField(max_length=300, blank=True, db_index=True)
	snippet = models.TextField(max_length=320, blank=True)
	date_posted = models.DateTimeField(default=timezone.now, db_index=True)
	publish = models.BooleanField(default=True, db_index=True)
	algo_rating = models.FloatField(default=0.0, db_index=True)
	rating_sum = models.IntegerField(default=0)
	rating_count = models.IntegerField(default=0)
	average_rating = models.FloatField(default=0.0, db_index=True)
	clicks_count =models.IntegerField(default=0, db_index=True)

	class Meta:
		indexes = [
			models.Index(fields=[
				"source", 
				"category_primary", 
				"category_secondary", 
				"tag1", 
				"tag2", 
				"tag3",
				"-date_posted",
				"-clicks_count",
				"publish",
				"algo_rating",
				"-average_rating",
				"clicks_count",
				]),
		
		# trigram indexes (Postgres only) - dont forget to install django.contrib.postgres and add it to the settings
		#GinIndex(
		#	fields=["tag1"],
		#	name="tag1_trgm",
		#	opclasses=["gin_trgm_ops"]
		#),
		#GinIndex(
		#	fields=["tag2"],
		#	name="tag2_trgm",
		#	opclasses=["gin_trgm_ops"]
		#),
		#GinIndex(
		#	fields=["tag3"],
		#	name="tag3_trgm",
		#	opclasses=["gin_trgm_ops"]
		#),
		]

	def __str__(self):
		return self.title
	
	def save(self, *args, **kwargs):
		super().save(*args, **kwargs)



BMFEEDORDER_CHOICES = [
	("by_date_of_upload", "By date of Upload"),
	("by_date_of_bookmark_added", "By date when bookmark was added"),
]


class BookmarkFeed(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmark_feed')
	title = models.CharField(max_length=300, blank=True, null=True)
	ranking = models.PositiveIntegerField(default=1, db_index=True)
	order_by = models.CharField(max_length=250, choices=BMFEEDORDER_CHOICES, default="by_date_of_bookmark_added", db_index=True)
	publish_boolean = models.BooleanField(default=True, db_index=True)
	date_created = models.DateTimeField(default=timezone.now, blank=True, null=True)
	date_updated = models.DateTimeField(null=True, blank=True, db_index=True)

	def __str__(self):
		return f"{self.user} Bookmark Feed"

	
	def delete(self, *args, **kwargs):
		user = self.user
		super().delete(*args, **kwargs)

		BookmarkNews.objects.filter(user=user).annotate(
			feed_count=Count("feeds")
		).filter(feed_count=0).delete()




class BookmarkNews(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
	feeds = models.ManyToManyField(BookmarkFeed, related_name="bookmarks", blank=True
	)
	newsarticle_bookmarked = models.ForeignKey(NewsArticle, on_delete=models.CASCADE, db_index=True)
	date_created = models.DateTimeField(default=timezone.now, db_index=True) 

	class Meta:
		ordering = ["-date_created"] 
		unique_together = ('user', 'newsarticle_bookmarked')
		indexes = [
			models.Index(fields=[
				"user", "newsarticle_bookmarked", "date_created"
			]),
		]

	def __str__(self):
		return "{}: {}".format(self.user.username, self.date_created)
	
	def save(self, *args, **kwargs):
		super().save(*args, **kwargs)


class UserRating(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	newsarticle = models.ForeignKey(NewsArticle, on_delete=models.CASCADE, db_index=True, related_name="userrating")
	userrating = models.IntegerField(choices=[(i, i) for i in range(1, 6)], db_index=True)
	date_created = models.DateTimeField(default=timezone.now)

	class Meta: 
		unique_together = ('user', 'newsarticle')
		indexes = [
			models.Index(fields=["user", "newsarticle", "userrating"]),
		]

	def __str__(self):
		return f"{self.user.username} rated {self.newsarticle.title} as {self.userrating}" 



class UserClick(models.Model):
	newsarticle = models.ForeignKey(NewsArticle, on_delete=models.CASCADE, related_name="userclick")
	date_created = models.DateTimeField(default=timezone.now)

	def __str__(self):
		return f"{self.newsarticle.title} clicked"
	


class UserSourceFollow(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	source = models.ForeignKey(NewsSource, on_delete=models.CASCADE, related_name='usersourcefollowsource')
	date_created = models.DateTimeField(default=timezone.now)

	class Meta:
		ordering = ["-date_created"]
		unique_together = ('user', 'source')
		indexes = [
			models.Index(fields=["user", "source"]),
		]
	
	def __str__(self):
		return f"{self.user} follows {self.source}"
	
	def save(self, *args, **kwargs):
		super().save(*args, **kwargs)
