from django.contrib import admin
from .models import (
	NewsArticle, 
	NewsSource,
	BookmarkNews,
	BookmarkFeed,
	UserRating,
	UserClick,
	UserSourceFollow,
	Category,
)


admin.site.register(NewsArticle)
admin.site.register(BookmarkNews)
admin.site.register(NewsSource)
admin.site.register(UserRating)
admin.site.register(UserClick)
admin.site.register(UserSourceFollow)
admin.site.register(Category)
admin.site.register(BookmarkFeed)