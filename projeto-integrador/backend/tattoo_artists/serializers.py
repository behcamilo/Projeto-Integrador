from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

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
        fields = ('id', 'username', 'email', 'studio_name', 'bio')
