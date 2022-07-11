import json
import logging
from django.http import HttpResponse
from django.contrib.auth.models import auth
from django.core import serializers
import humps

logger = logging.getLogger(__name__)


def profile(request):
    if request.user.id is not None:
        data = _serialized_current_user(request)
    else:
        data = json.dumps({'isActive': False})
    return HttpResponse(data, content_type='application/json')


def login(request):
    if request.method == 'POST':
        payload = json.loads(request.body)
        user = auth.authenticate(username=payload.get('username', None),
                                 password=payload.get('password', None))
        if user is not None:
            logger.debug('logged in success')
            auth.login(request, user)
            data = _serialized_current_user(request)
            return HttpResponse(data, content_type='application/json')
        else:
            logger.debug('user does not exist')
            data = json.dumps({'message': "Unable to login"})
            return HttpResponse(data, content_type='application/json', status=403)
    else:
        return HttpResponse(status=405)


def register(request):
    if request.method == 'POST':
        payload = json.loads(request.body)

        first_name = payload.get('first_name', None)
        last_name = payload.get('last_name', None)
        email = payload.get('email', None)
        username = payload.get('username', None)
        password1 = payload.get('password1', None)
        password2 = payload.get('password1', None)

        user = auth.authenticate(first_name=first_name,
                                 last_name=last_name,
                                 email=email,
                                 username=username,
                                 password1=password1,
                                 password2=password2)

        if password1 == password2:

            if user.objects.filter(username=username).exists():
                logger.debug('Username taken')
                data = json.dumps({'message': "Username taken"})
                return HttpResponse(data, content_type='application/json', status=403)

            elif user.objects.filter(email=email).exists():
                logger.debug('Email taken')
                data = json.dumps({'message': "Email taken"})
                return HttpResponse(data, content_type='application/json', status=403)

            else:  # doesn't login because not superuser
                logger.debug('user created')

                created_user = user.create_user(
                    username=username, password=password1, email=email, first_name=first_name, last_name=last_name)

                created_user.save()

                data = json.dumps({'message': "user created"})
                return HttpResponse(data, content_type='application/json', status=200)
        else:
            logging.debug('password not matching')
            data = json.dumps({'message': "password not matching"})
            return HttpResponse(data, content_type='application/json', status=403)
    else:
        return HttpResponse(status=405)


def logout(request):
    logging.debug('logout success')
    auth.logout(request)
    data = json.dumps({'message': "Logged Out"})
    return HttpResponse(data, content_type='application/json')


def _serialized_current_user(request) -> str:
    current_user = request.user
    serialized_data = serializers.serialize('json', [current_user, ])
    data = json.loads(serialized_data)[0]['fields']
    camelcase_data = humps.camelize(data)
    return json.dumps(camelcase_data)
