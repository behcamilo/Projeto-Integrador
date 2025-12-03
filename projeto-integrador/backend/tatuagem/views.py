from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.hashers import check_password
from django.shortcuts import get_object_or_404

from .models import TatuagemPost, Cliente, Estilo, Agenda
from .serializers import TatuagemPostSerializer, ClientRegisterSerializer, ClientLoginSerializer, ClientProfileSerializer, EstiloSerializer, AgendaSerializer

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
        
        if check_password(password, client.password):
            return Response({'client_id': client.id, 'nome': client.nome}) 
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class ClientProfileView(APIView):
    permission_classes = [permissions.AllowAny] 
    
    def get(self, request, client_id, *args, **kwargs):
        client = get_object_or_404(Cliente, pk=client_id)
        serializer = ClientProfileSerializer(client, context={'request': request})
        return Response(serializer.data)

    # ADICIONADO: Método PATCH para atualizar foto (e outros dados)
    def patch(self, request, client_id, *args, **kwargs):
        client = get_object_or_404(Cliente, pk=client_id)
        # 'partial=True' permite enviar apenas o campo avatar
        serializer = ClientProfileSerializer(client, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- VIEWS DE POSTS E LIKES ---

class TatuagemPostListCreateView(generics.ListCreateAPIView):
    queryset = TatuagemPost.objects.all().order_by('-data_criacao')
    serializer_class = TatuagemPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = TatuagemPost.objects.all().order_by('-data_criacao')

        preco_min = self.request.query_params.get('preco_min')
        preco_max = self.request.query_params.get('preco_max')
        estilo_id = self.request.query_params.get('estilo_id')



        if preco_min:
            queryset = queryset.filter(preco__gte=preco_min)

        if preco_max:
            queryset = queryset.filter(preco__lte=preco_max)

        if estilo_id:
            queryset = queryset.filter(estilo__id=estilo_id)   


        return queryset


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
    permission_classes = [permissions.AllowAny]

    def post(self, request, post_id, client_id):
        try:
            post = TatuagemPost.objects.get(pk=post_id)
            client = Cliente.objects.get(pk=client_id)
        except (TatuagemPost.DoesNotExist, Cliente.DoesNotExist):
            return Response({'error': 'Post ou Cliente não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        
        if post in client.posts_curtidos.all():
            client.posts_curtidos.remove(post)
            action = 'unliked'
        else:
            client.posts_curtidos.add(post)
            action = 'liked'
        
        return Response({'status': action, 'total_curtidas': post.curtido_por.count()}, status=status.HTTP_200_OK)

class AgendaViewSet(viewsets.ModelViewSet):
    serializer_class = AgendaSerializer
    permission_classes = [permissions.AllowAny] 

    def get_queryset(self):
        tatuador_id = self.kwargs.get('artist_id')
        if not tatuador_id:
            return Agenda.objects.none()
            
        queryset = Agenda.objects.filter(tatuador_id=tatuador_id)
        date_param = self.request.query_params.get('date')
        if date_param:
            queryset = queryset.filter(data=date_param)
        return queryset.order_by('hora_inicio')

    def perform_create(self, serializer):
        tatuador_id = self.kwargs.get('artist_id')
        serializer.save(tatuador_id=tatuador_id)