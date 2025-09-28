from django.db import models

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


# Tatuador
class Tatuador(models.Model):
    nome_tatuador = models.CharField(max_length=150)
    nome_estudio = models.CharField(max_length=150, null=True, blank=True)
    localizacao = models.CharField(max_length=150, null=True, blank=True)
    estilos = models.ManyToManyField(Estilo, blank=True)  # múltiplos estilos
    experiencia = models.PositiveIntegerField(null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/tatuadores/', null=True, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.nome_estudio:
            return f"{self.nome_tatuador} ({self.nome_estudio})"
        return self.nome_tatuador


# Agenda do tatuador
class Agenda(models.Model):
    STATUS_CHOICES = [
        ('disponivel', 'Disponível'),
        ('pendente', 'Pendente'),        # cliente solicitou, aguardando confirmação
        ('reservado', 'Reservado'),      # confirmado
        ('indisponivel', 'Indisponível'), # tatuador bloqueou o horário
    ]

    tatuador = models.ForeignKey(Tatuador, on_delete=models.CASCADE, related_name="agendas")
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
