from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Transaction


class TransactionDetailView(APIView):
    def get(self, request, transaction_id):
        try:
            transaction = Transaction.objects.get(id=transaction_id)
            transaction_data = {
                "id": transaction.id,
                "ngo": transaction.ngo.name,
                "transaction_type": transaction.transaction_type,
                "amount": transaction.amount,
                "blockchain_hash": transaction.blockchain_hash,
                "proof_url": transaction.proof_url,
            }
            return Response(transaction_data, status=status.HTTP_200_OK)
        except Transaction.DoesNotExist:
            return Response({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)
