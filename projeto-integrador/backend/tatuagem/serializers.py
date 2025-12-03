from rest_framework import serializers
from .models import TatuagemPost, Estilo, Cliente, Agenda
from django.contrib.auth.hashers import check_password, make_password
from django.db.models import Count

class EstiloSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estilo
        fields = '__all__'

class TatuagemPostSerializer(serializers.ModelSerializer):
    tatuador = serializers.ReadOnlyField(source='tatuador.username')
    tatuador_id = serializers.ReadOnlyField(source='tatuador.id')
    tatuador_avatar_url = serializers.SerializerMethodField()
    
    # [ALTERADO] Removido EstiloSerializer e estilo_id. Estilo agora é string simples.
    
    imagem_url = serializers.SerializerMethodField()
    total_curtidas = serializers.SerializerMethodField() 
    curtido = serializers.SerializerMethodField()

    class Meta:
        model = TatuagemPost
        fields = (
            'id', 'tatuador', 'tatuador_id', 'tatuador_avatar_url', 
            'imagem', 'imagem_url', 'descricao', 
            'estilo', # Campo de texto
            'tamanho', 'preco', 'data_criacao', 'curtido', 'total_curtidas',
            'tempo_estimado'
        )
        read_only_fields = ('tatuador',)

    def get_tatuador_avatar_url(self, obj):
        if obj.tatuador and obj.tatuador.profile_picture and hasattr(obj.tatuador.profile_picture, 'url'):
            return obj.tatuador.profile_picture.url
        return None

    def get_imagem_url(self, obj):
        if obj.imagem and hasattr(obj.imagem, 'url'):
            return obj.imagem.url
        return None
        
    def get_total_curtidas(self, obj):
        return obj.curtido_por.count()

    def get_curtido(self, obj):
        # A lógica real de "curtido" depende do request user (cliente), 
        # que geralmente é tratado na View ou aqui se tiver request no context.
        # Por simplificação, retornamos False ou implementamos a checagem se necessário.
        return False

class ClientRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Cliente
        fields = ('id', 'nome', 'email', 'password', 'telefone')

    def create(self, validated_data):
        password = validated_data.pop('password')
        client = Cliente.objects.create(**validated_data)
        client.password = make_password(password)
        client.save(update_fields=['password'])
        return client

class ClientLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class ClientProfileSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    posts_curtidos = serializers.SerializerMethodField()

    class Meta:
        model = Cliente
        fields = ('id', 'nome', 'email', 'telefone', 'avatar', 'avatar_url', 'posts_curtidos')
        extra_kwargs = {
            'avatar': {'write_only': True}
        }

    def get_avatar_url(self, obj):
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return obj.avatar.url
        return None

    def get_posts_curtidos(self, obj):
        posts = obj.posts_curtidos.all()
        return TatuagemPostSerializer(posts, many=True, context=self.context).data

class AgendaSerializer(serializers.ModelSerializer):
    time = serializers.TimeField(source='hora_inicio', format='%H:%M', read_only=True)
    data_hora = serializers.DateTimeField(write_only=True)
    client_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    tatuagem = TatuagemPostSerializer(read_only=True)
    tatuagem_id = serializers.PrimaryKeyRelatedField(
        queryset=TatuagemPost.objects.all(),
        source="tatuagem",
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Agenda
        fields = ('id', 'time', 'status', 'nome_usuario', 'data_hora', 'client_id', 'tatuagem', 'tatuagem_id', 'duracao_minutos')

    def create(self, validated_data):
        data_hora = validated_data.pop('data_hora')
        client_id = validated_data.pop('client_id', None)
        
        validated_data['data'] = data_hora.date()
        validated_data['hora_inicio'] = data_hora.time()
        
        if client_id:
            try:
                validated_data['cliente'] = Cliente.objects.get(id=client_id)
            except Cliente.DoesNotExist:
                pass 

        return super().create(validated_data)

    def update(self, instance, validated_data):
        data_hora = validated_data.pop('data_hora', None)
        if data_hora:
            instance.data = data_hora.date()
            instance.hora_inicio = data_hora.time()
            
        if 'client_id' in validated_data:
            client_id = validated_data.pop('client_id')
            if client_id is None:
                instance.cliente = None 
            else:
                try:
                    instance.cliente = Cliente.objects.get(id=client_id)
                except Cliente.DoesNotExist:
                    instance.cliente = None

        if 'tatuagem' in validated_data:
            instance.tatuagem = validated_data['tatuagem']
        
        if 'duracao_minutos' in validated_data:
            instance.duracao_minutos = validated_data['duracao_minutos']

        instance.status = validated_data.get('status', instance.status)
        instance.nome_usuario = validated_data.get('nome_usuario', instance.nome_usuario)
        instance.save()
        return instance