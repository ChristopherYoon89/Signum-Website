
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import (
	PublicAPIClient, 
	PublicAPIKey,
    PublicAPIKeyInternal,
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
            public_api_key = PublicAPIKey.objects.select_related("client__user").get(
                key=hashed,
                is_active=True
            )
        except PublicAPIKey.DoesNotExist:
            raise AuthenticationFailed("Invalid API key")

        return (public_api_key.client.user, public_api_key)



class APIKeyInternalAuthentication(BaseAuthentication):
     
     def authenticate(self, request):
        raw_key = request.headers.get("X-API-Key")

        if not raw_key:
            return None 
        
        hashed = hashlib.sha256(raw_key.encode()).hexdigest()

        try: 
            public_api_key = PublicAPIKeyInternal.objects.select_related("client__user").get(
                key_hashed= hashed,
                is_active=True
            )
        except PublicAPIKeyInternal.DoesNotExist:
             raise AuthenticationFailed("Invalid API Key")
    
        return (public_api_key.client.user, public_api_key)