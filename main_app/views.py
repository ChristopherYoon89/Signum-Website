from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import F, Window
from django.db.models.functions import RowNumber
from main_app.managerserializer import (
	NewsArticleSerializer,
	BookmarkFeedSerializer,
	BookmarkNewsSerializer,
	NewsSourceSerializer,
	UserRatingSerializer,
	UserClickSerializer,
	UserSourceFollowSerializer,
	CategorySerializer,
	SearchNewsArticleSerializer,
)
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
from django.contrib.auth.models import User
from rest_framework.filters import SearchFilter
from datetime import timedelta, date
from django.utils.timezone import make_aware, is_naive
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
from django.utils import timezone
from django.db.models import Avg
from collections import Counter
from rest_framework.exceptions import NotAuthenticated
from rest_framework.decorators import api_view, permission_classes
from .pagination import (
	ArticleCategoryPagination,
	SourcesPagination,
)
from django.core.paginator import Paginator



def parse_datetime(date_str):
	try:
		return datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S.%fZ") # parsing with microseconds
	except ValueError:
		return datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%SZ") # parsing without microseconds



def home_view(request):
	return render(request, 'main_app/home.html')



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_info(request):
	user = request.user
	
	return JsonResponse({
		"id": user.id,
		"username": user.username,
		"email": user.email,
		"subscription_type": user.userprofile.subscription_type, 
		"profile_image_url": (
			user.userprofile.image.url
			if hasattr(user, "userprofile") and user.userprofile.image
			else None
		),
		"settings": {
			"show_article_tags": user.usersettings.show_article_tags,
			"show_article_timestamp": user.usersettings.show_article_timestamp,
		}
	})



class HomeArticlesByCategory(APIView):
	'''
	View fetches data for the start page filtered by category
	APIView is used because of more complex database operation
	Annotate row numbers before categories are grouped and 
	transformed into json
	-> HomeApp.js
	'''
	authentication_classes = []
	permission_classes = []

	def get(self, request, *args, **kwargs):
		articles_per_category = int(request.query_params.get('limit', 5))

		articles = (
			NewsArticle.objects
			.select_related(
				'source',
				'category_primary',
				'category_secondary'
			)
			.annotate(
				row_number=Window(
					expression=RowNumber(),
					partition_by=[F('category_primary')],
					order_by=F('date_posted').desc()
				)
			)
			.filter(row_number__lte=articles_per_category)
		)

		serializer = NewsArticleSerializer(articles, many=True)
		grouped_articles = {}

		for article in serializer.data:
			category_name = article.get('category_primary_name', 'Uncategorized')
			grouped_articles.setdefault(category_name, []).append(article)

		return Response(grouped_articles, status=status.HTTP_200_OK)



class CategoryViewSet(viewsets.ModelViewSet):
	'''
	View that displays all categories
	'''

	serializer_class = CategorySerializer
	permission_classes = []

	def get_queryset(self):
		queryset = Category.objects.filter(publish=True)
		return queryset 



class AllNewsArticlesViewSet(viewsets.ModelViewSet):
	'''
	View that displays all news articles
	'''
	serializer_class = NewsArticleSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		one_year_ago = date.today() - timedelta(days=1000)
		queryset = NewsArticle.objects.filter(
			date_posted__gte=one_year_ago,
			publish=True,
			).select_related(
				'source',
				'category_primary',
				'category_secondary'
			).order_by('-date_posted')
		return queryset



class ArticlesByCategoryViewSet(viewsets.ModelViewSet):
	'''
	View that handles the queries with articles filtered by 
	category
	-> ArticlesCategoryApp.js
	'''
	serializer_class = NewsArticleSerializer
	permission_classes = [IsAuthenticated]
	queryset = NewsArticle.objects.all()
	filter_backends = [SearchFilter]
	filterset_fields = ['category_primary']
	pagination_class = ArticleCategoryPagination

	def get_queryset(self):
		queryset = super().get_queryset()
		one_year_ago = timezone.now() - timedelta(days=10000)
		category_name = self.request.query_params.get('category_primary', None)
		if category_name:
			if category_name == "All-Articles":
				queryset = queryset.filter(
					date_posted__gte=one_year_ago,
					publish=True,
					).select_related(
					'source',
					'category_primary',
					'category_secondary'
				)
			else:
				queryset = queryset.filter(
					Q(category_primary__name__iexact=category_name) |
					Q(category_secondary__name__iexact=category_name),
					date_posted__gte=one_year_ago,
					publish=True,
					).select_related(
						'source',
						'category_primary',
						'category_secondary'
				)
		queryset = queryset.order_by('-date_posted')
		return queryset



class NewsSourceViewSet(viewsets.ModelViewSet):
	'''
	View that handles the model NewsSource
	'''
	serializer_class = NewsSourceSerializer
	permission_classes = [IsAuthenticated]
	queryset = NewsSource.objects.all()
	filter_backends = [SearchFilter]
	filterset_fields = ['name']

	def get_queryset(self):
		queryset = super().get_queryset()
		name = self.request.query_params.get('name', None)
		if name:
			queryset = NewsSource.objects.filter(
				name=name,
			)
		return queryset



class NewsSourceSingleViewSet(viewsets.ModelViewSet):
	'''
	View that handles the single source news for filtering
	the news by sources -> Column in CategoryNewsApp.js or 
	column in SourcesAllApp.js
	'''
	serializer_class = NewsArticleSerializer
	permission_classes = [IsAuthenticated]
	filter_backends = [SearchFilter]
	filterset_fields = ['source']
	pagination_class = ArticleCategoryPagination

	def get_queryset(self):
		one_year_ago = date.today() - timedelta(days=1000)
		source = self.request.query_params.get('source', None)
		
		if source:
			queryset = NewsArticle.objects.filter(
				date_posted__gte=one_year_ago,
				source__name=source,
				publish=True,
			).select_related(
				'source',
				'category_primary',
				'category_secondary'
			).order_by('-date_posted')
		else:
			queryset = NewsArticle.objects.none()
		return queryset



class NewsSourcesAllViewSet(viewsets.ModelViewSet):
	'''
	View that handles all sources sorted by alphabet in 
	the SourcesAllApp.js to list all sources
	'''
	serializer_class = NewsSourceSerializer
	permission_classes = [IsAuthenticated] 
	pagination_class = SourcesPagination
 
	def get_queryset(self):
		queryset = NewsSource.objects.all().order_by('name')
		return queryset
	


class NewsAddEditFeedSourcesAllViewSet(viewsets.ModelViewSet):
	'''
	View that handles all sources sorted by alphabet to list 
	all sources in the add feed and edit feed pages
	-> DashboardFeedAddApp.js & DashboardFeedEditApp.js
	'''
	serializer_class = NewsSourceSerializer
	permission_classes = [IsAuthenticated] 
 
	def get_queryset(self):
		queryset = NewsSource.objects.all().order_by('name')
		return queryset



class NewsTagsSingleViewSet(viewsets.ModelViewSet):
	'''
	View that handles the single tags news 
	'''
	serializer_class = NewsArticleSerializer
	permission_classes = [IsAuthenticated]
	filter_backends = [SearchFilter]
	filterset_fields = ['tag']
	pagination_class = ArticleCategoryPagination

	def get_queryset(self):
		one_year_ago = date.today() - timedelta(days=1000)
		tag = self.request.query_params.get('tag', None)
		if tag:
			queryset = NewsArticle.objects.filter(
				Q(tag1=tag) | Q(tag2=tag) | Q(tag3=tag),
				date_posted__gte=one_year_ago,
				publish=True,
			).select_related(
				'source',
				'category_primary',
				'category_secondary'
			).order_by('-date_posted')
		else:
			NewsArticle.objects.none()
		return queryset



class BookmarkNewsViewSet(viewsets.ModelViewSet):
	'''
	View that handles News Bookmarks
	'''
	serializer_class = BookmarkNewsSerializer
	permission_classes = [IsAuthenticated]
	filter_backends = [SearchFilter]
	filterset_fields = ['newsarticle_bookmarked']

	def get_queryset(self):
		if not self.request.user.is_authenticated:
			raise NotAuthenticated('Please log in to bookmark article')
		
		user = self.request.user 
		newsarticle_bookmarked = self.request.query_params.get('newsarticle', None)
		if newsarticle_bookmarked:
			queryset = BookmarkNews.objects.filter(newsarticle_bookmarked=newsarticle_bookmarked, user=user)
		else:
			queryset = BookmarkNews.objects.none()            
		return queryset

	def create(self, request, *args, **kwargs):
		user = request.user
		newsarticle_id = request.data.get("newsarticle_bookmarked")
		feed_id = request.data.get("feed_id")

		if not newsarticle_id:
			return Response(
				{"error": "newsarticle_bookmarked is required"},
				status=status.HTTP_400_BAD_REQUEST
			)

		# get or create bookmark
		bookmark, created = BookmarkNews.objects.get_or_create(
			user=user,
			newsarticle_bookmarked_id=newsarticle_id
		)

		# "All bookmarks" checkbox (no feed)
		if feed_id is None:
			if bookmark.feeds.exists():
				bookmark.feeds.clear()
			else:
				# keep bookmark without feeds
				pass

		else:
			if bookmark.feeds.filter(id=feed_id).exists():
				bookmark.feeds.remove(feed_id)
			else:
				bookmark.feeds.add(feed_id)
				BookmarkFeed.objects.filter(id=feed_id).update(
					date_updated=timezone.now()
					)

		# optional: remove bookmark if no feeds and no "all"
		if not bookmark.feeds.exists() and feed_id is not None:
			bookmark.delete()
			return Response({"message": "Bookmark removed"})

		return Response({
			"feeds": list(bookmark.feeds.values_list("id", flat=True))
		})
	


class BookmarkNewsUserViewSet(viewsets.ModelViewSet):
	'''
	View that handles the User's Bookmarks
	'''
	serializer_class = BookmarkNewsSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		user = self.request.user

		if not user.is_authenticated:
			return BookmarkNews.objects.none()
		
		queryset = BookmarkNews.objects.filter(user=user)
		return queryset



class UserRatingViewSet(viewsets.ModelViewSet):
	'''
	View that handles user rating model
	'''
	serializer_class = UserRatingSerializer
	permission_classes = [IsAuthenticated]
	filter_backends = [SearchFilter]
	filterset_fields = ['newsarticle']

	def get_queryset(self):
		user = self.request.user
		newsarticle = self.request.query_params.get("newsarticle")
		queryset = UserRating.objects.filter(user=user, newsarticle=newsarticle)
		return queryset 


	def create(self, request, *args, **kwargs):
		user = request.user
		article_id = request.data.get("newsarticle")
		rating_value = request.data.get("userrating")

		# Validate input
		if article_id is None:
			return Response({"error": "newsarticle id is required"}, status=status.HTTP_400_BAD_REQUEST)
		if rating_value is None:
			return Response({"error": "userrating is required"}, status=status.HTTP_400_BAD_REQUEST)
		try:
			rating_value = int(rating_value)
			if not (1 <= rating_value <= 5):
				raise ValueError()
		except ValueError:
			return Response({"error": "userrating must be an integer 1-5"}, status=status.HTTP_400_BAD_REQUEST)

		# Use update_or_create to handle new/existing rating
		rating, created = UserRating.objects.update_or_create(
			user=user,
			newsarticle_id=article_id,
			defaults={"userrating": rating_value}
		)

		return Response({
			"status": "created" if created else "updated",
			"userrating": rating_value
		}, status=status.HTTP_200_OK)
	


class UserClickViewSet(viewsets.ModelViewSet):
	'''
	View that handles user clicks model
	'''
	serializer_class = UserClickSerializer
	authentication_classes = []
	permission_classes = []
	filter_backend = [SearchFilter]
	filterset_fields = ['newsarticle']

	def get_queryset(self):
		newsarticle = self.request.query_params.get("newsarticle")
		queryset = UserClick.objects.filter(newsarticle=newsarticle)
		return queryset
	
	def create(self, request, *args, **kwargs):
		article_id = self.request.data.get('newsarticle')
		
		if not article_id:
			return Response(
				{'error': 'newsarticle is required'},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		cookie_key = f"clicked_article_{article_id}"

		if request.COOKIES.get(cookie_key):
			return Response(
				{"counted": False, "reason": 'duplicate'},
				status=status.HTTP_200_OK
			)
		
		try:
			news_article = NewsArticle.objects.get(id=article_id)
		except NewsArticle.DoesNotExist:
			return Response(
				{'error': 'Article not found'},
				status=status.HTTP_404_NOT_FOUND
			)
		
		article_click_create = UserClick.objects.create(newsarticle=news_article )

		response = Response(
			{'counted': True, 'id': article_click_create.id},
			status=status.HTTP_201_CREATED
		)

		response.set_cookie(
			key=cookie_key,
			value="1",
			max_age=60*60*24,
			samesite='Lax'
		)
		return response 
	


class UserSourceFollowToggleViewSet(viewsets.ModelViewSet):
	'''
	View that handles Users following sources -> column in 
	SourcesAllApp.js
	'''
	serializer_class = UserSourceFollowSerializer
	permission_classes = [IsAuthenticated]
	filter_backends = [SearchFilter]
	filterset_fields = ['source']

	def get_queryset(self):
		source_followed = self.request.query_params.get('source', None)
		if source_followed:
			user = self.request.user
			queryset = UserSourceFollow.objects.filter(source=source_followed, user=user)
		else:
			queryset = UserSourceFollow.objects.none()
		return queryset
	
	
	def create(self, request, *args, **kwargs):
		if not request.user.is_authenticated:
			raise NotAuthenticated('Please log in to follow sources')
		
		user = request.user
		newssource_id = self.request.data.get('source')
		
		if not newssource_id:
			return Response({"error": "newssource_id is required"}, 
							status=status.HTTP_400_BAD_REQUEST)

		news_source = NewsSource.objects.get(id=newssource_id)
		existing_follow = UserSourceFollow.objects.filter(user=user, source=news_source).first()
		
		if existing_follow:
			existing_follow.delete()
			return Response({"message": "Follow removed"}, status=status.HTTP_204_NO_CONTENT)
		
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		serializer.save(user=user)
		
		return Response(serializer.data, status=status.HTTP_201_CREATED)
	


class UserSourceFollowUserViewSet(viewsets.ModelViewSet):
	'''
	View that gets the User's sources that he follows
	'''
	serializer_class = UserSourceFollowSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		user = self.request.user
		if not user.is_authenticated:
			return UserSourceFollow.objects.none()
		
		queryset = UserSourceFollow.objects.filter(user=user)
		#user_bookmarks = UserSourceFollow.objects.filter(user=user)
		return queryset



def normalize_feed_rankings(user):
	feeds = list(
		BookmarkFeed.objects.filter(user=user).order_by("ranking")
	)
	for index, feed in enumerate(feeds, start=1):
		feed.ranking = index
	BookmarkFeed.objects.bulk_update(feeds, ["ranking"])



class MyBookmarkFeedView(viewsets.ModelViewSet):
	'''
	View that extracts all BookmarkFeeds of a particular user
	View also extracts single feed using params
	View also deletes single feed using params
	'''
	serializer_class = BookmarkFeedSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		user = self.request.user		
		queryset = BookmarkFeed.objects.filter(user=user).order_by('-date_updated')
		return queryset
	
	def create(self, request, *args, **kwargs):       
		user = request.user
		ranking = BookmarkFeed.objects.filter(user=user).count() + 1
		title = self.request.data.get('title', f"Bookmark Feed No. {ranking}")
		order_by = self.request.data.get('order_by', 'by_date_of_bookmark_added')

		data = {
			"title": title,
			"ranking": ranking,
			"order_by": order_by,
		}

		serializer = self.get_serializer(data=data)
		serializer.is_valid(raise_exception=True)
		serializer.save(user=user) 
		return Response(serializer.data, status=status.HTTP_201_CREATED)




class UserBookmarkFeedsAllSettingsViewset(viewsets.ModelViewSet):
	'''
	View that handles all bookmark feeds for edit feed page
	-> DashboardSettingsApp.js
	'''
	permission_classes = [IsAuthenticated]
	serializer_class = BookmarkFeedSerializer

	def get_queryset(self):
		user = self.request.user
		queryset = BookmarkFeed.objects.filter(
			user=user, 
			).order_by('ranking')
		return queryset



class MyBookmarksView(APIView):
	'''
	View that queries a combined list of articles bookmarks and 
	thread bookmarks for the profile bookmarks app
	-> ProfileBookmarksApp.js
	'''
	permission_classes = [IsAuthenticated]

	def get(self, request, *args, **kwargs):
		user = request.user
		news_bookmarks = (
			BookmarkNews.objects
			.filter(user=user)
			.select_related(
				'newsarticle_bookmarked',
				'newsarticle_bookmarked__source',
				'newsarticle_bookmarked__category_primary',
				'newsarticle_bookmarked__category_secondary',
			)
			.order_by('-newsarticle_bookmarked__date_posted')
		)

		news_data = NewsArticleSerializer([bookmark.newsarticle_bookmarked for bookmark in news_bookmarks], many=True).data

		return Response(news_data)



class MySourcesView(APIView):
	'''
	View that handles the sources and users the user follows
	-> ProfileSourcesApp.js
	'''
	permission_classes = [IsAuthenticated]
	pagination_class = SourcesPagination

	def get(self, request, *args, **kwargs):
		user = request.user

		sourcefollows = UserSourceFollow.objects.filter(
			user=user
		).select_related('source').order_by('source__name')

		sources = [follow.source for follow in sourcefollows]

		paginator = self.pagination_class()
		page = paginator.paginate_queryset(sources, request)

		serializer = NewsSourceSerializer(page, many=True)

		return paginator.get_paginated_response(serializer.data)



class HomeIndicatorsView(APIView):
	'''
	View fetches data for the indicators on startpage
	-> HomeApp.js
	'''

	def get(self, request, *args, **kwargs):        
		last_24h = timezone.now() - timedelta(hours=24)
		total_articles = NewsArticle.objects.count()
		articles_last_24h = NewsArticle.objects.filter(date_posted__gte=last_24h).count()
		avg_user_rating = UserRating.objects.aggregate(avg=Avg('userrating'))['avg'] or 0.0
		avg_user_rating_rounded = round(avg_user_rating, 2)
		avg_algo_rating = NewsArticle.objects.aggregate(avg=Avg('algo_rating'))['avg'] or 0.0
		avg_algo_rating_rounded = round(avg_algo_rating, 2)
		published_sources = NewsSource.objects.filter(newsarticle__publish=True).distinct().count()
		total_users = User.objects.count()

		data = {
			"total_articles": total_articles,
			"articles_last_24h": articles_last_24h,
			"avg_user_rating": avg_user_rating_rounded,
			"avg_algo_rating": avg_algo_rating_rounded,
			"published_sources": published_sources,
			"total_users": total_users,
		}
		return Response(data, status=status.HTTP_200_OK)
	


class HomeStatsTags(APIView):
	'''
	View fetches data for the popular articles, tags and Signum indicators
	on the startpage 
	-> StatsHomeIndicators.js -> HomeApp.js
	'''

	def get(self, request, *args, **kwargs):

		# Signum indicators
		last_24h = timezone.now() - timedelta(hours=24)
		total_articles = NewsArticle.objects.count()
		articles_last_24h = NewsArticle.objects.filter(date_posted__gte=last_24h).count()
		avg_user_rating = UserRating.objects.aggregate(avg=Avg('userrating'))['avg'] or 0.0
		avg_algo_rating = NewsArticle.objects.aggregate(avg=Avg('algo_rating'))['avg'] or 0.0
		published_sources = NewsSource.objects.filter(newsarticle__publish=True).distinct().count()
		total_users = User.objects.count()

		indicators = {
			"total_articles": total_articles,
			"articles_last_24h": articles_last_24h,
			"avg_user_rating": round(avg_user_rating, 2),
			"avg_algo_rating": round(avg_algo_rating, 2),
			"published_sources": published_sources,
			"total_users": total_users,
		}

		# Tags

		tags_qs = NewsArticle.objects.values_list(
			'tag1', 'tag2', 'tag3'
		)
		tags = []
		for tag1, tag2, tag3 in tags_qs:
			for tag in (tag1, tag2, tag3):
				if tag:
					tags.append(tag)
		top_tags = [
			tag for tag, _ in Counter(tags).most_common(30)
		]

		# Popular articles

		top_articles = (
			NewsArticle.objects
			.filter(publish=True)
			.select_related("source")
			.order_by('-clicks_count')[:10]
		)

		popular_articles = [
			{
				"id": article.id,
				"title": article.title,
				"source_name": article.source.name,
				"source_url": article.source_url,
				"clicks": article.clicks_count,
				"date_posted": article.date_posted,
			}
			for article in top_articles
		]

		# Final data construction

		data = {
			"indicators": indicators,
			"tags": top_tags,
			"popular_articles": popular_articles,
		}

		return Response(data, status=status.HTTP_200_OK)



class SearchResultView(APIView):
	"""
	Fetches articles based on search query and filters
	-> DashboardSearchResultsApp.js
	"""
	permission_classes = [IsAuthenticated]

	def get(self, request):
		queryset = (
			NewsArticle.objects.
			filter(publish=True)
			.select_related(
				'source', 
				'category_primary', 
				'category_secondary'
				)
		)

		q = request.GET.get("q")
		startdate = request.GET.get("startdate")
		enddate = request.GET.get("enddate")
		category = request.GET.get("category")
		keywords_excluded = request.GET.get("keywords_excluded")
		source_included = request.GET.get("source_included")
		source_excluded = request.GET.get("source_excluded")
		min_clicks = request.GET.get("min_clicks", None)
		min_rating = request.GET.get("min_rating", None)
		min_algo_rating = request.GET.get("min_algo_rating", None)
		min_source_rating = request.GET.get("min_source_rating", None)

		if q:
			keywords = [k.strip() for k in q.split() if k.strip()]
			query = Q()
			for keyword in keywords:
				query |= (
					Q(title__icontains=keyword) |
					Q(tag1__icontains=keyword) |
					Q(tag2__icontains=keyword) |
					Q(tag3__icontains=keyword)
				)
			queryset = queryset.filter(query)

		if startdate:
			startdate_parsed = parse_datetime(startdate)
			if startdate_parsed and is_naive(startdate_parsed):
				startdate_parsed = make_aware(startdate_parsed)
			
			queryset = queryset.filter(date_posted__gte=startdate_parsed)

		if enddate:
			enddate_parsed = parse_datetime(enddate)
			if enddate_parsed and is_naive(enddate_parsed):
				enddate_parsed = make_aware(enddate_parsed)
			
			queryset = queryset.filter(date_posted__lte=enddate_parsed)

		if category:
			category_ids = [int(x) for x in category.split(",") if x]
			queryset = queryset.filter(Q(category_primary__id__in=category_ids) | Q(category_secondary__id__in=category_ids))

		if source_included:
			source_ids = [int(x) for x in source_included.split(",") if x]
			queryset = queryset.filter(source__id__in=source_ids)

		if source_excluded:
			source_ids = [int(x) for x in source_excluded.split(",") if x]
			queryset = queryset.exclude(source__id__in=source_ids)

		if keywords_excluded:
			excluded_keywords = [k.strip() for k in keywords_excluded.split(",") if k.strip()]
			for keyword in excluded_keywords:
				queryset = queryset.exclude(
					Q(title__icontains=keyword) |
					Q(tag1__icontains=keyword) |
					Q(tag2__icontains=keyword) |
					Q(tag3__icontains=keyword)
				)

		if min_algo_rating:
			queryset = queryset.filter(algo_rating__gte=float(min_algo_rating))

		if min_clicks:
			queryset = queryset.filter(clicks_count__gte=int(min_clicks))

		if min_rating:
			queryset = queryset.filter(average_rating__gte=float(min_rating))

		if min_source_rating:
			queryset = queryset.filter(
				source__average_rating__gte=float(min_source_rating)
			)

		queryset = queryset.order_by("-date_posted")
		queryset = queryset[:100]
		serializer = SearchNewsArticleSerializer(queryset, many=True)

		return Response(serializer.data)
	


def check_order_by(order_by):
    if order_by == 'by_date_of_upload':
        return '-newsarticle_bookmarked__date_posted'
    return '-date_created'



def get_articles_for_bookmark_feed(feed, user):

    if feed.order_by == "by_date_of_upload":
        order_by_var = "-newsarticle_bookmarked__date_posted"
    else:
        order_by_var = "-date_created"

    bookmarks = BookmarkNews.objects.filter(
        user=user,
        feeds=feed
    ).select_related(
        "newsarticle_bookmarked",
        "newsarticle_bookmarked__source",
        "newsarticle_bookmarked__category_primary",
        "newsarticle_bookmarked__category_secondary"
    ).order_by(order_by_var)

    return bookmarks



class GetBookmarkFeedBoardView(APIView):

    permission_classes = [IsAuthenticated]
    PAGE_SIZE = 10

    def get(self, request, *args, **kwargs):
        user = request.user

        feed_id = request.GET.get("feed_id")
        page_number = int(request.GET.get("page", 1))

        bookmark_feed = BookmarkFeed.objects.get(
            id=feed_id,
            user=user,
            publish_boolean=True
        )

        bookmarks = get_articles_for_bookmark_feed(bookmark_feed, user)

        paginator = Paginator(bookmarks, self.PAGE_SIZE)
        page = paginator.get_page(page_number)

        articles = [
            bookmark.newsarticle_bookmarked
            for bookmark in page.object_list
        ]

        return Response({
            "feed_id": bookmark_feed.id,
            "title": bookmark_feed.title,
            "articles": NewsArticleSerializer(articles, many=True).data,
            "hasmore": page.has_next()
        })



class GetBookmarkFeedBoardAllView(APIView):
    permission_classes = [IsAuthenticated]
    PAGE_SIZE = 10

    def get(self, request):
        user = request.user

        feeds = BookmarkFeed.objects.filter(
            user=user,
            publish_boolean=True
        ).order_by("ranking")

        response = []

        for feed in feeds:
            bookmarks = get_articles_for_bookmark_feed(feed, user)
            paginator = Paginator(bookmarks, self.PAGE_SIZE)
            page = paginator.get_page(1)

            articles = [
                b.newsarticle_bookmarked
                for b in page.object_list
            ]

            response.append({
                "id": feed.id,
                "title": feed.title,
                "ranking": feed.ranking,
                "articles": NewsArticleSerializer(articles, many=True).data,
                "page": 1,
                "hasmore": page.has_next()
            })

        return Response(response)