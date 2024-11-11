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
    blockchain_hash = models.CharField(max_length=66)  # Ethereum tx hash length
    proof_url = models.URLField(blank=True, null=True)  # URL for proof (expense receipt)
    description = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.ngo.name}"
