from django.contrib import admin
from .models import ReleaseNotes, ContactRequest

# Register your models here.


admin.site.register(ReleaseNotes)
admin.site.register(ContactRequest)