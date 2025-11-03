from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from tatuagem.models import Agenda

TattooArtist = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = TattooArtist
        fields = ('id', 'username', 'email', 'password', 'studio_name', 'bio')

    def create(self, validated_data):
        user = TattooArtist.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            studio_name=validated_data.get('studio_name', ''),
            bio=validated_data.get('bio', '')
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = TattooArtist
        # CORREÇÃO: Adiciona 'profile_picture'
        fields = ('id', 'username', 'email', 'studio_name', 'bio', 'profile_picture')


class AgendaSerializer(serializers.ModelSerializer):
    # Campos que podem ser de apenas leitura para o Cliente ou Tatuador (opcional)
    # tatuador = TattooArtistSerializer(read_only=True)
    # cliente = ClientSerializer(read_only=True)

    class Meta:
        model = Agenda
        # Use os nomes dos campos exatos do seu modelo
        fields = [
            'id', 
            'data',              
            'hora_inicio', 
            'duracao_minutos', 
            'status', 
            'criado_em',
            'cliente_id',
            'tatuador_id',
        ]
        # O tatuador será definido pelo usuário logado, então deve ser read-only na criação
        read_only_fields = ['tatuador', 'criado_em']
