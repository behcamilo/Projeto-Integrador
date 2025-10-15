from rest_framework import serializers
from .models import TatuagemPost, Estilo, Cliente
from django.contrib.auth.hashers import check_password
from django.db.models import Count

# Importação local do Serializer de Posts
# Este é um passo crucial para evitar importação circular se o TatuagemPostSerializer for usado em outro lugar.
# No entanto, se o TatuagemPostSerializer precisar do ClientProfileSerializer (o que não é o caso), daria erro.
# Vamos assumir que ClientProfileSerializer precisa do Post Serializer, e mantê-lo definido abaixo.

# --- SERIALIZERS DE POSTS (TatuagemPostSerializer) ---

class EstiloSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estilo
        fields = '__all__'

class TatuagemPostSerializer(serializers.ModelSerializer):
    tatuador = serializers.ReadOnlyField(source='tatuador.username')
    estilo = EstiloSerializer(read_only=True)
    estilo_id = serializers.PrimaryKeyRelatedField(
        queryset=Estilo.objects.all(), source='estilo', write_only=True, required=False
    )
    imagem_url = serializers.SerializerMethodField()
    curtido = serializers.SerializerMethodField()
    total_curtidas = serializers.SerializerMethodField() 

    class Meta:
        model = TatuagemPost
        fields = ('id', 'tatuador', 'imagem', 'imagem_url', 'descricao', 'estilo', 'estilo_id', 'tamanho', 'preco', 'data_criacao', 'curtido', 'total_curtidas')
        read_only_fields = ('tatuador',)

    def get_imagem_url(self, obj):
        if obj.imagem:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.imagem.url)
            return obj.imagem.url
        return None
        
    def get_total_curtidas(self, obj):
        return obj.curtido_por.count()

    def get_curtido(self, obj):
        request = self.context.get('request')
        # CORREÇÃO: Verifica se o cliente está logado via session/id em localStorage
        # Este método depende de como você decide implementar o Auth de Cliente no DRF.
        # Por enquanto, mantemos False por padrão para a listagem pública.
        return False


# --- SERIALIZERS DE AUTENTICAÇÃO E PERFIL DO CLIENTE ---

class ClientRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Cliente
        fields = ('id', 'nome', 'email', 'password', 'telefone')

class ClientLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class ClientProfileSerializer(serializers.ModelSerializer):
    # Serializa os posts curtidos
    posts_curtidos = serializers.SerializerMethodField()

    class Meta:
        model = Cliente
        fields = ('id', 'nome', 'email', 'telefone', 'avatar', 'posts_curtidos')

    # CORREÇÃO: Otimizar o SerializerMethodField para evitar erros de ciclo/runtime
    def get_posts_curtidos(self, obj):
        posts = obj.posts_curtidos.all()
        # Usa o Serializer de Posts para exibir os favoritos
        # Correção: Passa o contexto para resolver a URL da imagem.
        return TatuagemPostSerializer(posts, many=True, context=self.context).data