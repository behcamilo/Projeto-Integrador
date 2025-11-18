from django.contrib.auth.models import AbstractUser
from django.db import models

class TattooArtist(AbstractUser):
    studio_name = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True)
    
    # NOVO: Campo para a foto de perfil do tatuador
    profile_picture = models.ImageField(
        upload_to='profiles/', 
        null=True, 
        blank=True
    )

    def __str__(self):
        return self.username