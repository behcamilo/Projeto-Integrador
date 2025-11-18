from django.urls import path, include # 1. ADICIONAR INCLUDE
from rest_framework.routers import DefaultRouter # 2. ADICIONAR ROUTER

from .views import (
    TatuagemPostListCreateView, 
    ClientRegisterView, 
    ClientLoginView, 
    ClientProfileView,
    EstiloRegisterView,
    LikePostView,
    AgendaViewSet # 3. IMPORTAR A VIEWSET
)

# 4. CRIAR O ROUTER
router = DefaultRouter()
# Registra a rota: /api/tatuagem/artistas/<artist_id>/agenda/
# O <artist_id> vem do kwargs da view
router.register(r'artistas/(?P<artist_id>\d+)/agenda', AgendaViewSet, basename='agenda-artista')


urlpatterns = [
    # Rotas de Estilo
    path("estilos/", EstiloRegisterView.as_view(), name="estilo-register"),

    # Rotas de Posts (Tatuadores)
    path("posts/", TatuagemPostListCreateView.as_view(), name="post-list-create"),

    # Rotas de Autenticação do Cliente
    path("client/register/", ClientRegisterView.as_view(), name="client-register"),
    path("client/login/", ClientLoginView.as_view(), name="client-login"),
    
    # Rota de Perfil do Cliente
    path("client/<int:client_id>/perfil/", ClientProfileView.as_view(), name="client-profile"),
    
    # Rota de Likes (Para o Cliente curtir/descurtir um post)
    path("posts/<int:post_id>/like/<int:client_id>/", LikePostView.as_view(), name="post-like"),

    # 5. ADICIONAR AS ROTAS DO ROUTER
    path("", include(router.urls)),
]