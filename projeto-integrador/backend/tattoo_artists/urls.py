from django.urls import path
from .views import RegisterView, LoginView, MeView, TattooArtistListView 

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"), #
    path("login/", LoginView.as_view(), name="login"), #
    path("me/", MeView.as_view(), name="me"), #
    # Adicionando a nova rota para o feed/lista de tatuadores
    path("profiles/", TattooArtistListView.as_view(), name="tattoo-artist-list"),
]
