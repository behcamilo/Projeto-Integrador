from django.urls import path
from .views import RegisterView, LoginView, MeView, TattooArtistListView, AgendaViewSet

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"), #
    path("login/", LoginView.as_view(), name="login"), #
    path("me/", MeView.as_view(), name="me"), #
    # Adicionando a nova rota para o feed/lista de tatuadores
    path("profiles/", TattooArtistListView.as_view(), name="tattoo-artist-list"),

    path("agenda/", AgendaViewSet.as_view({'get': 'list', 'post': 'create'}), name="agenda-list-create"),
    path("agenda/<int:pk>/", AgendaViewSet.as_view({'get': 'retrieve','patch': 'partial_update','delete': 'destroy'}), name="agenda-detail"),
]
