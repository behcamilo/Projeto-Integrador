"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static # <-- 1. ADICIONE ESTA IMPORTAÇÃO

urlpatterns = [
    path('admin/', admin.site.urls),
]


urlpatterns += [
    path("api/tattoo/", include("tattoo_artists.urls")),
    # CORREÇÃO: Adicionado o include do app tatuagem
    path("api/tatuagem/", include("tatuagem.urls")), 
]

# 2. ADICIONE ESTE BLOCO NO FINAL DO ARQUIVO
# NOVO: Apenas em modo DEBUG, servimos os arquivos de mídia
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)