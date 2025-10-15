from rest_framework import generics, permissions
from .models import TatuagemPost
from .serializers import TatuagemPostSerializer

# View para listar posts (Feed) e criar novos posts
class TatuagemPostListCreateView(generics.ListCreateAPIView):
    # O queryset deve garantir que os posts sejam ordenados cronologicamente
    queryset = TatuagemPost.objects.all().order_by('-data_criacao')
    serializer_class = TatuagemPostSerializer
    # Permite GET a todos (feed público), mas exige autenticação para POST (criar)
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] 

    def perform_create(self, serializer):
        # O DRF salva o arquivo automaticamente, mas precisamos definir o tatuador
        # como o usuário logado (requer que o usuário esteja autenticado).
        serializer.save(tatuador=self.request.user)