from django.shortcuts import render, redirect 
from .forms import UserRegisterForm
from rest_framework import viewsets
from main_app.managerserializer import (
	UserSettingsSerializer,
	UserProfileImageSerializer,
	SupportContactSerializer,
	UserFeedSerializer,
	NewsArticleSerializer,
)
from .models import (
	UserSettings, 
	UserProfile, 
	SupportContact,
	UserFeed,
)
from main_app.models import (
	NewsArticle,
	BookmarkNews,
	UserSourceFollow,
	UserRating,
	BookmarkFeed,
)
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from django.utils import timezone
import json
import csv
from ast import literal_eval
from django.db.models import Q
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db.models import Value, CharField
import zipfile
from io import BytesIO
from django.http import HttpResponse
from django.contrib.auth import logout
from django.contrib.auth import update_session_auth_hash
from django.core.paginator import Paginator
from django.db import transaction
import logging
from main_app.views import get_articles_for_bookmark_feed 


logger = logging.getLogger(__name__)


def get_client_ip(request):
	'''
	Returns client IP address, taking into account proxy headers
	'''
	x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
	if x_forwarded_for:
		ip = x_forwarded_for.split(",")[0].strip()
	else:
		ip = request.META.get("REMOTE_ADDR")
	return ip



def register(request):
	if request.method == 'POST':
		form = UserRegisterForm(request.POST)
		if form.is_valid():
			user = form.save()
			logger.info("User user_id=%s with ip=%s registered successfully",
				   user.id,
				   get_client_ip(request)
			)
			return redirect('login-page')
		else:
			logger.warning(
				"Registration form invalid of User user_id=%s with ip=%s causing the following error=%s",
				None, 
				get_client_ip(request),
				form.errors.as_json()
			)
	else:
		form = UserRegisterForm()
	return render(request, 'user/register.html', {'form': form})



def logout_js_page(request):
	return render(request, 'user/logout-js.html')



class UserSettingsViewSet(viewsets.ModelViewSet):
	'''
	View that handles UserSettings
	-> DashboardHomeApp.js
	'''
	serializer_class = UserSettingsSerializer
	permission_classes = [IsAuthenticated]
	queryset = UserSettings.objects.all()
	filter_backends = [SearchFilter] 
	filterset_fields = ['user']

	def get_queryset(self): 
		queryset = super().get_queryset()
		user_id = self.request.query_params.get('user', None)
		if user_id:
			queryset = queryset.filter(user=user_id)
		return queryset

	def update(self, request, *args, **kwargs):
		partial = kwargs.pop('partial', False)
		instance = self.get_object()
		user = request.user
		data = request.data
		data['user'] = user
		data['date_created'] = timezone.now

		serializer = self.get_serializer(instance, data=data, partial=partial)
		serializer.is_valid(raise_exception=True)
		self.perform_update(serializer)

		return Response(serializer.data, status=status.HTTP_200_OK)
	


class UpdateProfileImageView(APIView):
	permission_classes = [IsAuthenticated]
	parser_classes = [MultiPartParser, FormParser]  # parser for image

	def post(self, request, *args, **kwargs):
		try:
			user_profile = UserProfile.objects.get(user=request.user)
		except UserProfile.DoesNotExist:
			return Response({'error': 'UserProfile not found'}, status=status.HTTP_404_NOT_FOUND)

		serializer = UserProfileImageSerializer(user_profile, data=request.data, partial=True)
		if serializer.is_valid():
			serializer.save()
			return Response({'message': 'Profile image updated successfully', 'image_url': serializer.data['image']}, status=status.HTTP_200_OK)
		
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
	


class UserViewSet(APIView):
	'''
	Viewset that handles User object and updates profile information
	-> 
	'''
	permission_classes = [IsAuthenticated]

	def patch(self, request, *args, **kwargs):
		user = request.user

		new_username = request.data.get('username')
		new_email = request.data.get('email')
		password = request.data.get('password')

		if not password:
			return Response({"error": "Password required"}, status=400)

		if not user.check_password(password):
			return Response({"error": "Incorrect password"}, status=401)

		if new_email and new_email != user.email:
			if User.objects.filter(email=new_email).exists():
				return Response({'error': 'Email already taken'}, status=400)

		if new_username and new_username != user.username:
			if User.objects.filter(username=new_username).exists():
				return Response({"error": "Username already taken"}, status=400)

		user.username = new_username
		user.email = new_email
		user.save()

		return Response({"success": "User updated"})



class UserPasswordViewSet(APIView):
	'''
	View that changes user password on profile page
	-> DashboardProfileApp.js
	'''
	permission_classes = [IsAuthenticated]

	def patch(self, request, *args, **kwargs):
		user = request.user
		oldpassword = request.data.get("oldpassword")
		newpassword = request.data.get("newpassword")

		if not oldpassword or not newpassword:
			return Response({"error": "Both password fields required"}, status=400)

		if not user.check_password(oldpassword):
			return Response({"error": "Incorrect current password"}, status=401)

		try:
			validate_password(newpassword, user)
		except ValidationError as e:
			return Response({"error": e.messages[0]}, status=400)

		user.set_password(newpassword)
		user.save()

		update_session_auth_hash(request, user)

		return Response({"success": "Password updated successfully"}, status=status.HTTP_200_OK)



class SupportContactViewSet(viewsets.ModelViewSet):
	'''
	Viewsets that handles class SupportContact 
	-> DashboardContactSupportApp.js
	'''
	permission_classes = [IsAuthenticated]
	queryset = SupportContact.objects.all()
	serializer_class = SupportContactSerializer

	def get_queryset(self):
		queryset = super().get_queryset()
		return queryset
	
	def create(self, request, *args, **kwargs):
		user = request.user
		email = request.data.get('emailcontact', None)
		subject = request.data.get('subject', None)
		message = request.data.get('message', None)

		message_create = SupportContact.objects.create(
			user=user,
			email=email,
			subject=subject,
			message=message,
		)

		serializer = self.get_serializer(message_create)
		return Response(serializer.data, status=status.HTTP_201_CREATED)



class UserFeedViewSet(viewsets.ModelViewSet):
	'''
	View that handles class UserFeed 
	-> Dashboard Briefing Feed
	'''
	permission_classes = [IsAuthenticated]
	queryset = UserFeed.objects.all()
	serializer_class = UserFeedSerializer

	def get_queryset(self):
		queryset = super().get_queryset()
		return queryset 
	
	def create(self, request, *args, **kwargs):
		user = request.user
		no_feeds = UserFeed.objects.count()
		ranking = int(no_feeds + 1)
		try:
			feed = UserFeed.objects.create(
				user=user,
				feed_type='personal_feed',
				title=request.data.get('title', ""),
				ranking=ranking,
				order_by=request.data.get('order_by', ""),
				publish_boolean=True,
				category_included=request.data.get('category_included', []),
				tags_included=request.data.get('tags_included', []),
				tags_excluded=request.data.get('tags_excluded', []),
				source_included=request.data.get('source_included', []),
				source_excluded=request.data.get('source_excluded', []),
				min_clicks=float(request.data.get('min_clicks', 0)),
				min_rating=float(request.data.get('min_rating', 0)),
				min_algo_rating=float(request.data.get('min_algo_rating', 0)),
				min_source_rating=float(request.data.get('min_source_rating', 0)),
				max_days_published=int(request.data.get('max_days_published', 365)),
			)
			serializer = self.get_serializer(feed)
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		except Exception as e:
			return Response(
				{"error": f"Failed to save user feed: {str(e)}"},
				status=status.HTTP_400_BAD_REQUEST
			)
 


def check_order_by(order_by):
	if order_by == 'by_date':
		order_by_var = '-date_posted'
	elif order_by == 'by_alphabet_source':
		order_by_var = 'source__name'
	else: 
		order_by_var = 'title'
	return order_by_var



def parse_id_list(value):
	if not value:
		return []
	try:
		return json.loads(value)
	except json.JSONDecodeError:
		return literal_eval(value)
	


def parse_keywords(value):
	if not value:
		return []
	return [kw.strip() for kw in value.split(",") if kw.strip()]



class GetDataFeedBoardView(APIView):
	'''
	View that queries data for the feed board in the dashboard 
	-> DashboardFeedBoard.js
	'''
	permission_classes = [IsAuthenticated]

	PAGE_SIZE = 10

	def parse_list(self, value):
		"""Ensure the value is always returned as a list."""
		if not value:
			return []
		if isinstance(value, list):
			return value
		# legacy support: if somehow a string is stored
		return [v.strip() for v in str(value).split(",") if v.strip()]

	
	def get(self, request, *args, **kwargs):
		user = request.user
		
		feed_id = request.GET.get("feed_id")
		page_number = int(request.GET.get("page", 1))

		feed = UserFeed.objects.get(id=feed_id, user=user, publish_boolean=True)

		order_by_var = check_order_by(feed.order_by)

		# Query All Articles Feed
		if feed.feed_type == 'all_articles':
			articles = NewsArticle.objects.filter(publish=True).select_related(
				'source',
				'category_primary',
				'category_secondary',
			).order_by(order_by_var)

		# Query All User Sources
		elif feed.feed_type == 'user_sources':
			source_ids = UserSourceFollow.objects.filter(user=user).values_list('source_id', flat=True)

			articles = NewsArticle.objects.filter(source_id__in=source_ids,	publish=True
				).select_related(
					"source",
					"category_primary",
					"category_secondary",
				)

		# Query Personal Feed
		elif feed.feed_type == 'personal_feed':
			articles = NewsArticle.objects.filter(publish=True).select_related(
				'source',
				'category_primary',
				'category_secondary',
			)
			category_ids = self.parse_list(feed.category_included)
			if category_ids:
				articles = articles.filter(
					Q(category_primary_id__in=category_ids) |
					Q(category_secondary_id__in=category_ids)
				)

			included_keywords = self.parse_list(feed.tags_included)
			if included_keywords:
				keyword_q = Q()
				for kw in included_keywords:
					keyword_q |= (Q(title__icontains=kw) | Q(tag1__icontains=kw) | Q(tag2__icontains=kw) | Q(tag3__icontains=kw))
				articles = articles.filter(keyword_q)

			exclude_keywords = self.parse_list(feed.tags_excluded)
			if exclude_keywords:
				keyword_q = Q()
				for kw in exclude_keywords:
					keyword_q |= (Q(title__icontains=kw) | Q(tag1__icontains=kw) | Q(tag2__icontains=kw) | Q(tag3__icontains=kw))
				articles = articles.exclude(keyword_q)

			included_sources = self.parse_list(feed.source_included)
			if included_sources:
				articles = articles.filter(source_id__in=included_sources)

			# Filter by excluded sources
			exclude_sources = self.parse_list(feed.source_excluded)
			if exclude_sources:
				articles = articles.exclude(source_id__in=exclude_sources)

			# Filter by numeric thresholds
			if feed.min_clicks > 0:
				articles = articles.filter(userclick__gte=feed.min_clicks)
			if feed.min_rating > 0:
				articles = articles.filter(userrating__gte=feed.min_rating)
			if feed.min_algo_rating > 0:
				articles = articles.filter(algo_rating__gte=feed.min_algo_rating)
			if feed.min_source_rating > 0:
				articles = articles.filter(source_rating__gte=feed.min_source_rating)

			# Final ordering
			articles = articles.order_by(order_by_var)

		paginator = Paginator(articles, self.PAGE_SIZE)
		page = paginator.get_page(page_number)

		data = {
			"feed_id": feed.id, 
			"title": feed.title,
			"articles": NewsArticleSerializer(page.object_list, many=True).data,
			"has_more": page.has_next() 
		}

		return Response(data)
	


def parse_list(value):
	if not value:
		return []
	if isinstance(value, list):
		return value
	return [v.strip() for v in str(value).split(",") if v.strip()]
	


def get_articles_for_feed(feed, user, order_by_var):
	
	# All Articles
	if feed.feed_type == 'all_articles':
		articles = NewsArticle.objects.filter(publish=True)

	# User Sources
	elif feed.feed_type == 'user_sources':
		source_ids = UserSourceFollow.objects.filter(
			user=user
		).values_list('source_id', flat=True)

		articles = NewsArticle.objects.filter(
			source_id__in=source_ids,
			publish=True
		)

	# Personal Feed
	elif feed.feed_type == 'personal_feed':

		articles = NewsArticle.objects.filter(publish=True)

		category_ids = parse_list(feed.category_included)
		if category_ids:
			articles = articles.filter(
				Q(category_primary_id__in=category_ids) |
				Q(category_secondary_id__in=category_ids)
			)

		included_keywords = parse_list(feed.tags_included)
		if included_keywords:
			keyword_q = Q()
			for kw in included_keywords:
				keyword_q |= (
					Q(title__icontains=kw) |
					Q(tag1__icontains=kw) |
					Q(tag2__icontains=kw) |
					Q(tag3__icontains=kw)
				)
			articles = articles.filter(keyword_q)

		exclude_keywords = parse_list(feed.tags_excluded)
		if exclude_keywords:
			keyword_q = Q()
			for kw in exclude_keywords:
				keyword_q |= (
					Q(title__icontains=kw) |
					Q(tag1__icontains=kw) |
					Q(tag2__icontains=kw) |
					Q(tag3__icontains=kw)
				)
			articles = articles.exclude(keyword_q)

		included_sources = parse_list(feed.source_included)
		if included_sources:
			articles = articles.filter(source_id__in=included_sources)

		exclude_sources = parse_list(feed.source_excluded)
		if exclude_sources:
			articles = articles.exclude(source_id__in=exclude_sources)

		if feed.min_clicks > 0:
			articles = articles.filter(userclick__gte=feed.min_clicks)

		if feed.min_rating > 0:
			articles = articles.filter(userrating__gte=feed.min_rating)

		if feed.min_algo_rating > 0:
			articles = articles.filter(algo_rating__gte=feed.min_algo_rating)

		if feed.min_source_rating > 0:
			articles = articles.filter(source_rating__gte=feed.min_source_rating)

	return articles.select_related(
		'source',
		'category_primary',
		'category_secondary',
	).order_by(order_by_var)
	


class GetFeedBoardAllView(APIView):
	permission_classes = [IsAuthenticated]
	PAGE_SIZE = 10

	def get(self, request):
		user = request.user

		feeds = UserFeed.objects.filter(
			user=user,
			publish_boolean=True
		).order_by("ranking")

		response = []

		for feed in feeds:
			order_by_var = check_order_by(feed.order_by)
			articles = get_articles_for_feed(feed, user, order_by_var)

			paginator = Paginator(articles, self.PAGE_SIZE)
			page = paginator.get_page(1)

			response.append({
				"id": feed.id,
				"title": feed.title,
				"feed_type": feed.feed_type,
				"articles": NewsArticleSerializer(page.object_list, many=True).data,
				"page": 1,
				"has_more": page.has_next()
			})

		return Response(response)

	

class UserFeedsAllViewset(viewsets.ModelViewSet):
	'''
	View that handles all feeds for edit feed page
	-> DashboardFeedEditApp.js
	'''

	permission_classes = [IsAuthenticated]
	serializer_class = UserFeedSerializer
	queryset = UserFeed.objects.all() 

	def get_queryset(self):
		user = self.request.user
		feeds = self.queryset.filter(
			user=user,
			feed_type='personal_feed', 
			).order_by('-ranking')
		return feeds 



def normalize_feed_rankings(user):
	feeds = list(
		UserFeed.objects.filter(user=user).order_by("ranking")
	)
	for index, feed in enumerate(feeds, start=1):
		feed.ranking = index
	UserFeed.objects.bulk_update(feeds, ["ranking"])



def normalize_bookmark_feed_rankings(user):
	feeds = list(
		BookmarkFeed.objects.filter(user=user).order_by('ranking')
	)
	for index, feed in enumerate(feeds, start=1):
		feed.ranking = index 
	BookmarkFeed.objects.bulk_update(feeds, ['ranking'])



class UserFeedSingleViewset(viewsets.ModelViewSet):
	'''
	View handles data for editing single feed
	-> DashboardFeedEditApp.js
	View handles deletion of single feed
	-> DashboardFeedDeleteApp.js
	'''

	permission_classes = [IsAuthenticated]
	serializer_class = UserFeedSerializer 
	
	def get_queryset(self):
		return UserFeed.objects.filter(user=self.request.user)
	

	def destroy(self, request, *args, **kwargs):
		instance = self.get_object()
		user = instance.user

		# delete feed
		self.perform_destroy(instance)

		# normalize rankings
		normalize_feed_rankings(user)

		return Response(status=status.HTTP_204_NO_CONTENT)
	


class UserFeedsAllSettingsViewset(viewsets.ModelViewSet):
	'''
	View that handles all feeds for edit feed page
	-> DashboardSettingsApp.js
	'''
	permission_classes = [IsAuthenticated]
	serializer_class = UserFeedSerializer
	queryset = UserFeed.objects.all() 

	def get_queryset(self):
		user = self.request.user
		feeds = self.queryset.filter(
			user=user, 
			).order_by('ranking')
		return feeds 



class UpdateUserSettingsView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		user = request.user
		data = request.data

		settings = user.usersettings
		settings.show_article_tags = data.get("show_article_tags", False)
		settings.show_article_timestamp = data.get("show_article_timestamp", False)
		settings.save()

		displayed_feeds = set(data.get("displayed_feeds", []))
		ranked_feeds = data.get("ranked_feeds", [])

		ranking_map = {r["value"]: r["ranking"] for r in ranked_feeds} # Create O(1) lookup table / dictionaries to optimize the update of the objects
		feeds = list(UserFeed.objects.filter(user=user))

		with transaction.atomic():

			# STEP 1 — move rankings out of the way
			for feed in feeds:
				feed.ranking = feed.ranking + 1000

			UserFeed.objects.bulk_update(feeds, ["ranking"])

			# STEP 2 — apply final values
			for feed in feeds:
				feed.publish_boolean = feed.id in displayed_feeds
				feed.ranking = ranking_map.get(feed.id, feed.ranking)

			UserFeed.objects.bulk_update(feeds, ["ranking", "publish_boolean"])
		normalize_feed_rankings(user)

		displayed_bookmark_feeds = set(data.get("displayed_bookmark_feeds", []))
		ranked_bookmark_feeds = data.get("ranked_bookmarked_feeds", [])

		bookmark_ranking_map = {r['value']: r['ranking'] for r in ranked_bookmark_feeds}
		bookmark_feeds = list(BookmarkFeed.objects.filter(user=user))

		with transaction.atomic():

			for feed in bookmark_feeds:
				feed.ranking = feed.ranking + 1000 

			BookmarkFeed.objects.bulk_update(feeds, ['ranking'])

			for feed in bookmark_feeds:
				feed.publish_boolean = feed.id in displayed_bookmark_feeds
				feed.ranking = bookmark_ranking_map.get(feed.id, feed.ranking)
			
			BookmarkFeed.objects.bulk_update(bookmark_feeds, ["ranking", "publish_boolean"])
		normalize_bookmark_feed_rankings(user)

		return Response({"success": True})



class UserDataDownload(APIView):
	'''
	View that allows user to download his personal data
	-> DashboardProfileApp.js
	'''
	permission_classes = [IsAuthenticated]

	def get(self, request, *args, **kwargs):
		user = request.user
		profile_data = {
			'username': user.username,
			'email': user.email,
			'subscription type': user.userprofile.subscription_type,
			'Date created': user.userprofile.date_created.isoformat() ,
			'Profile image': user.userprofile.image.url if user.userprofile.image else None,
		}

		user_settings = UserSettings.objects.filter(user=user)
		settings_data = [
			{
			'Show article tags': setting.show_article_tags,
			'Show article timestamp': setting.show_article_timestamp,
			} for setting in user_settings
		]

		user_feeds = UserFeed.objects.filter(user=user)
		feed_data = [ 
			{
				'Title': user_feed.title,
				'Ranking': user_feed.ranking,
				'Order by': user_feed.order_by,
				'Publish': user_feed.publish_boolean,
				'Category included': user_feed.category_included,
				'Tags included': user_feed.tags_included,
				'Tags excluded': user_feed.tags_excluded,
				'Sources included': user_feed.source_included,
				'Sources excluded': user_feed.source_excluded,
				'Minimum clicks': user_feed.min_clicks,
				'Minimum user rating': user_feed.min_rating,
				'Minimum algorithm rating': user_feed.min_algo_rating,
				'Minimum source rating': user_feed.min_source_rating,
				'Maximum days published': user_feed.max_days_published,
			}
			for user_feed in user_feeds
		]

		user_support_contacts = SupportContact.objects.filter(user=user)
		contact_data = [ 
			{
			'Subject': contact.subject,
			'Email': contact.email,
			'Message': contact.message,
			'Date': contact.date_posted.isoformat() ,
			} 
			for contact in user_support_contacts
		]
		
		user_bookmarks = BookmarkNews.objects.filter(user=user).select_related('newsarticle_bookmarked')
		bookmarks_data = [
			{
				'Title of Newsarticle': bookmark.newsarticle_bookmarked.title,
				'Date created': bookmark.date_created.isoformat() ,
			}
			for bookmark in user_bookmarks
		]

		user_ratings = UserRating.objects.filter(user=user).select_related('newsarticle')
		ratings_data = [
			{
				'Title of Newsarticle': rating.newsarticle.title,
				'Date created': rating.date_created.isoformat() ,
				'Rating': rating.userrating,
			}
			for rating in user_ratings
		]

		user_follows = UserSourceFollow.objects.filter(user=user).select_related('source')
		follow_data = [
			{
				'Source': follow.source.name,
				'Date created': follow.date_created.isoformat() ,
			}
			for follow in user_follows
		] 

		files = {
			'Profile_Data.json': profile_data,
			'Settings_Data.json': settings_data,
			'User_Feed_Data.json': feed_data,
			'Contact_Data.json': contact_data,
			'Bookmark_Data.json': bookmarks_data,
			'Ratings_Data.json': ratings_data,
			'Follow_Data.json': follow_data,
		}

		buffer = BytesIO()

		with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
			for filename, data in files.items():
				zip_file.writestr(filename, json.dumps(data, indent=2, ensure_ascii=False, default=str))

		buffer.seek(0)

		response = HttpResponse(buffer, content_type="application/zip")
		response["Content-Disposition"] = 'attachment; filename="user_data.zip"'

		return response
	

class DataExportView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		user = request.user

		selected_feed = request.data.get('selectedfeed')
		selected_file_format = request.data.get('fileformat')
		selectlimit = int(request.data.get('selectlimit', 100))

		feeds_articles_list = []
		order_by_var = "-date_posted"
		max_articles = 1000

		if selected_feed == 'briefing_feeds':
			user_feeds = UserFeed.objects.filter(user=user)
			
			for feed in user_feeds:
				articles = get_articles_for_feed(feed, user, order_by_var)[:selectlimit]
				feeds_articles_list.extend(
					articles.annotate(
						feed_name=Value(feed.title, output_field=CharField())
					).values(
						"feed_name",
						"title",
						"source__name",
						"source_url",
						"category_primary__name",
						"category_secondary__name",
						"tag1",
						"tag2",
						"tag3",
						"date_posted",
						"clicks_count",
						"average_rating",
						"algo_rating",
						"source__average_rating",
						"source__average_algo_rating",
					)
				)
				if len(feeds_articles_list) > max_articles:
					break
		else:
			user_bookmark_feeds = BookmarkFeed.objects.filter(user=user)

			for feed in user_bookmark_feeds:
				articles = get_articles_for_bookmark_feed(feed, user)[:selectlimit]
				feeds_articles_list.extend(
					articles.annotate(
						feed_name=Value(feed.title, output_field=CharField())
					).values(
						"feed_name",
						"newsarticle_bookmarked__title",
						"newsarticle_bookmarked__source__name",
						"newsarticle_bookmarked__source_url",
						"newsarticle_bookmarked__category_primary__name",
						"newsarticle_bookmarked__category_secondary__name",
						"newsarticle_bookmarked__tag1",
						"newsarticle_bookmarked__tag2",
						"newsarticle_bookmarked__tag3",
						"newsarticle_bookmarked__date_posted",
						"newsarticle_bookmarked__clicks_count",
						"newsarticle_bookmarked__average_rating",
						"newsarticle_bookmarked__algo_rating",
						"newsarticle_bookmarked__source__average_rating",
						"newsarticle_bookmarked__source__average_algo_rating",
					)
				)
				if len(feeds_articles_list) > max_articles:
					break 
		
		filename = f"{user.username}_{selected_feed}.{selected_file_format}"
		
		if selected_file_format == "json":
			response = HttpResponse(
				json.dumps(feeds_articles_list, indent=2, ensure_ascii=False, default=str),
				content_type="application/json"
			)
			response['Content-Disposition'] = f'attachment; filename="{filename}"'
			return response

		elif selected_file_format == "csv":
			response = HttpResponse(content_type='text/csv')
			response['Content-Disposition'] = f'attachment; filename="{filename}"'

			writer = csv.writer(response)

			writer.writerow([
				"Feed_name", "Title","Source","URL", "Primary_category", "Secondary_category", "Tag_1","Tag_2","Tag_3",
				"Date_posted","Number_of_clicks","Avg_user_rating","Algo_rating",
				"Avg_source_user_rating", "Avg_source_algo_rating"
			])

			for article in feeds_articles_list:
				writer.writerow(article.values())

			return response
	


class DeactivateUserAccount(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		user = request.user

		password = request.data.get("password")

		if not user.check_password(password):
			return Response({"error": "Incorrect password"}, status=status.HTTP_403_FORBIDDEN)

		user.is_active = False
		user.save()

		logout(request)

		return Response(status=status.HTTP_200_OK)