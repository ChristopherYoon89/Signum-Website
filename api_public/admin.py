from django.contrib import admin
from .models import (
	APIClient, 
	APIKey, 
	APIUsage,
	APIKeyInternal,
)


admin.site.register(APIClient)
admin.site.register(APIKey)
admin.site.register(APIUsage)
admin.site.register(APIKeyInternal)
