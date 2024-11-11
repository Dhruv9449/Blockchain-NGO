# users/management/commands/seed.py

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from ngos.models import NGO
from ngos.utils import create_blockchain_record
from transactions.models import Transaction
from django.utils import timezone
import random


class Command(BaseCommand):
    help = "Seed database with initial data"

    def handle(self, *args, **kwargs):
        self.create_users()
        self.create_ngos()
        self.create_transactions()
        self.stdout.write(self.style.SUCCESS("Database seeded successfully"))

    def create_users(self):
        # if User.objects.exists():
        #     self.stdout.write("Users already seeded.")
        #     return

        # Regular and Admin Users
        users = [
            {"username": "john_doe", "email": "john@example.com", "password": "password123"},
            {"username": "jane_doe", "email": "jane@example.com", "password": "password123"},
            {"username": "ngo_admin_1", "email": "admin1@ngo.com", "password": "password123"},
            {"username": "ngo_admin_2", "email": "admin2@ngo.com", "password": "password123"},
            {"username": "ngo_admin_3", "email": "admin3@ngo.com", "password": "password123"},
        ]
        for user_data in users:
            user = User.objects.create_user(**user_data)
            self.stdout.write(f"Created user: {user.username}")

    def create_ngos(self):
        # if NGO.objects.exists():
        #     self.stdout.write("NGOs already seeded.")
        #     return

        # Get admin users for NGO associations
        admins = {
            "ngo_admin_1": User.objects.get(username="ngo_admin_1"),
            "ngo_admin_2": User.objects.get(username="ngo_admin_2"),
            "ngo_admin_3": User.objects.get(username="ngo_admin_3"),
        }

        # Sample NGO data
        ngos = [
            {
                "name": "Help the Earth",
                "description": "Environmental NGO",
                "certificate_url": "https://example.com/certificates/cert123",
                "admin": admins["ngo_admin_1"],
                "logo_url": "https://example.com/logos/help-the-earth.png",
            },
            {
                "name": "Food for All",
                "description": "Hunger relief NGO",
                "certificate_url": "https://example.com/certificates/cert456",
                "admin": admins["ngo_admin_2"],
                "logo_url": "https://example.com/logos/food-for-all.png",
            },
            {
                "name": "Healthcare for Everyone",
                "description": "Healthcare support NGO",
                "certificate_url": "https://example.com/certificates/cert789",
                "admin": admins["ngo_admin_3"],
                "logo_url": "https://example.com/logos/healthcare-for-everyone.png",
            },
            {
                "name": "Education First",
                "description": "Educational support NGO",
                "certificate_url": "https://example.com/certificates/cert101",
                "admin": admins["ngo_admin_1"],
                "logo_url": "https://example.com/logos/education-first.png",
            },
            {
                "name": "Shelter for All",
                "description": "Homeless support NGO",
                "certificate_url": "https://example.com/certificates/cert112",
                "admin": admins["ngo_admin_2"],
                "logo_url": "https://example.com/logos/shelter-for-all.png",
            },
        ]
        for ngo_data in ngos:
            ngo = NGO.objects.create(**ngo_data)
            self.stdout.write(f"Created NGO: {ngo.name}")

    def create_transactions(self):
        if Transaction.objects.exists():
            self.stdout.write("Transactions already seeded.")
            return

        ngos = list(NGO.objects.all())
        users = list(User.objects.exclude(username__startswith="ngo_admin"))

        for _ in range(20):
            transaction_type = random.choice(["donation", "expense"])
            transaction_data = {
                "user": random.choice(users),
                "ngo": random.choice(ngos),
                "amount": random.randint(50, 2000),
                "transaction_type": transaction_type,
                "description": "Donation" if transaction_type == "donation" else "Expense for services",
                "timestamp": timezone.now(),
            }

            # Create a blockchain record for the transaction
            blockchain_tx_hash = create_blockchain_record(
                amount=transaction_data["amount"],
                transaction_type=transaction_data["transaction_type"],
                ngo_id=transaction_data["ngo"].id,
            )

            if blockchain_tx_hash:
                self.stdout.write(f"Blockchain transaction hash: {blockchain_tx_hash}")
                transaction_data["blockchain_hash"] = blockchain_tx_hash
                transaction = Transaction.objects.create(**transaction_data)
                self.stdout.write(f"Created transaction: {transaction.id} ({transaction.transaction_type})")
