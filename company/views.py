from django.shortcuts import (
      render,
      redirect,
)
from django.views.generic import (
	DetailView,
	ListView,
)
from .models import ReleaseNotes
from .forms import ContactForm
from django.contrib import messages



def about_view(request):
	return render(request, 'company/about.html')



def faq_view(request):
	return render(request, 'company/faq.html')



def contact_view(request):
	return render(request, 'company/contact.html')



def product_view(request):
	return render(request, 'company/product.html')



def sponsoring_view(request):
    return render(request, 'company/sponsoring.html')



def donation_view(request):
	return render(request, 'company/donations.html')



def termsofuse_view(request):
	return render(request, 'company/termsofuse.html')



def privacy_view(request):
    return render(request, 'company/privacy.html')


def imprint_view(request):
    return render(request, 'company/imprint.html')


def public_api_view(request):
    return render(request, 'company/publicapi.html')



def public_api_docs_view(request):
    return render(request, 'company/publicapidocs.html')



def guidelines_view(request):
    return render(request, 'company/guidelines.html')



def contact_view(request):
    if request.method == 'POST':
        l_form = ContactForm(request.POST)
        if l_form.is_valid():
            l_form.save()
            messages.success(request, f'Your message was successfully sent!')
            return redirect('contact-page')
    else:
        l_form = ContactForm()

    context = {
        'l_form': l_form
    }

    return render(request, 'company/contact.html', context)



class ReleaseNotesListView(ListView):
    model = ReleaseNotes
    title = "Release Notes"
    template_name = "company/releasenoteslist.html"
    context_object_name = "release_notes"
    ordering = ['-date_posted']
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['release_notes'] = ReleaseNotes.objects.filter(publish_boolean=True).order_by('-date_posted')
        return context



class ReleaseNoteView(DetailView):
    model = ReleaseNotes
    title = "Release Note"
    template_name = "company/releasenotesdetail.html"
    context_object_name = "release_note"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        release_note = self.object
        context["all_release_notes"] = ReleaseNotes.objects.filter(publish_boolean=True).exclude(pk=release_note.pk).order_by("-date_posted")[:3]
        return context


