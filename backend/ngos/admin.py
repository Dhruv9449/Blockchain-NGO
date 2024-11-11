from django.contrib import admin
from .models import NGO


# Register your models here.
@admin.register(NGO)
class NGO(admin.ModelAdmin):
    pass
