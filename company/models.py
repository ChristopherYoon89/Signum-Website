from django.db import models
from django.contrib.auth.models import User
from django_ckeditor_5.fields import CKEditor5Field
from django.utils import timezone



class ReleaseNotes(models.Model):
    title = models.CharField(max_length=300) 
    author = models. ForeignKey(User, on_delete=models.CASCADE)
    date_posted = models.DateTimeField(default=timezone.now)
    content = CKEditor5Field(config_name="default")
    snippet = models.TextField(max_length=600, blank=True)
    publish_boolean = models.BooleanField(default=True)
    slug = models.SlugField(max_length=255, unique=True, null=True, blank=True)

    def __str__(self):
        return self.title



class ContactRequest(models.Model):
    name = models.CharField(max_length=300)
    email = models.CharField(max_length=300)
    subject = models.CharField(max_length=300)
    date_posted = models.DateTimeField(default=timezone.now)
    message = models.TextField()

    def __str__(self):
        return self.subject