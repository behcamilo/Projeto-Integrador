from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.hashers import check_password

from .models import TatuagemPost, Cliente, Estilo
from .serializers import TatuagemPostSerializer, ClientRegisterSerializer, ClientLoginSerializer, ClientProfileSerializer, EstiloSerializer

# --- VIEWS DE AUTENTICAÇÃO DO CLIENTE ---

class ClientRegisterView(generics.CreateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClientRegisterSerializer
    permission_classes = [permissions.AllowAny]

class ClientLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = ClientLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        try:
            client = Cliente.objects.get(email=email)
        except Cliente.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Verifica a senha usando o hash
        if check_password(password, client.password):
            # NOVO: Aqui, emitimos um token de sessão simples para o cliente
            # Em uma arquitetura real, usaria JWT customizado. Por simplicidade, usamos um token simples.
            # Se você usar sessões no Django, a resposta pode ser ajustada.
            # Vamos retornar o ID do cliente como um "token" temporário para o frontend
            return Response({'client_id': client.id, 'nome': client.nome}) 
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class ClientProfileView(APIView):
    # Permissão para o GET ser feito pelo cliente logado (simplificado pelo ID)
    permission_classes = [permissions.AllowAny] 
    
    def get(self, request, client_id, *args, **kwargs):
        try:
            client = Cliente.objects.get(pk=client_id)
        except Cliente.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        # CORREÇÃO: Garante que o contexto da requisição está sendo passado para o Serializer
        serializer = ClientProfileSerializer(client, context={'request': request})
        return Response(serializer.data)


# --- VIEWS DE POSTS E LIKES ---

class TatuagemPostListCreateView(generics.ListCreateAPIView):
    queryset = TatuagemPost.objects.all().order_by('-data_criacao')
    serializer_class = TatuagemPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] 

    def perform_create(self, serializer):
        serializer.save(tatuador=self.request.user)

class EstiloRegisterView(generics.ListCreateAPIView):
    serializer_class = EstiloSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Estilo.objects.all()
        nome = self.request.query_params.get('nome')

        if nome:
            queryset = queryset.filter(nome__icontains=nome)

        return queryset

class LikePostView(APIView):
    # NOVO: Esta view é para o Cliente curtir ou descurtir um post
    permission_classes = [permissions.AllowAny] # Mude para IsClientAuthenticated se usar tokens

    def post(self, request, post_id, client_id):
        try:
            post = TatuagemPost.objects.get(pk=post_id)
            client = Cliente.objects.get(pk=client_id)
        except (TatuagemPost.DoesNotExist, Cliente.DoesNotExist):
            return Response({'error': 'Post ou Cliente não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        
        # Lógica de curtir/descurtir
        if post in client.posts_curtidos.all():
            client.posts_curtidos.remove(post)
            action = 'unliked'
        else:
            client.posts_curtidos.add(post)
            action = 'liked'
        
        return Response({'status': action, 'total_curtidas': post.curtido_por.count()}, status=status.HTTP_200_OK)