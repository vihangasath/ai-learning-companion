"""
Auth tests - Password hashing & JWT verification
Run: python auth/tests/test_auth.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from auth.utils.password import get_password_hash, verify_password
from auth.providers.jwt_provider import create_access_token, decode_token


def test_password_hash():
    hashed = get_password_hash("test123")
    assert verify_password("test123", hashed)
    assert not verify_password("wrong", hashed)
    print("  PASS  Password hashing test")


def test_jwt():
    token = create_access_token({"sub": "user-123", "email": "test@example.com", "role": "student"})
    payload = decode_token(token)
    assert payload is not None
    assert payload.get("sub") == "user-123"
    assert payload.get("email") == "test@example.com"
    assert payload.get("role") == "student"
    print("  PASS  JWT creation & decoding test")


if __name__ == "__main__":
    test_password_hash()
    test_jwt()
    print("All Auth tests passed successfully!")


