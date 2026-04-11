from services.xrpl_service import (
    generate_condition,
    get_funder_wallet,
    get_clinic_wallet,
    default_cancel_after,
)
from xrpl.clients import WebsocketClient
from xrpl.models.transactions import EscrowCreate, EscrowFinish
from xrpl.transaction import submit_and_wait
from config import XRPL_NODE_URL, CLINIC_WALLET_ADDRESS

print("=== Validating crypto-condition encoding ===")

pair = generate_condition()
print(f"fulfillment ({len(pair['fulfillment_hex'])//2} bytes): {pair['fulfillment_hex'][:20]}...")
print(f"condition   ({len(pair['condition_hex'])//2} bytes):   {pair['condition_hex'][:20]}...")

# Assert expected byte lengths
assert len(pair["fulfillment_hex"]) == 72, f"FAIL: fulfillment should be 72 hex chars (36 bytes), got {len(pair['fulfillment_hex'])}"
assert len(pair["condition_hex"]) == 78, f"FAIL: condition should be 78 hex chars (39 bytes), got {len(pair['condition_hex'])}"
print("Byte lengths: OK")

funder = get_funder_wallet()
clinic = get_clinic_wallet()

print("Submitting EscrowCreate (1 XRP)...")
cancel_after = default_cancel_after(10)

with WebsocketClient(XRPL_NODE_URL) as client:
    tx = EscrowCreate(
        account=funder.address,
        amount="1000000",
        destination=CLINIC_WALLET_ADDRESS,
        condition=pair["condition_hex"],
        cancel_after=cancel_after,
    )
    response = submit_and_wait(tx, client, funder)
    result = response.result.get("meta", {}).get("TransactionResult")
    if result != "tesSUCCESS":
        print(f"FAIL: EscrowCreate returned {result}")
        print(response.result)
        exit(1)
    sequence = response.result["Sequence"]
    print(f"EscrowCreate OK: {response.result['hash']}")

print("Submitting EscrowFinish...")
with WebsocketClient(XRPL_NODE_URL) as client:
    tx = EscrowFinish(
        account=clinic.address,
        owner=funder.address,
        offer_sequence=sequence,
        fulfillment=pair["fulfillment_hex"],
        condition=pair["condition_hex"],
    )
    response = submit_and_wait(tx, client, clinic)
    result = response.result.get("meta", {}).get("TransactionResult")
    if result != "tesSUCCESS":
        print(f"FAIL: EscrowFinish returned {result}")
        print(response.result)
        exit(1)
    print(f"EscrowFinish OK: {response.result['hash']}")

print("=== PASSED. Encoding is correct. Safe to proceed. ===")