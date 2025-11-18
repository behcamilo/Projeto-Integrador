from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import authenticate, get_user_model
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer

TattooArtist = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

# *** ALTERAÇÃO AQUI ***
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 1. Pega 'username' e 'password' validados
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        # 2. Autentica diretamente (é crucial passar o 'request' também)
        user = authenticate(request, username=username, password=password)
        
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # 3. Gera os tokens JWT
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

class MeView(generics.RetrieveUpdateAPIView): 
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class TattooArtistListView(generics.ListAPIView):
    queryset = TattooArtist.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]