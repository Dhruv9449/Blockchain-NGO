from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/users/", include("users.urls")),  # User-related URLs
    path("api/ngos/", include("ngos.urls")),  # NGO-related URLs
    path("api/transactions/", include("transactions.urls")),  # Transaction-related URLs
]
