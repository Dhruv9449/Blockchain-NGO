from django.db import models
from django.contrib.auth.models import User


class NGO(models.Model):
    name = models.CharField(max_length=255)
    logo_url = models.URLField(max_length=200)
    certificate_url = models.URLField(max_length=200)
    admin = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField(blank=True, null=True)
    work_images = models.JSONField(default=list, blank=True, help_text="List of image URLs showing NGO's work")

    def __str__(self):
        return self.name
