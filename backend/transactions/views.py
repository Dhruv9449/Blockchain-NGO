from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Transaction
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
import razorpay
from ngos.utils import create_blockchain_record
from django.db import transaction

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


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


class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, ngo_id):
        try:
            amount = int(float(request.data.get("amount")) * 100)  # Convert to paise

            order_data = {
                "amount": amount,
                "currency": "INR",
                "receipt": f"order_rcptid_{ngo_id}_{request.user.id}",
                "notes": {
                    "ngo_id": ngo_id,
                    "user_id": request.user.id,
                },
            }

            order = client.order.create(data=order_data)

            return Response(
                {"order_id": order["id"], "amount": amount, "currency": "INR", "key": settings.RAZORPAY_KEY_ID}
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PaymentVerificationView(APIView):
    @transaction.atomic  # Use Django's transaction management
    def post(self, request):
        try:
            payment_id = request.data.get("razorpay_payment_id")
            order_id = request.data.get("razorpay_order_id")
            signature = request.data.get("razorpay_signature")

            # First verify Razorpay payment
            params_dict = {
                "razorpay_payment_id": payment_id,
                "razorpay_order_id": order_id,
                "razorpay_signature": signature,
            }

            # Verify signature
            client.utility.verify_payment_signature(params_dict)

            # Get payment details
            payment = client.payment.fetch(payment_id)
            amount = float(payment["amount"]) / 100  # Convert from paise to rupees
            ngo_id = payment["notes"]["ngo_id"]

            # Create blockchain record first
            transaction_hash = create_blockchain_record(amount, "donation", ngo_id)

            if not transaction_hash:
                raise ValueError("Failed to create blockchain record")

            # Only create transaction if blockchain record exists
            transaction = Transaction.objects.create(
                ngo_id=ngo_id,
                user_id=payment["notes"]["user_id"],
                amount=amount,
                transaction_type="donation",
                blockchain_hash=transaction_hash,  # Required field
                razorpay_order_id=order_id,
                razorpay_payment_id=payment_id,
                razorpay_signature=signature,
                status="completed",
            )

            return Response(
                {"status": "success", "transaction_id": transaction.id, "blockchain_hash": transaction_hash}
            )

        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Payment verification failed: " + str(e)}, status=status.HTTP_400_BAD_REQUEST)


class TransactionListView(APIView):
    def get(self, request):
        try:
            # Get filter parameters
            user_id = request.query_params.get("user_id")
            min_amount = request.query_params.get("min_amount")
            max_amount = request.query_params.get("max_amount")
            sort_order = request.query_params.get("sort_order", "desc")  # Default to descending

            # Start with all transactions
            transactions = Transaction.objects.all()

            # Apply filters
            if user_id:
                transactions = transactions.filter(user_id=user_id)
            if min_amount:
                transactions = transactions.filter(amount__gte=float(min_amount))
            if max_amount:
                transactions = transactions.filter(amount__lte=float(max_amount))

            # Apply sorting
            sort_field = "-timestamp" if sort_order == "desc" else "timestamp"
            transactions = transactions.order_by(sort_field)

            # Serialize the data
            transaction_data = [
                {
                    "id": tx.id,
                    "ngo": tx.ngo.name,
                    "user": tx.user.username,
                    "transaction_type": tx.transaction_type,
                    "amount": tx.amount,
                    "blockchain_hash": tx.blockchain_hash,
                    "proof_url": tx.proof_url,
                    "timestamp": tx.timestamp,
                }
                for tx in transactions
            ]

            return Response(transaction_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
