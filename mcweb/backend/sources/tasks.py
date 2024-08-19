"""
Background tasks for "sources" app
(must be named tasks.py? next to app models.py??)
"""

# standard:
import datetime as dt
import logging
import json
import logging
import traceback

# PyPI:
from background_task import background
from background_task.models import Task, CompletedTask
from feed_seeker import generate_feed_urls
from mcmetadata.feeds import normalize_url
from django.core.management import call_command
from django.contrib.auth.models import User
from django.utils import timezone
#import pandas as pd             # not currently used
import numpy as np

# from sources app:
from .models import Feed, Source, Collection
# emails
from util.send_emails import send_alert_email, send_email


#rss fetcher
from .rss_fetcher_api import RssFetcherApi

ALERT_LOW = 'alert_low'
GOOD = 'good'
ALERT_HIGH = 'alert_high'

# get all of these from config.py (define with defaulting)!!!?
SCRAPE_TIMEOUT_SECONDS = 30     # per HTTP fetch
SCRAPE_FROM_EMAIL = 'noreply@mediacloud.org'

# have this one place, get from config???
ADMIN_USER = 'e.leon@northeastern.edu'

# user to run alerts task under
ALERTS_TASK_USER = ADMIN_USER

SCRAPE_ERROR_USERS = [ADMIN_USER] # maybe include phil?

logger = logging.getLogger(__name__)

# see https://django-background-tasks.readthedocs.io/en/latest/

# @background decorator takes optional arguments:
#       queue='queue-name'
#       schedule=TIME (seconds delay, timedelta, django.utils.timezone.now())
#       name=None (defaults to "module.function")
#       remove_existing_tasks=False
#               if True, all unlocked tasks with the identical task hash
#               (based on task name and args ONLY) will be removed.
#
# calling decorated function schedules a background task, can be passed:
#       verbose_name="description"
#       creator=user (any model object?)
#       repeat=SECONDS, repeat_until=Optional[dt.datetime]
#               available constants for repeat: Task.NEVER, Task.HOURLY,
#               Task.DAILY, Task.WEEKLY, Task.EVERY_2_WEEKS, Task.EVERY_4_WEEKS
# decorated function return value is not saved!
# and returns a background_task.models.Task object.
#
# calling decorated_function.now() invokes decorated function synchronously.

@background()
def _scrape_source(source_id: int, homepage: str, name: str, user_email: str) -> None:
    logger.info(f"==== starting _scrape_source {source_id} ({name}) {homepage} for {user_email}")
    errors = 0
    try:
        email_body = Source._scrape_source(source_id, homepage, name)
    except:
        logger.exception("Source._scrape_source exception in _scrape_source")
        email_body = f"FATAL ERROR:\n{traceback.format_exc()}"
        errors += 1

    recipients = [user_email]
    subject = f"[Media Cloud] Source {source_id} ({name}) scrape complete"
    if errors:
        subject += " (WITH ERRORS)"
        _add_scrape_error_users(recipients)

    send_email(subject, email_body, SCRAPE_FROM_EMAIL, recipients)
    logger.info(f"==== finished _scrape_source {source_id} ({name}) {homepage} for {user_email}")

def _add_scrape_error_users(users: list[str]) -> None:
    """
    take recipents list, add users in SCRAPE_ERROR_USERS in place
    """
    for u in SCRAPE_ERROR_USERS:
        if u not in users:
            users.append(u)

# Phil: this could take quite a while;
# pass queue="slow-lane" to decorator (and run another process_tasks worker in Procfile)??
@background()
def _scrape_collection(collection_id: int, user_email: str) -> None:
    logger.info(f"==== starting _scrape_collection({collection_id}) for {user_email}")

    collection = Collection.objects.get(id=collection_id)
    if not collection:
        # now checked in schedule_scrape_collection
        logger.error(f"_scrape_collection collection {collection_id} not found")
        # was _return_error here, but could not be seen! check done in caller.
        return

    sources = collection.source_set.all()
    email_body: list[str] = []  # blocks of output, one per source MUST CONTAIN FINAL NEWLINE
    errors = 0
    for source in sources:
        logger.info(f"== starting Source._scrape_source {source.id} ({source.name}) for collection {collection_id} for {user_email}")
        if source.url_search_string:
            logger.info(f"  Source {source.id} ({source.name}) has url_search_string {source.url_search_string}")
            continue

        try:
            # pass verbose=0 if too much output:
            email_body.append(Source._scrape_source(source.id, source.homepage, source.name))
        except:
            logger.exception(f"Source._scrape_source exception in _scrape_source {source.id}")
            email_body.append(f"ERROR:\n{traceback.format_exc()}") # format_exc has final newline
            errors += 1
        logger.info(f"== finished Source._scrape_source {source.id} {source.name}")

    recipients = [user_email]
    subject = f"[Media Cloud] Collection {collection.id} ({collection.name}) scrape complete"
    if errors:
        subject += " (WITH ERRORS)"
        _add_scrape_error_users(recipients)

    # separate sources with blank lines
    send_email(subject, "\n".join(email_body), SCRAPE_FROM_EMAIL, recipients)

    logger.info(f"==== finished _scrape_collection({collection.id}, {collection.name}) for {user_email}")

# Phil: not used:
#run_at = dt.time(hour=14, minute=32)
## Calculate the number of days until next Friday
#today = dt.date.today()
#days_until_friday = (4 - today.weekday()) % 7
## Calculate the datetime when the task should run
#next_friday = today + dt.timedelta(days=days_until_friday)
#run_datetime = dt.datetime.combine(next_friday, run_at)

def run_alert_system():
    user = User.objects.get(username=ALERTS_TASK_USER)
    with open('mcweb/backend/sources/data/collections-to-monitor.json') as collection_ids:
        collection_ids = collection_ids.read()
        collection_ids = json.loads(collection_ids)

    task = _alert_system(collection_ids,
                        creator= user,
                        verbose_name=f"source alert system {dt.datetime.now()}",
                        remove_existing_tasks=True)
    return _return_task(task)

@background()
def _alert_system(collection_ids):
        sources = set()
        for collection_id in collection_ids:
            try:
                collection = Collection.objects.get(pk=collection_id)
                source_relations = set(collection.source_set.all())
                sources = sources | source_relations
            except:
                print(collection_id)

        with RssFetcherApi() as rss:
        # stories_by_source = rss.stories_by_source() # This will generate tuples with (source_id and stories_per_day)
          
            email="test"
            alert_dict = {
                "high": [],
                "low": [],
                "fixed": []
            }
            no_stories_alert = 0
            low_stories_alert = 0
            high_stories_alert = 0
            fixed_source = 0
            for source in sources:
                stories_fetched = rss.source_stories_fetched_by_day(source.id) 
                # print(stories_fetched)
                counts = [d['stories'] for d in stories_fetched]  # extract the count values
                if not counts:
                    # email += f"\n Source {source.id}: {source.name} is NOT FETCHING STORIES, please check the feeds \n"
                    no_stories_alert += 1
                    source.alerted = True
                    continue
                mean = np.mean(counts) 
                std_dev = np.std(counts)
                
                last_7_days_data = stories_fetched[-7:]
                seven_day_counts = [d['stories'] for d in last_7_days_data]
                mean_last_week = np.mean(seven_day_counts)
                sum_count_week = _calculate_stories_last_week(stories_fetched)  #calculate the last seven days of stories
                Source.update_stories_per_week(source.id, sum_count_week) 

                alert_status = _classify_alert(mean, mean_last_week, std_dev)

                if alert_status == ALERT_LOW:
                    alert_dict["low"].append(f"Source {source.id}: {source.name} is returning LOWER than usual story volume \n")
                    email += f"Source {source.id}: {source.name} is returning LOWER than usual story volume \n"
                    low_stories_alert += 1
                    source.alerted = True
                elif alert_status == ALERT_HIGH:
                    alert_dict["high"].append(f"Source {source.id}: {source.name} is returning HIGHER than usual story volume \n")
                    email += f"Source {source.id}: {source.name} is returning HIGHER than usual story volume \n"
                    high_stories_alert += 1
                    source.alerted = True
                else:
                    if source.alerted:
                         alert_dict["fixed"].append(f"Source {source.id}: {source.name} was alerting before and is now fixed \n")
                         fixed_source += 1
                         source.alerted = False
                    logger.info(f"=====Source {source.name} is ingesting at regular levels")
                # stories_published = rss.source_stories_published_by_day(source.id)
                # counts_published = [d['count'] for d in stories_published] 
                # mean_published = np.mean(counts_published)  
                # std_dev_published = np.std(counts_published)
                source.save()  
            print(alert_dict)
            if(email):
                # email += f"NOT FETCHING STORIES count = {no_stories_alert} \n"
                email += f"HIGH ingestion alert count = {high_stories_alert} \n"
                email += f"LOW ingestion alert count = {low_stories_alert} \n"
                email += f"FIXED source count = {fixed_source} \n"
                send_alert_email(alert_dict)

def _classify_alert(month_mean, week_mean, std_dev):
    lower_range = std_dev * 1.5
    upper_range = std_dev * 2
    lower = month_mean - lower_range
    upper = month_mean + upper_range 
    if week_mean < lower:
        return ALERT_LOW
    elif week_mean > upper:
        return ALERT_HIGH
    elif week_mean > lower and week_mean < upper:
        return GOOD

def update_stories_per_week():
    user = User.objects.get(username='e.leon@northeastern.edu')

    task = _update_stories_counts(
                        creator= user,
                        verbose_name=f"update stories per week {dt.datetime.now()}",
                        remove_existing_tasks=True)
    return _return_task(task)

@background()
def _update_stories_counts():

        with RssFetcherApi() as rss:
            stories_by_source = rss.stories_by_source() # This will generate tuples with (source_id and stories_per_day)
            for source_tuple in stories_by_source:
                source_id, stories_per_day = source_tuple
                print(source_id, stories_per_day)
                weekly_count = int(stories_per_day * 7)
                print(weekly_count)
                Source.update_stories_per_week(int(source_id), weekly_count)

            

def _calculate_stories_last_week(stories_fetched):
    """
    helper to calculate update stories per week count by fetching last 7 days count from stories_fetched
    """
    last_7_days_data = stories_fetched[-7:]
    sum_count = sum(day_data['stories'] for day_data in last_7_days_data)
    return sum_count

def _serialize_task(task):
    """
    helper to return JSON representation of a Task.
    """
    # probably should return a subset of fields?
    # (or provide a serializer?)
    return { key: (value.isoformat() if isinstance(value, dt.datetime) else value)
             for key, value in task.__dict__.items() if key[0] != '_' }

_serialize_completed_task = _serialize_task

def _return_error(message):
    """
    helper to return JSON representation for an error
    """
    logger.info(f"_return_error {message}")
    return {'error': message}

def _return_task(task):
    """
    formulate "task" return (analagous to _return_error)
    returns dict that "task" with serialized task
    """
    return {'task': _serialize_task(task)}

def schedule_scrape_collection(collection_id, user):
    """
    call this function from a view action to schedule a (re)scrape for a collection
    """
    collection = Collection.objects.get(id=collection_id)
    if not collection:
        return _return_error(f"collection {collection_id} not found")

    name_or_id = collection.name or str(collection_id)
    task = _scrape_collection(collection_id, user.email, creator=user, verbose_name=f"rescrape collection {name_or_id}", remove_existing_tasks=True)

    return _return_task(task)


def schedule_scrape_source(source_id, user):
    """
    call this function from a view action to schedule a (re)scrape
    """
    source = Source.objects.get(id=source_id)
    if not source:
        return _return_error(f"source {source_id} not found")

    if not source.homepage:
        return _return_error(f"source {source_id} missing homepage")

    if source.url_search_string:
        return _return_error(f"source {source_id} has url_search_string")

    # maybe check if re-scraped recently????

    name_or_home = source.name or source.homepage

    # NOTE! Will remove any other pending scrapes for same source
    # rather than queuing a duplicate; the new user will "steal" the task
    # (leaving no trace of the old one). Returns a Task object.
    task = _scrape_source(source_id, source.homepage, source.name, user.email,
                          creator=user,
                          verbose_name=f"rescrape source {name_or_home}",
                          remove_existing_tasks=True)
    return _return_task(task)



def get_completed_tasks(user):
    """
    return ALL completed tasks.
    If user set, return just tasks for that user.
    """
    tasks = CompletedTask.objects
    if user:
        tasks = tasks.created_by(user)
    return {'completed_tasks': [_serialize_completed_task(task) for task in tasks]}


def get_pending_tasks(user):
    """
    return ALL pending tasks.
    If user set, return just tasks for that user.
    """
    tasks = Task.objects
    if user:
        tasks = tasks.created_by(user)
    return {'tasks': [_serialize_task(task) for task in tasks]}
