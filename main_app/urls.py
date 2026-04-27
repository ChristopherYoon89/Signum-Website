from django.urls import path, re_path, include
from . import views
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.contrib.auth import views as auth_views
from rest_framework import routers
from user import views as user_view
from user.forms import CustomLoginForm
from company import views as comp_view
from api_public import views as api_public_view



urlpatterns = [
	
	#### Standard Django URLs ####

	path('', views.home_view, name='home-page'),
	path('register/', user_view.register, name='register-page'),
	path('logout/', auth_views.LogoutView.as_view(template_name='user/logout.html'), name='logout-page'),
	path('logout-page/', user_view.logout_js_page, name='logout-js-page'),
	path('login/', auth_views.LoginView.as_view(authentication_form=CustomLoginForm, template_name='user/login.html'), name='login-page'),
	path('about/', comp_view.about_view, name='about-page'),
	path('faq/', comp_view.faq_view, name='faq-page'),
	path('terms-of-use/', comp_view.termsofuse_view, name='tou-page'),
	path('privacy/', comp_view.privacy_view, name='privacy-page'),
	path('imprint/', comp_view.imprint_view, name='imprint-page'), 
	path('product', comp_view.product_view, name='product-page'),
	path('contact/', comp_view.contact_view, name='contact-page'),
	path('public-api/', comp_view.public_api_view, name='public-api-page'),
	path('public-api-docs/', comp_view.public_api_docs_view, name="public-api-docs-page"),
	path('guidelines/', comp_view.guidelines_view, name="guidelines-page"),
	path('sponsoring/', comp_view.sponsoring_view, name='sponsoring-page'),
	path('donate/', comp_view.donation_view, name='donate-page'), 
	path('release-notes/', comp_view.ReleaseNotesListView.as_view(), name="release-notes-page"),
	path('release-notes/<slug>/', comp_view.ReleaseNoteView.as_view(), name='release-notes-detail-page'),
	re_path(r"^dashboard/.*$", views.home_view),
	path("ckeditor5/", include("django_ckeditor_5.urls")),
	
	#### API URLs for internal usage ####

	path('api/user-info/', views.get_user_info, name='get_user_info'),
    path('api/grouped-articles/', views.HomeArticlesByCategory.as_view(), name='grouped-articles'),
	path('api/mybookmarkedarticles/', views.MyBookmarksView.as_view(), name='api-bookmarks'),
	path('api/mysources/', views.MySourcesView.as_view(), name='api-mysources'),
	path('api/update-profile-image/', user_view.UpdateProfileImageView.as_view(), name='api-imageupdate'),
	path('api/update-userinfo/', user_view.UserViewSet.as_view(), name='userupdate'),
	path('api/update-password/', user_view.UserPasswordViewSet.as_view(), name='api-update-password'),
	path('api/download-user-data/', user_view.UserDataDownload.as_view(), name='download-user-data'),
	path('api/export-data/', user_view.DataExportView.as_view(), name='export-data'),
	path('api/deactivate-user/', user_view.DeactivateUserAccount.as_view(), name="api-deactivate-user"),
	path('api/board-feeds-single/', user_view.GetDataFeedBoardView.as_view(), name='api-board-feeds'),
	path('api/board-feeds/', user_view.GetFeedBoardAllView.as_view(), name='get-user-feed-list'),
	path('api/board-bookmark-feeds-single/', views.GetBookmarkFeedBoardView.as_view(), name='get-bookmark-feed-list-single'),
	path('api/board-bookmark-feeds/', views.GetBookmarkFeedBoardAllView.as_view(), name='get-bookmark-feed-list'),	
	path('api/home-stats-tags/', views.HomeStatsTags.as_view(), name='home-stats-tags'),
	path('api/update-user-settings/', user_view.UpdateUserSettingsView.as_view(), name="update_user_settings"),
	path('api/search-results/', views.SearchResultView.as_view(), name='searchresults'),

	#### Public API urls for internal usage (Dashboard) ####

	path('api/fetch-single-key/', api_public_view.APIKeyEditFetchView.as_view(), name='apikeysingleedit'),
	path('api/generate-new-apikey/', api_public_view.APIKeyGenerateNew.as_view(), name="apikeygenerated"),
	path('api/update-key/', api_public_view.APIKeySaveChanges.as_view(), name='apiupdatekey'),
	path('api/save-new-key/', api_public_view.APIKeySaveNewKey.as_view(), name='apisavenewkey'),
]  

#### API URLs for internal usage ####

router = routers.DefaultRouter()
router.register('api/AllNews', views.AllNewsArticlesViewSet, basename='allnewsarticle')
router.register('api/Category', views.CategoryViewSet, basename='categories')
router.register('api/ArticlesByCategory', views.ArticlesByCategoryViewSet, basename='articlesbycategory')
router.register('api/NewsSources', views.NewsSourceViewSet, basename='newssource')
router.register('api/NewsSourcesAll', views.NewsSourcesAllViewSet, basename='newssourcesall')
router.register('api/NewsAddEditFeedSourcesAll', views.NewsAddEditFeedSourcesAllViewSet, basename='newsfeedsourcesall')
router.register('api/NewsTagsSingle', views.NewsTagsSingleViewSet, basename='newstagssingle')
router.register('api/NewsSourceSingle', views.NewsSourceSingleViewSet, basename='newssourcessingle')
router.register('api/BookmarkFeedUser', views.MyBookmarkFeedView, basename="bookmarkfeeduser")
router.register('api/BookmarkNews', views.BookmarkNewsViewSet, basename='bookmarknews')
router.register('api/UserBookmarks', views.BookmarkNewsUserViewSet, basename="userbookmarks")
router.register('api/UserRating', views.UserRatingViewSet, basename='userrating')
router.register('api/UserClick', views.UserClickViewSet, basename='userclick')
router.register('api/SourceUserFollowToggle', views.UserSourceFollowToggleViewSet, basename='usersourcefollowtoggle')
router.register('api/SourceUserFollowsAll', views.UserSourceFollowUserViewSet, basename='usersourcefollowsall')
router.register('api/UserSettings', user_view.UserSettingsViewSet, basename='usersettings')
router.register('api/SupportContact', user_view.SupportContactViewSet, basename='supportcontact')
router.register('api/DashboardUserFeed', user_view.UserFeedViewSet, basename='dashboarduserfeed')
router.register('api/FeedsAll', user_view.UserFeedsAllViewset, basename='feedsall')
router.register('api/FeedSingle', user_view.UserFeedSingleViewset, basename='singlefeed')
router.register('api/FeedsAllSettings', user_view.UserFeedsAllSettingsViewset, basename='feedsallsettings')
router.register('api/BookmarkFeedsAllSettings', views.UserBookmarkFeedsAllSettingsViewset, basename='bookmarkallsettings')

#### Public API URLs for internal usage (Dashboard) ####

router.register('api/APIClientUser', api_public_view.APIClientUserViewSet, basename='apiclientuser')
router.register('api/APIKeyAllUser', api_public_view.APIKeyAllUserViewSet, basename='apikeyalluser')

#### Public API URLs for public API

router.register('api/public/news-articles', api_public_view.PublicNewsArticleViewSet, basename='apipublicnewsarticles') 
router.register('api/public/news-sources', api_public_view.PublicNewsSourceViewSet, basename="apipublicnewssources")
router.register('api/public/news-categories', api_public_view.PublicCategoryViewSet, basename="apipubliccategories")


urlpatterns += router.urls
urlpatterns += staticfiles_urlpatterns()

