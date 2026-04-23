from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import (
	APIClient,
	APIKey,
)
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .apiauthentication import (
	APIKeyAuthentication,
	generate_api_key,
	hash_api_key,
)
from .apiserializer import (
	PublicNewsArticleSerializer, 
	PublicNewsSourceSerializer,
	PublicCategorySerializer,
	APIClientSerializer,
	APIKeySerializer,
)
from main_app.models import (
	NewsArticle, 
	NewsSource,
	Category,
)
from django_filters.rest_framework import DjangoFilterBackend
from .apifilter import (
	NewsArticleFilter,
	NewsSourceFilter,
	CategoryFilter,
)
from django.db.models import Q, Avg, Count
from .apipermission import PermissionHasAPIKey
from .apipagination import (
	PublicNewsArticlePagination,
	PublicNewsSourcePagination,
)
from .apiratemanagement import (
	consume_tokens,
	get_monthly_usage,
)
import logging


logger = logging.getLogger(__name__)	


class APIClientUserViewSet(viewsets.ModelViewSet):
	'''
	View that displays the API Client model of a user
	'''
	serializer_class = APIClientSerializer 
	permission_classes = [IsAuthenticated]
	
	def get_queryset(self):
		user = self.request.user
		
		queryset = APIClient.objects.filter(
			user=user,
			is_active=True
			)
		return queryset
	


class APIKeyAllUserViewSet(viewsets.ModelViewSet):
	'''
	View that displays all API keys of a user
	'''
	serializer_class = APIKeySerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		user = self.request.user 
		client = APIClient.objects.get(
			user=user,
			is_active=True,
		)
		queryset = APIKey.objects.filter(
			client=client,
		).order_by('-date_created')
		return queryset



class APIKeyEditFetchView(APIView):
	'''
	View that fetches data for editing API Key
	''' 
	permission_classes = [IsAuthenticated]

	def get(self, request, *args, **kwargs):
		user = request.user
		client = get_object_or_404(APIClient, user=user, is_active=True)
		api_key_id = request.query_params.get('id', None)
		api_key = get_object_or_404(APIKey,	id=int(api_key_id),	client=client)

		monthly_usage = get_monthly_usage(api_key.client)

		data = {
				"client_id": client.id,
				"client_username": client.user.username,
				"date_activation": api_key.date_created,
				"rate_limit": client.rate_limit,
				"tokens_used": monthly_usage["tokens_used"],
				"api_key_name": api_key.name_of_key,
				"api_is_active": api_key.is_active,
				"api_key": api_key.key,
			}
		
		return Response(data, status=status.HTTP_200_OK)



class APIKeyGenerateNew(APIView):
	'''
	View that generates and saves a new api key
	'''
	permission_classes = [IsAuthenticated]

	def post(self, request, *args, **kwargs):
		user = request.user
		api_id = request.query_params.get("id", None)
		client_instance = get_object_or_404(APIClient, user=user, is_active=True)
		api_key_instance = get_object_or_404(APIKey, id=api_id, client=client_instance)
		raw_key = generate_api_key()
		hashed_key = hash_api_key(raw_key)

		api_key_instance.key = hashed_key
		api_key_instance.save(update_fields=["key"])

		data = {
			"raw_key": raw_key,
		}
		return Response(data, status=status.HTTP_200_OK)
	


class APIKeySaveChanges(APIView):
	'''
	View that handels update of API key 
	'''
	permission_classes = [IsAuthenticated]

	def patch(self, request, *args, **kwargs):
		user = request.user 
		key_id = request.data.get("key_id", None)
		name_of_key = request.data.get('name_of_key', None)
		is_active = request.data.get('is_active', None)

		client_instance = get_object_or_404(APIClient, user=user, is_active=True)
		api_key_instance = get_object_or_404(APIKey, id=key_id,	client=client_instance)

		if name_of_key:
			api_key_instance.name_of_key = name_of_key

		if is_active is not None:
			api_key_instance.is_active = is_active

		api_key_instance.save(update_fields=["name_of_key", "is_active"])

		return Response(
			{"message": "API key successfully updated"},
			status=status.HTTP_200_OK
		)
	


class APIKeySaveNewKey(APIView):
	'''
	View that creates 
	'''
	permission_classes = [IsAuthenticated]

	def post(self, request, *args, **kwargs):
		user = request.user
		
		api_client = get_object_or_404(APIClient, user=user, is_active=True)
		
		name_of_key = request.data.get("name_of_key", None)
		
		if not name_of_key:
			date_created = timezone.now().strftime('%Y%m%d-%H%M%S')
			name_of_key = f"API-Key-{date_created}"

		is_active = request.data.get("is_active", False)

		raw_key = generate_api_key()
		hashed_key = hash_api_key(raw_key)

		api_key_instance = APIKey.objects.create(
			client=api_client,
			name_of_key=name_of_key,
			key=hashed_key, 
			is_active=is_active,
		)

		return Response(
			{"raw_key": raw_key}, 
			status=status.HTTP_200_OK
			)
	


class TokenMeteredViewSet(viewsets.ReadOnlyModelViewSet):
	"""
	Base ViewSet that charges API tokens based on returned objects
	"""

	def list(self, request, *args, **kwargs):
		queryset = self.filter_queryset(self.get_queryset())

		page = self.paginate_queryset(queryset)
		if page is not None:
			tokens_needed = len(page)
		else:
			tokens_needed = queryset.count()

		client = request.auth.client

		consume_tokens(client, tokens_needed)

		if page is not None:
			serializer = self.get_serializer(page, many=True)
			return self.get_paginated_response(serializer.data)

		serializer = self.get_serializer(queryset, many=True)
		return Response(serializer.data)
	

	def retrieve(self, request, *args, **kwargs):
		client = request.auth.client
		consume_tokens(client, 1)
		return super().retrieve(request, *args, **kwargs)



class PublicNewsArticleViewSet(TokenMeteredViewSet):
	"""
	Public API for external clients
	"""
	serializer_class = PublicNewsArticleSerializer
	authentication_classes = [APIKeyAuthentication]
	permission_classes = [PermissionHasAPIKey]
	filter_backends = [DjangoFilterBackend]
	filterset_class = NewsArticleFilter
	pagination_class = PublicNewsArticlePagination

	ordering_fields = [
		"date_posted", 
		"algo_rating",
		"rating_count",
		"average_rating",
		"clicks_count",
		"source__average_rating",
		"source__article_count",
		"source__average_algo_rating",
		]
	ordering = ["-date_posted"]

	def get_queryset(self):
		queryset = NewsArticle.objects.filter(
			publish=True
		).select_related(
			"source",
			"category_primary",
			"category_secondary"
		).order_by("-date_posted")
		return queryset 
	


class PublicNewsSourceViewSet(TokenMeteredViewSet):
	'''
	Public API for the news sources
	'''
	serializer_class = PublicNewsSourceSerializer
	authentication_classes = [APIKeyAuthentication]
	permission_classes = [PermissionHasAPIKey]
	filter_backends = [DjangoFilterBackend]
	filterset_class = NewsSourceFilter
	pagination_class = PublicNewsSourcePagination

	ordering_fields = [
		"name",
		"viaplatform",
		"average_rating",
		"average_algo_rating",
		"article_count",
	]
	ordering = ["name"]

	def get_queryset(self):
		queryset = NewsSource.objects.all().order_by("name")
		return queryset 
	


class PublicCategoryViewSet(TokenMeteredViewSet):
	'''
	Public API viewset to request category data
	'''
	serializer_class = PublicCategorySerializer
	authentication_classes = [APIKeyAuthentication]
	permission_classes = [PermissionHasAPIKey]
	filter_backends = [DjangoFilterBackend]
	filterset_class = CategoryFilter
	
	ordering_fields = [
		"id",
		"name",
	]	
	ordering = ["id"]

	def get_queryset(self):
		queryset = Category.objects.filter(publish=True).order_by("id")
		return queryset 