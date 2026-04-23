from rest_framework.pagination import PageNumberPagination



class PublicNewsArticlePagination(PageNumberPagination):
    page_size = 30  # default page size for the public API
    page_size_query_param = "page_size"  # allow clients to override
    max_page_size = 100  # limit maximum page size



class PublicNewsSourcePagination(PageNumberPagination):
    page_size=30
    page_size_query_param = "page_size"
    max_page_size = 100

