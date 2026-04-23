Signal	Meaning
algo_rating	your algorithm
average_userrating	crowd opinion
number_of_clicks	popularity
average_source_rating	source credibility


# Filter fields that can be used in api urls 

## Fields for news articles

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

Standard ordering = ["-date_posted"]


## Fields for news sources 

fields = [
	"source_name",
	"platform",
	"min_user_rating",
	"max_user_rating",
]

ordering_fields = [
	"name",
	"viaplatform",
	"average_rating",
]

Standard ordering = ["name"]


## Fields for news categories 

fields = [
	"name",
]

ordering_fields = [
	"id",
	"name"
]

Standard ordering = ["id"]



Example URLs for the public API 

# Get all articles without filters

GET /api/public/articles/


# Filter articles with source name 

GET /api/public/articles/?source_name=bbc


# Filter articles with tags

GET /api/public/articles/?tag=ai


# Filter articles with date range

GET /api/public/articles/?date_from=2025-01-01&date_to=2025-02-01


# Filter article with min algorithm rating 

GET /api/public/articles/?min_rating=0.8


# Filter articles with keywords in news title, tags and source name

GET /api/public/articles/?search=climate


# Filter articles with a combination of filters 

GET /api/public/articles/?source_name=bbc&tag=ai&min_rating=0.5


# Order articles with the newest article first

GET /api/public/articles/?ordering=-date_posted


# Order articles with the oldest articles first

GET /api/public/articles/?ordering=date_posted


# Order articles by the algorithm rating 

GET /api/public/articles/?ordering=-algo_rating


# Combine filter and ordering 

GET /api/public/articles/?source_name=bbc&ordering=-algo_rating


# Multiple ordering fields 

GET /api/public/articles/?ordering=-algo_rating,date_posted


# Use pagination

# Simple pagination 

GET /api/public/news-articles/?page=3

# Request a custom page size:

GET /api/public/news-articles/?page=2&page_size=50

# Combine filters, ordering and custom pagination:

GET /api/public/news-articles/?language=German&min_user_rating=4&page=1&page_size=10&ordering=-clicks_count


# Retrieve individual data points by id 

GET /api/public/news-articles/175/


# Get news sources data 

GET /api/public/news-sources 


# Get category data 

GET /api/public/news-categories




# Set up Redis Server 

## Install redis on Linux

sudo apt update
sudo apt install redis-server


## Start the server 

sudo systemctl start redis


## Test it:

redis-cli ping
# → PONG


## Install Redis Python client 

pip install redis 


Later: move Redis config into settings.py
Use Redis Cloud / managed Redis in production
Add fallback if Redis is down (optional)

Redis logic/high level process

Client request
↓
API key auth
↓
Redis increment (atomic)
↓
return response

(background job)
↓
Redis counters
↓
write to DB



## Test redis synchronization command

python manage.py redissynccommand

## Next step: 
-> Automate the daily sync
-> Set up a cron job or a scheduler (like Celery Beat) to run your redissynccommand every day automatically.
-> Make sure it runs under the correct Python environment and Django project path.
-> Optionally, clear Redis after syncing so that each day starts fresh.

## Cron job in terminal

crontab -e
0 0 * * * /path/to/venv/bin/python /path/to/project/manage.py redissynccommand
0 0 * * * /home/user/venv/bin/python /home/user/project/manage.py redissynccommand


## Move Redis client into settings.py 
-> apirateredisclient.py