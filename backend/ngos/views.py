from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import NGO
from .utils import create_blockchain_record
from transactions.models import Transaction


class ListNGOsView(APIView):
    def get(self, request):
        ngos = NGO.objects.all()
        ngos_data = [{"id": ngo.id, "name": ngo.name} for ngo in ngos]
        return Response(ngos_data, status=status.HTTP_200_OK)


class NGODetailView(APIView):
    def get(self, request, ngo_id):
        try:
            ngo = NGO.objects.get(id=ngo_id)
            ngo_data = {
                "name": ngo.name,
                "logo_url": ngo.logo_url,
                "certificate_url": ngo.certificate_url,
                "admin": ngo.admin.username,
            }

            # Get the financials (incoming donations and outgoing expenses)
            incoming = Transaction.objects.filter(ngo=ngo, transaction_type="donation")
            outgoing = Transaction.objects.filter(ngo=ngo, transaction_type="expense")

            financial_data = {
                "incoming": [
                    {"amount": tx.amount, "user": tx.user.username, "blockchain_hash": tx.blockchain_hash}
                    for tx in incoming
                ],
                "outgoing": [
                    {"amount": tx.amount, "proof_url": tx.proof_url, "blockchain_hash": tx.blockchain_hash}
                    for tx in outgoing
                ],
            }

            return Response({**ngo_data, **financial_data}, status=status.HTTP_200_OK)

        except NGO.DoesNotExist:
            return Response({"error": "NGO not found"}, status=status.HTTP_404_NOT_FOUND)


class DonateToNGOView(APIView):
    def post(self, request, ngo_id):
        ngo = NGO.objects.get(id=ngo_id)
        amount = request.data.get("amount")

        # Create transaction on blockchain
        transaction_hash = create_blockchain_record(amount, "donation", ngo.id)

        if transaction_hash:
            # Save transaction in DB
            transaction = Transaction.objects.create(
                ngo=ngo,
                transaction_type="donation",
                amount=amount,
                blockchain_hash=transaction_hash,
                user=request.user,  # Assuming user is authenticated
            )
            return Response({"transaction_hash": transaction_hash}, status=status.HTTP_201_CREATED)

        return Response(
            {"error": "Failed to record transaction on blockchain"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class OutgoingTransactionView(APIView):
    def post(self, request, ngo_id):
        ngo = NGO.objects.get(id=ngo_id)
        amount = request.data.get("amount")
        proof_url = request.data.get("proof_url")

        # Create expense on blockchain
        transaction_hash = create_blockchain_record(amount, "expense", ngo.id)

        if transaction_hash:
            # Save transaction in DB
            transaction = Transaction.objects.create(
                ngo=ngo,
                transaction_type="expense",
                amount=amount,
                blockchain_hash=transaction_hash,
                proof_url=proof_url,
                user=request.user,  # Assuming user is authenticated
            )
            return Response({"transaction_hash": transaction_hash}, status=status.HTTP_201_CREATED)

        return Response(
            {"error": "Failed to record transaction on blockchain"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class IncomingTransactionView(APIView):
    def get(self, request, ngo_id):
        incoming = Transaction.objects.filter(ngo_id=ngo_id, transaction_type="donation")
        incoming_data = [
            {"amount": tx.amount, "user": tx.user.username, "blockchain_hash": tx.blockchain_hash} for tx in incoming
        ]
        return Response(incoming_data, status=status.HTTP_200_OK)
