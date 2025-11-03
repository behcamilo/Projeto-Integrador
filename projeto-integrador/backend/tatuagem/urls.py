from django.urls import path
from .views import (
    TatuagemPostListCreateView, 
    ClientRegisterView, 
    ClientLoginView, 
    ClientProfileView,
    EstiloRegisterView,
    LikePostView, 
    ClientSearchView
)

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

    path("client/search/", ClientSearchView.as_view(), name="client-search"),    
]