from rest_framework import serializers
from .models import TatuagemPost, Estilo

class EstiloSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estilo
        fields = '__all__'

class TatuagemPostSerializer(serializers.ModelSerializer):
    # Exibe o username do tatuador (somente leitura)
    tatuador = serializers.ReadOnlyField(source='tatuador.username')
    # Permite enviar o ID do estilo, mas retorna o objeto completo
    estilo = EstiloSerializer(read_only=True)
    estilo_id = serializers.PrimaryKeyRelatedField(
        queryset=Estilo.objects.all(), source='estilo', write_only=True, required=False
    )
    
    # Campo para retornar a URL completa da imagem
    imagem_url = serializers.SerializerMethodField()

    class Meta:
        model = TatuagemPost
        # 'imagem' é o campo que o frontend vai enviar
        fields = ('id', 'tatuador', 'imagem', 'imagem_url', 'descricao', 'estilo', 'estilo_id', 'tamanho', 'preco', 'data_criacao')
        read_only_fields = ('tatuador',)

    # Método que constrói a URL completa (incluindo http://localhost:8000)
    def get_imagem_url(self, obj):
        if obj.imagem:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.imagem.url)
            return obj.imagem.url
        return None