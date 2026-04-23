from django import forms 
from .models import (
	ContactRequest,
)
from django_recaptcha.fields import ReCaptchaField
from django_recaptcha.widgets import ReCaptchaV3



class ContactForm(forms.ModelForm):
    """
    Form that allows user to contact me
    """
    name = forms.TextInput()
    email = forms.EmailField()
    subject = forms.TextInput()
    message = forms.Textarea()
    captcha = ReCaptchaField(widget=ReCaptchaV3(action='contact'))

    class Meta:
        model = ContactRequest
        fields = ['name', 'email', 'subject', 'message', 'captcha']


    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['name'].label = 'Name'
        self.fields['email'].label = 'Email'
        self.fields['subject'].label = 'Subject'
        self.fields['message'].label = 'Message'