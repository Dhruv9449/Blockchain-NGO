from django.db import models
from django.contrib.auth.models import User
from ngos.models import NGO


class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ("donation", "Donation"),
        ("expense", "Expense"),
    )

    ngo = models.ForeignKey(NGO, related_name="transactions", on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="transactions", on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    blockchain_hash = models.CharField(max_length=66)
    proof_url = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    razorpay_order_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=[("pending", "Pending"), ("completed", "Completed"), ("failed", "Failed")],
        default="pending",
    )

    def __str__(self):
        return f"{self.transaction_type} - {self.ngo.name}"

    def save(self, *args, **kwargs):
        if not self.blockchain_hash:
            raise ValueError("Blockchain hash is required")
        super().save(*args, **kwargs)
