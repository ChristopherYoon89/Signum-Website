
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import (
	APIClient, 
	APIKey,
    APIKeyInternal,
)
import secrets 
import hashlib



def generate_api_key():
	key = secrets.token_hex(32)
	return key 


def hash_api_key(raw_key):
	hashed_key = hashlib.sha256(raw_key.encode()).hexdigest()
	return hashed_key


class APIKeyAuthentication(BaseAuthentication):

    def authenticate(self, request):

        raw_key = request.headers.get("X-API-KEY")

        if not raw_key:
            return None  # no auth attempted

        hashed = hashlib.sha256(raw_key.encode()).hexdigest()

        try:
            api_key = APIKey.objects.select_related("client__user").get(
                key=hashed,
                is_active=True
            )
        except APIKey.DoesNotExist:
            raise AuthenticationFailed("Invalid API key")

        return (api_key.client.user, api_key)



class APIKeyInternalAuthentication(BaseAuthentication):
     
     def authenticate(self, request):
        raw_key = request.headers.get("X-API-Key")

        if not raw_key:
            return None 
        
        hashed = hashlib.sha256(raw_key.encode()).hexdigest()

        try: 
            api_key = APIKeyInternal.objects.select_related("client__user").get(
                key_hashed= hashed,
                is_active=True
            )
        except APIKeyInternal.DoesNotExist:
             raise AuthenticationFailed("Invalid API Key")
    
        return (api_key.client.user, api_key)