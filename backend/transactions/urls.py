from django.urls import path
from .views import TransactionDetailView

urlpatterns = [
    path("<int:transaction_id>/", TransactionDetailView.as_view(), name="transaction_detail"),
]
