from django.db import models
from PIL import Image, ImageOps
from django.contrib.auth.models import User
from main_app.models import (
	NewsArticle, 
	NewsSource, 
)
from django.utils import timezone
import os
import uuid



def user_profile_image_path(instance, filename):
	ext = os.path.splitext(filename)[1]
	return f"profile_pics/user_{instance.user.id}/profile{ext}"


SUBSCRIPTION_TYPE = (
		  ('Free', 'Free'),
		  ('Business', 'Business'),
		  ('API', 'API'),
)


class UserProfile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="userprofile")
	image = models.ImageField(default='profile_pics/default/Default.png', upload_to=user_profile_image_path, blank=True, null=True)
	subscription_type = models.CharField(max_length=300, choices=SUBSCRIPTION_TYPE, default='Free')
	date_created = models.DateTimeField(default= timezone.now, blank=True)
	
	def __str__(self):
		return f'{self.user.username} Profile'

	def save(self, *args, **kwargs):
		super().save(*args, **kwargs)

		if not self.image:
			return
		
		if not os.path.exists(self.image.path):
			return

		img = Image.open(self.image.path)
		try:
			exif = img._getexif()
			orientation_key = 274

			if exif and orientation_key in exif:
				orientation = exif[orientation_key]
				rotate_values = {
					3: Image.ROTATE_180,
					6: Image.ROTATE_270,
					8: Image.ROTATE_90
				}
				if orientation in rotate_values:
					img = img.transpose(rotate_values[orientation])
		except:
			pass

		if img.height > 300 or img.width > 300:
			output_size = (300, 300)
			img = ImageOps.fit(img, output_size, Image.LANCZOS)
		img.save(self.image.path)



class UserSettings(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="usersettings")
	show_article_tags = models.BooleanField(default=False, db_index=True)
	show_article_timestamp = models.BooleanField(default=False, db_index=True)

	class Meta:
		indexes = [
			models.Index(fields=["user", "show_article_tags", "show_article_timestamp"]),
		]

	def __str__(self): 
		return f"{self.user}'s settings"
	
	def save(self, *args, **kwargs):
		super().save(*args, **kwargs)



ORDERBYCHOICES = (
	('by_date', 'by_date'),
	('by_alphabet_source', 'by_alphabet_source'),
	('by_alphabet_title', 'by_alphabet_title'),
)


FEEDTYPE = (
	('personal_feed', 'personal_feed'),
	('all_articles', 'all_articles'),
	('user_sources', 'user_sources'),
) 


class UserFeed(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	feed_type = models.CharField(choices=FEEDTYPE, max_length=300, default="personal_feed", db_index=True)
	title = models.CharField(max_length=300, blank=True, null=True)    
	ranking = models.PositiveIntegerField(default=1, db_index=True)
	order_by = models.CharField(max_length=300, blank=True, null=True, choices=ORDERBYCHOICES)
	publish_boolean = models.BooleanField(default=True, db_index=True)
	category_included = models.JSONField(default=list, blank=True, help_text="List of category IDs")
	tags_included = models.JSONField(default=list, blank=True, help_text="List of included tags")
	tags_excluded = models.JSONField(default=list, blank=True, help_text="List of excluded tags")
	source_included = models.JSONField(default=list, blank=True, help_text="List of included source IDs")
	source_excluded = models.JSONField(default=list, blank=True, help_text="List of excluded source IDs")
	min_clicks = models.FloatField(default=0)
	min_rating = models.FloatField(default=0)
	min_algo_rating = models.FloatField(default=0)
	min_source_rating = models.FloatField(default=0)
	max_days_published = models.IntegerField(default=365)

	class Meta:
		constraints = [
				models.UniqueConstraint(
					fields=["user", "ranking"],
					name="unique_feed_ranking_per_user"
				)
			]
		indexes = [
			models.Index(fields=[
				'feed_type', 'ranking', 'publish_boolean'
				])
			]

	def __str__(self):
		return f"{self.user}'s feed: {self.title}"
	
	def save(self, *args, **kwargs):
		super().save(*args, **kwargs)



class SupportContact(models.Model):
	user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
	subject = models.CharField(max_length=300, null=True, blank=True)
	email = models.EmailField(max_length=300, blank=True, null=True)
	message = models.TextField(blank=True, null=True)
	date_posted = models.DateTimeField(default=timezone.now, blank=True, null=True)

	def __str__(self):
		return f"{self.user} contacted support"

	def save(self, *args, **kwargs):
		super().save(*args, **kwargs)