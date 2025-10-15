from django.urls import path
from .views import TatuagemPostListCreateView

urlpatterns = [
    # Endpoint: POST /api/tatuagem/posts/ para criar um novo post
    # Endpoint: GET /api/tatuagem/posts/ para listar o feed
    path("posts/", TatuagemPostListCreateView.as_view(), name="post-list-create"),
]