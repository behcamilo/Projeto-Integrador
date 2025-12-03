from django.db import models
from django.conf import settings
from django.contrib.auth.hashers import make_password

# Tabela para armazenar os estilos de tatuagem (Pode ser mantida para legado ou removida se não houver outros usos)
class Estilo(models.Model):
    nome = models.CharField(max_length=50)

    def __str__(self):
        return self.nome

# Cliente
class Cliente(models.Model):
    nome = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    telefone = models.CharField(max_length=30, null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/clientes/', null=True, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    
    posts_curtidos = models.ManyToManyField('TatuagemPost', related_name='curtido_por', blank=True)

    def save(self, *args, **kwargs):
        if not self.password.startswith(('pbkdf2_sha256$', 'bcrypt$', 'argon2')):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nome

# Modelo para Postagens de Tatuagem (Feed)
class TatuagemPost(models.Model):
    tatuador = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='posts'
    )
    
    imagem = models.ImageField(
        upload_to='tattoos/', 
        help_text='Imagem principal da tatuagem.'
    )
    
    descricao = models.TextField(blank=True, null=True)
    
    # [ALTERADO] Agora é um texto livre, não mais uma ForeignKey
    estilo = models.CharField(max_length=100, blank=True, null=True)
    
    data_criacao = models.DateTimeField(auto_now_add=True)
    tamanho = models.CharField(max_length=50, blank=True, null=True)
    preco = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    
    tempo_estimado = models.PositiveIntegerField(default=60, help_text="Tempo estimado em minutos")

    def __str__(self):
        return f"Post de {self.tatuador.username} - {self.data_criacao}"

# Agenda do tatuador
class Agenda(models.Model):
    STATUS_CHOICES = [
        ('disponivel', 'Disponível'),
        ('pendente', 'Pendente'),        
        ('reservado', 'Reservado'),      
        ('indisponivel', 'Indisponível'),
    ]

    tatuador = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="agendas")
    cliente = models.ForeignKey(Cliente, on_delete=models.SET_NULL, null=True, blank=True, related_name="agendamentos")
    tatuagem = models.ForeignKey(TatuagemPost, on_delete=models.SET_NULL, null=True, blank=True, related_name="tatuagem")
    
    nome_usuario = models.CharField(max_length=255, null=True, blank=True) 
    
    data = models.DateField()
    hora_inicio = models.TimeField()
    duracao_minutos = models.PositiveIntegerField(default=60)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='disponivel')
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['tatuador', 'data', 'hora_inicio'], name='unique_horario_tatuador')
        ]

    def __str__(self):
        return f"{self.data} {self.hora_inicio} - {self.tatuador} ({self.get_status_display()})"