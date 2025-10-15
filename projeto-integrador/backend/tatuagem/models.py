from django.db import models
from django.conf import settings # Importar settings para referenciar o Custom User Model

# Tabela para armazenar os estilos de tatuagem
class Estilo(models.Model):
    nome = models.CharField(max_length=50)

    def __str__(self):
        return self.nome


# Cliente
class Cliente(models.Model):
    nome = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    telefone = models.CharField(max_length=30, null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/clientes/', null=True, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome


# O MODELO TATUADOR FOI REMOVIDO PARA ELIMINAR O CONFLITO.
# O modelo de usuário principal é 'tattoo_artists.TattooArtist'.

# Agenda do tatuador
class Agenda(models.Model):
    STATUS_CHOICES = [
        ('disponivel', 'Disponível'),
        ('pendente', 'Pendente'),        
        ('reservado', 'Reservado'),      
        ('indisponivel', 'Indisponível'),
    ]

    # CORREÇÃO: Referenciar o Custom User Model TattooArtist via settings
    tatuador = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="agendas")
    cliente = models.ForeignKey(Cliente, on_delete=models.SET_NULL, null=True, blank=True, related_name="agendamentos")
    data = models.DateField()
    hora_inicio = models.TimeField()
    duracao_minutos = models.PositiveIntegerField(default=60)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='disponivel')
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        # evita duplicidade exata de horários para o mesmo tatuador
        constraints = [
            models.UniqueConstraint(fields=['tatuador', 'data', 'hora_inicio'], name='unique_horario_tatuador')
        ]

    def __str__(self):
        return f"{self.data} {self.hora_inicio} - {self.tatuador} ({self.get_status_display()})"


# NOVO: Modelo para Postagens de Tatuagem (Feed)
class TatuagemPost(models.Model):
    # O tatuador que fez a postagem (ligado ao modelo de usuário TattooArtist)
    tatuador = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='posts'
    )
    
    # Campo para a imagem da tatuagem
    imagem = models.ImageField(
        upload_to='tattoos/', 
        help_text='Imagem principal da tatuagem.'
    )
    
    descricao = models.TextField(blank=True, null=True)
    estilo = models.ForeignKey(Estilo, on_delete=models.SET_NULL, null=True, blank=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    
    # Campos para o layout do feed (Tamanho e Preço)
    tamanho = models.CharField(max_length=50, blank=True, null=True)
    preco = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"Post de {self.tatuador.username} - {self.data_criacao}"