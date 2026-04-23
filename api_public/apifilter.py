from rest_framework import serializers
from django.db import models
from django_filters import rest_framework as filters
from django.db.models import Q
from main_app.models import (
	NewsArticle, 
	NewsSource, 
	Category,
)



class NewsArticleFilter(filters.FilterSet):
    language = filters.CharFilter(field_name="language", lookup_expr="iexact")
    source_name = filters.CharFilter(field_name="source__name", lookup_expr="icontains")
    source_id = filters.NumberFilter(field_name="source__id")
    category_primary_name = filters.CharFilter(field_name="category_primary__name", lookup_expr="icontains")
    category_secondary_name = filters.CharFilter(field_name="category_secondary__name", lookup_expr="icontains")
    tag = filters.CharFilter(method="filter_tags")
    date_from = filters.DateTimeFilter(field_name="date_posted", lookup_expr="gte")
    date_to = filters.DateTimeFilter(field_name="date_posted", lookup_expr="lte")
    min_algo_rating = filters.NumberFilter(field_name="algo_rating", lookup_expr="gte")
    max_algo_rating = filters.NumberFilter(field_name="algo_rating", lookup_expr="lte")
    search_title = filters.CharFilter(method="filter_search_title")
    min_user_rating = filters.NumberFilter(field_name="average_rating", lookup_expr="gte")
    max_user_rating = filters.NumberFilter(field_name="average_rating", lookup_expr="lte")
    min_clicks_count = filters.NumberFilter(field_name="clicks_count", lookup_expr="gte")
    max_clicks_count = filters.NumberFilter(field_name="clicks_count", lookup_expr="lte")
    min_source_user_rating = filters.NumberFilter(field_name="source__average_rating", lookup_expr="gte")
    max_source_user_rating = filters.NumberFilter(field_name="source__average_rating", lookup_expr="lte")
    min_source_article_count = filters.NumberFilter(field_name="source__article_count", lookup_expr="gte")
    max_source_article_count = filters.NumberFilter(field_name="source__article_count", lookup_expr="lte")
    min_source_algo_rating = filters.NumberFilter(field_name="source__average_algo_rating", lookup_expr="gte")
    max_source_algo_rating = filters.NumberFilter(field_name="source__average_algo_rating", lookup_expr="lte")
    
    class Meta:
        model = NewsArticle
        fields = [
            "language",
            "source_name",
            "source_id",
            "category_primary_name",
            "category_secondary_name",
            "tag",
            "date_from",
            "date_to",
            "min_algo_rating",
            "max_algo_rating",
            "search_title",
            "min_user_rating",
            "max_user_rating",
            "min_clicks_count",
            "max_clicks_count",
            "min_source_user_rating",
            "max_source_user_rating",
            "min_source_article_count",
            "max_source_article_count",
            "min_source_algo_rating",
            "max_source_algo_rating",
        ]

    def filter_tags(self, queryset, name, value):
        return queryset.filter(
            tag1__icontains=value
            ) | queryset.filter(
            tag2__icontains=value
            ) | queryset.filter(
            tag3__icontains=value
        )

    def filter_search_title(self, queryset, name, value):
        return queryset.filter(
            title__icontains=value
        )



class NewsSourceFilter(filters.FilterSet):
    source_name = filters.CharFilter(field_name="name", lookup_expr="icontains")
    platform = filters.CharFilter(field_name="viaplatform", lookup_expr="icontains")
    min_user_rating = filters.NumberFilter(field_name="average_rating", lookup_expr="gte")
    max_user_rating = filters.NumberFilter(field_name="average_rating", lookup_expr="lte")    
    min_source_algo_rating = filters.NumberFilter(field_name="average_algo_rating", lookup_expr="gte")
    max_source_algo_rating = filters.NumberFilter(field_name="average_algo_rating", lookup_expr="lte")
    min_article_count = filters.NumberFilter(field_name="article_count", lookup_expr="gte")
    max_article_count = filters.NumberFilter(field_name="article_count", lookup_expr="lte")

    class Meta:
        model = NewsSource
        fields = [
            "source_name",
            "platform",
            "min_user_rating",
            "max_user_rating",
            "min_source_algo_rating",
            "max_source_algo_rating",
            "min_article_count",
            "max_article_count",
        ]
 


class CategoryFilter(filters.FilterSet):
    name = filters.CharFilter(field_name="name", lookup_expr="icontains")

    class Meta:
        model = Category 
        fields = [
            "name",
        ]