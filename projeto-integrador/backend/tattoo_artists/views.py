from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import authenticate, get_user_model
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer

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