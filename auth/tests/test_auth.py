"""
Auth tests - placeholder
Run: pytest auth/tests/
"""
def test_password_hash():
    from auth.utils.password import get_password_hash, verify_password
    hashed = get_password_hash("test123")
    assert verify_password("test123", hashed)
    assert not verify_password("wrong", hashed)
    print("✅ Auth test passed")

if __name__ == "__main__":
    test_password_hash()
