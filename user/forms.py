from django import forms 
from django.contrib.auth.models import User 
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from django_recaptcha.fields import ReCaptchaField
from django_recaptcha.widgets import ReCaptchaV3
import logging 


logger = logging.getLogger(__name__)


class UserRegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)
    captcha = ReCaptchaField(widget=ReCaptchaV3(action='register'))

    class Meta:
        model = User 
        fields = ['username', 'email', 'password1', 'password2', 'captcha']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def clean_email(self):
        email = self.cleaned_data.get('email')
        ip = self.cleaned_data.get("REMOTE_ADDR", "unknown")
        if User.objects.filter(email=email).exists():
            logger.warning(f"Failed registration attempt with={email} ip={ip}, email already exists!")
            raise ValidationError("This email is already in use. Please use a different email address.")
        return email


class CustomLoginForm(AuthenticationForm):
    username = forms.EmailField(label="Email", max_length=254)
    captcha = ReCaptchaField(widget=ReCaptchaV3(action='login'))

    def clean(self):
        email = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')
        ip = self.request.META.get("REMOTE_ADDR", "unknown")
        
        if email and password:
            try:
                user = User.objects.get(email=email)
                self.user_cache = authenticate(self.request, username=user.username, password=password)

                if self.user_cache is None:
                    logger.warning(f"Failed login attempt username={email} ip={ip}")
                    raise forms.ValidationError("Invalid email or password.")
            
            except User.DoesNotExist:
                logger.warning(f"Failed login attempt username={email} ip={ip}")
                raise forms.ValidationError("Invalid email or password")
        
        return self.cleaned_data