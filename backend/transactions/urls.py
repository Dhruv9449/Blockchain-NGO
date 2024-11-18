from django.urls import path
from .views import TransactionDetailView, CreateOrderView, PaymentVerificationView, TransactionListView

urlpatterns = [
    path("<int:transaction_id>/", TransactionDetailView.as_view(), name="transaction_detail"),
    path("create-order/<int:ngo_id>/", CreateOrderView.as_view(), name="create_order"),
    path("payment/verify/", PaymentVerificationView.as_view(), name="verify_payment"),
    path("list/", TransactionListView.as_view(), name="transaction_list"),
]
