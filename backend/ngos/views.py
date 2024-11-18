from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import NGO
from .utils import create_blockchain_record
from transactions.models import Transaction
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication


class ListNGOsView(APIView):
    def get(self, request):
        ngos = NGO.objects.all()
        ngos_data = [{"id": ngo.id, "name": ngo.name, "logo_url": ngo.logo_url} for ngo in ngos]
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
                "description": ngo.description,
                "work_images": ngo.work_images,
            }

            # Get the financials (donations and expenses)
            donations = Transaction.objects.filter(ngo=ngo, transaction_type="donation")
            expenses = Transaction.objects.filter(ngo=ngo, transaction_type="expense")

            financial_data = {
                "donations": [
                    {
                        "amount": tx.amount,
                        "user": tx.user.username,
                        "blockchain_hash": tx.blockchain_hash,
                        "timestamp": tx.timestamp,
                    }
                    for tx in donations
                ],
                "expenses": [
                    {
                        "amount": tx.amount,
                        "proof_url": tx.proof_url,
                        "blockchain_hash": tx.blockchain_hash,
                        "timestamp": tx.timestamp,
                    }
                    for tx in expenses
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


class NGOAdminView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            print("=== Debug Authentication ===")
            print("User:", request.user)
            print("User is authenticated:", request.user.is_authenticated)
            print("Auth header:", request.headers.get("Authorization"))
            print(
                "Request META:",
                {
                    k: v
                    for k, v in request.META.items()
                    if k.startswith("HTTP_") or k in ["REMOTE_ADDR", "REQUEST_METHOD"]
                },
            )
            print("========================")

            ngo = NGO.objects.get(admin=request.user)
            ngo_data = {
                "id": ngo.id,
                "name": ngo.name,
                "logo_url": ngo.logo_url,
                "certificate_url": ngo.certificate_url,
                "description": ngo.description,
                "work_images": ngo.work_images,
            }
            return Response(ngo_data, status=status.HTTP_200_OK)
        except NGO.DoesNotExist:
            print(f"No NGO found for user {request.user}")
            return Response({"error": "No NGO found for this user"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Error in NGOAdminView: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class NGOUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, ngo_id):
        try:
            ngo = NGO.objects.get(id=ngo_id, admin=request.user)

            # Update fields
            ngo.name = request.data.get("name", ngo.name)
            ngo.description = request.data.get("description", ngo.description)
            ngo.logo_url = request.data.get("logo_url", ngo.logo_url)
            ngo.certificate_url = request.data.get("certificate_url", ngo.certificate_url)
            ngo.work_images = request.data.get("work_images", ngo.work_images)

            ngo.save()
            return Response({"message": "NGO updated successfully"}, status=status.HTTP_200_OK)
        except NGO.DoesNotExist:
            return Response({"error": "NGO not found"}, status=status.HTTP_404_NOT_FOUND)
