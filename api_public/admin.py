from django.contrib import admin
from .models import (
	PublicAPIClient, 
	PublicAPIKey, 
	PublicAPIUsage,
	PublicAPIKeyInternal,
)


admin.site.register(PublicAPIClient)
admin.site.register(PublicAPIKey)
admin.site.register(PublicAPIUsage)
admin.site.register(PublicAPIKeyInternal)
