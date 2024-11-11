from web3 import Web3
import os

# Load environment variables (if using environment variables for security)
ACCOUNT_ADDRESS = os.getenv("ACCOUNT_ADDRESS", "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1")
PRIVATE_KEY = os.getenv("PRIVATE_KEY", "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d")

# Connect to Ganache blockchain
w3 = Web3(Web3.HTTPProvider("http://ganache:8545"))

# Check connection to blockchain
if not w3.is_connected():
    raise Exception("Failed to connect to blockchain")


def create_blockchain_record(amount, transaction_type, ngo_id):
    """
    Record a transaction on the blockchain (donation or expense).
    Returns the transaction hash or None if failed.
    """
    try:
        # Check if enough balance is available
        balance = w3.eth.get_balance(ACCOUNT_ADDRESS)
        print(f"Account balance: {balance} wei")

        # Set nonce for transaction
        nonce = w3.eth.get_transaction_count(ACCOUNT_ADDRESS)

        # Set up transaction with reduced values
        transaction_data = {
            "from": ACCOUNT_ADDRESS,
            "to": ACCOUNT_ADDRESS,  # For demonstration, sending to the same account
            "value": w3.to_wei(0.001, "ether"),  # Use a smaller amount
            "gas": 21000,  # Minimum gas limit for a simple transfer
            "gasPrice": w3.to_wei("1", "gwei"),  # Lower gas price
            "nonce": nonce,
        }

        # Sign the transaction
        signed_transaction = w3.eth.account.sign_transaction(transaction_data, PRIVATE_KEY)

        # Send the transaction
        tx_hash = w3.eth.send_raw_transaction(signed_transaction.raw_transaction)

        # Return the transaction hash
        return tx_hash.hex()
    except Exception as e:
        print(f"Error recording transaction: {e}")
        return None
