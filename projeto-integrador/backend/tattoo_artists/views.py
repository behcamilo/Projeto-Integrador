from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from django.contrib.auth import authenticate, get_user_model
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from tatuagem.models import Agenda 

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, AgendaSerializer

TattooArtist = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    # CORREÇÃO: Permite acesso sem autenticação
    permission_classes = [permissions.AllowAny]

class LoginView(APIView):
    # CORREÇÃO: Permite acesso sem autenticação
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        try:
            user = TattooArtist.objects.get(email=email)
        except TattooArtist.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # O Django authenticate usa username por padrão, então pegamos o username do objeto user encontrado
        user = authenticate(username=user.username, password=password)
        
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Gera os tokens JWT
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

class MeView(generics.RetrieveUpdateAPIView): # CORREÇÃO: Permite GET e PATCH/PUT
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class TattooArtistListView(generics.ListAPIView):
    # O queryset deve retornar todos os objetos TattooArtist
    queryset = TattooArtist.objects.all()
    serializer_class = UserSerializer
    # Permite acesso sem autenticação (feed é público)
    permission_classes = [permissions.AllowAny]



class AgendaViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AgendaSerializer

    def get_queryset(self):
        # Filtra para que cada tatuador (usuário logado) só veja sua própria agenda
        return Agenda.objects.filter(tatuador=self.request.user).order_by('data', 'hora_inicio')

    def perform_create(self, serializer):
        # Automaticamente atribui o usuário logado (tatuador) ao campo 'tatuador'
        serializer.save(tatuador=self.request.user) 
        
    # Endpoint customizado para criar um slot VAZIO/DISPONÍVEL rapidamente (Útil para o tatuador)
    ##########@action(detail=False, methods=['post'], url_path='disponibilizar')
    def create_available_slot(self, request):
        """Cria um novo slot de horário com status 'disponivel'."""
        data = request.data
        
        # Cria um payload baseado no seu modelo, definindo o status como 'disponivel'
        payload = {
            'data': data.get('data'),
            'hora_inicio': data.get('hora_inicio'),
            'duracao_minutos': data.get('duracao_minutos', 60), # Default 60 se não enviado
            'status': 'disponivel',
            'cliente_id': None # Nenhum cliente
        }
        
        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        
        # Salva, atribuindo o tatuador logado
        serializer.save(tatuador=self.request.user)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)