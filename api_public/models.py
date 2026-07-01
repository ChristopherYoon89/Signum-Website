from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone 
import secrets 
import hashlib



class PublicAPIClient(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	is_active = models.BooleanField(default=True)
	date_created = models.DateTimeField(auto_now_add=True, db_index=True)
	rate_limit = models.IntegerField(default=1000)
	monthly_token_limit = models.IntegerField(default=100000)
	total_token_usage = models.IntegerField(default=0)

	class Meta:
		indexes = [
			models.Index(fields=['user', 'date_created'])
		]

	def __str__(self):
		return f"Public API Client: {self.user.username}" 
	
 

class PublicAPIKey(models.Model):
	client = models.ForeignKey(PublicAPIClient, on_delete=models.CASCADE)
	name_of_key = models.CharField(max_length=250)
	key = models.CharField(max_length=64, unique=True, blank=True)
	is_active = models.BooleanField(default=True)	
	date_created = models.DateTimeField(auto_now_add=True, db_index=True)
	tokens_limit = models.IntegerField(default=0)

	class Meta:
		indexes = [
			models.Index(fields=['client', 'date_created'])
		]

	def __str__(self):
		return f"{self.client.user.username} Public API Key {self.name_of_key}"



class PublicAPIUsage(models.Model):
	public_api_key = models.ForeignKey(PublicAPIKey, on_delete=models.CASCADE, related_name='usage')
	date = models.DateField(default=timezone.now, db_index=True)
	tokens_used = models.IntegerField(default=0)
	request_count = models.IntegerField(default=0)

	class Meta:
		indexes = [
			models.Index(fields=['public_api_key'])
		]
	
	def __str__(self):
		return f"Usage for API client: {self.public_api_key.client.user.username}"



def generate_api_key():
	key = secrets.token_hex(32)
	return key 


def hash_api_key(raw_key):
	hashed_key = hashlib.sha256(raw_key.encode()).hexdigest()
	return hashed_key



class PublicAPIKeyInternal(models.Model):
	client = models.ForeignKey(PublicAPIClient, on_delete=models.CASCADE)
	name_of_key = models.CharField(max_length=250)
	key_raw = models.CharField(max_length=64, unique=True, blank=True)
	raw_hashed = models.CharField(max_length=64, unique=True, blank=True)
	is_active = models.BooleanField(default=True)
	date_created = models.DateTimeField(auto_now_add=True, db_index=True)

	class Meta:
		indexes = [
			models.Index(fields=['client', 'date_created'])
		]	

	def save(self, *args, **kwargs):
		if not self.key_raw:
			self.key_raw = generate_api_key()
		self.raw_hashed = hash_api_key(self.key_raw)
		super().save(*args, **kwargs)
	
