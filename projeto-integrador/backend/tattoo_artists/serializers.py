from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from tatuagem.serializers import TatuagemPostSerializer # Importação de outro app

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
    username = serializers.CharField()
    password = serializers.CharField()

class UserSerializer(serializers.ModelSerializer):
    
    posts = serializers.SerializerMethodField()
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = TattooArtist
        fields = ('id', 'username', 'email', 'studio_name', 'bio', 'profile_picture', 'profile_picture_url', 'posts')

    def get_profile_picture_url(self, obj):
        # [ALTERADO] Removido build_absolute_uri.
        if obj.profile_picture and hasattr(obj.profile_picture, 'url'):
            return obj.profile_picture.url
        return None

    def get_posts(self, obj):
        """
        Serializa manualmente os posts do tatuador (obj),
        passando o 'request' do context principal para o serializer aninhado.
        """
        request = self.context.get('request')
        posts = obj.posts.all().order_by('-data_criacao') 
        
        return TatuagemPostSerializer(
            posts, 
            many=True, 
            context={'request': request}
        ).data