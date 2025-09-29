from django.contrib.auth.models import AbstractUser
from django.db import models

class TattooArtist(AbstractUser):
    studio_name = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.username
