# Generated by Django 5.0.4 on 2024-11-16 14:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('transactions', '0003_transaction_razorpay_order_id_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='transaction',
            name='stripe_payment_intent_id',
        ),
    ]
