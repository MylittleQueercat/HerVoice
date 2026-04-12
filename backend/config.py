from dotenv import load_dotenv
import os

load_dotenv()

XRPL_NODE_URL: str = os.environ["XRPL_NODE_URL"]
FUNDER_WALLET_SEED: str = os.environ["FUNDER_WALLET_SEED"]
CLINIC_WALLET_SEED: str = os.environ["CLINIC_WALLET_SEED"]
CLINIC_WALLET_ADDRESS: str = os.environ["CLINIC_WALLET_ADDRESS"]
DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./hervoice.db")