from django.db import models
from django.contrib.auth.models import User
import secrets 
import hashlib



class APIClient(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="api_client")
	is_active = models.BooleanField(default=True)
	date_created = models.DateTimeField(auto_now_add=True, db_index=True)
	rate_limit = models.IntegerField(default=1000)

	class Meta:
		indexes = [
			models.Index(fields=['user', 'date_created'])
		]

	def __str__(self):
		return f"API Client: {self.user.username}" 
	


class APIKey(models.Model):
	client = models.ForeignKey(APIClient, on_delete=models.CASCADE, related_name="api_key")
	name_of_key = models.CharField(max_length=250)
	key = models.CharField(max_length=64, unique=True, blank=True)
	is_active = models.BooleanField(default=True)	
	date_created = models.DateTimeField(auto_now_add=True, db_index=True)

	class Meta:
		indexes = [
			models.Index(fields=['client', 'date_created'])
		]

	def __str__(self):
		return f"API Key: {self.client.user.username}"



def generate_api_key():
	key = secrets.token_hex(32)
	return key 


def hash_api_key(raw_key):
	hashed_key = hashlib.sha256(raw_key.encode()).hexdigest()
	return hashed_key



class APIKeyInternal(models.Model):
	client = models.ForeignKey(APIClient, on_delete=models.CASCADE, related_name="api_key_internal")
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
	


class APIUsage(models.Model):
	client = models.ForeignKey(APIClient, on_delete=models.CASCADE, related_name="api_usage")
	date = models.DateField(db_index=True)
	tokens_used = models.IntegerField(default=0)
	request_count = models.IntegerField(default=0)

	class Meta:
		unique_together = ("client", "date")
		indexes = [
			models.Index(fields=['client', 'date']),
		]