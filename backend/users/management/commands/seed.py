# users/management/commands/seed.py

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from ngos.models import NGO
from ngos.utils import create_blockchain_record
from transactions.models import Transaction
from django.utils import timezone
import random

# shell script to populate work_images for all NGOs

from ngos.models import NGO

ngo_images = {
    "Help the Earth": [
        "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800",  # Beach cleanup
        "https://images.unsplash.com/photo-1618477202872-89cec6f8d62e?w=800",  # Tree planting
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",  # Plastic cleanup
        "https://images.unsplash.com/photo-1483569577148-f14683bed627?w=800",  # Environmental education
        "https://images.unsplash.com/photo-1493957988430-a5f2e15f39a3?w=800",  # Conservation work
    ],
    "Food for All": [
        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800",  # Food distribution
        "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=800",  # Food bank volunteers
        "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800",  # Community kitchen
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",  # Food donation
        "https://images.unsplash.com/photo-1607113959879-14a1a41c8d66?w=800",  # Meal preparation
    ],
    "Healthcare for Everyone": [
        "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800",  # Medical camp
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800",  # Health checkup
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800",  # Vaccination drive
        "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800",  # Medical supplies
        "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800",  # Healthcare education
    ],
    "Education First": [
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800",  # Classroom teaching
        "https://images.unsplash.com/photo-1522661067900-ab829854a57f?w=800",  # Library program
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",  # Student mentoring
        "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800",  # Computer education
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800",  # Educational workshop
    ],
    "Shelter for All": [
        "https://images.unsplash.com/photo-1518398046578-8cca57782e17?w=800",  # Housing project
        "https://images.unsplash.com/photo-1469022563428-aa04fef9f5a2?w=800",  # Shelter construction
        "https://images.unsplash.com/photo-1573770012830-7c829e5f6a10?w=800",  # Community housing
        "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800",  # Homeless support
        "https://images.unsplash.com/photo-1509059852496-f3822ae057bf?w=800",  # Housing renovation
    ],
}


def populate_work_images():
    ngos = NGO.objects.all()
    for ngo in ngos:
        if ngo.name in ngo_images:
            ngo.work_images = ngo_images[ngo.name]
            ngo.save()
            print(f"Updated work_images for NGO: {ngo.name}")
            print(f"Added {len(ngo_images[ngo.name])} images")


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

        # Sample NGO data with high-quality Unsplash images
        ngos = [
            {
                "name": "Help the Earth",
                "description": "Environmental NGO",
                "certificate_url": "https://example.com/certificates/cert123",
                "admin": admins["ngo_admin_1"],
                "logo_url": "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=400&fit=crop",
            },
            {
                "name": "Food for All",
                "description": "Hunger relief NGO",
                "certificate_url": "https://example.com/certificates/cert456",
                "admin": admins["ngo_admin_2"],
                "logo_url": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=400&fit=crop",
            },
            {
                "name": "Healthcare for Everyone",
                "description": "Healthcare support NGO",
                "certificate_url": "https://example.com/certificates/cert789",
                "admin": admins["ngo_admin_3"],
                "logo_url": "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=400&h=400&fit=crop",
            },
            {
                "name": "Education First",
                "description": "Educational support NGO",
                "certificate_url": "https://example.com/certificates/cert101",
                "admin": admins["ngo_admin_1"],
                "logo_url": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop",
            },
            {
                "name": "Shelter for All",
                "description": "Homeless support NGO",
                "certificate_url": "https://example.com/certificates/cert112",
                "admin": admins["ngo_admin_2"],
                "logo_url": "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400&h=400&fit=crop",
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
