from django.urls import path
from .views import DonateToNGOView, ListNGOsView, NGODetailView, OutgoingTransactionView, IncomingTransactionView

urlpatterns = [
    path("", ListNGOsView.as_view(), name="list_ngos"),
    path("<int:ngo_id>/", NGODetailView.as_view(), name="ngo_detail"),
    path("<int:ngo_id>/donate/", DonateToNGOView.as_view(), name="donate_to_ngo"),
    path("<int:ngo_id>/outgoing/", OutgoingTransactionView.as_view(), name="outgoing_transactions"),
    path("<int:ngo_id>/incoming/", IncomingTransactionView.as_view(), name="incoming_transactions"),
]
