"""
Password hashing - FIXED for Python 3.13
Using bcrypt directly instead of passlib (which has bug on 3.13)
"""
import bcrypt

def get_password_hash(password: str) -> str:
    # Bcrypt needs max 72 bytes, truncate safely for hackathon
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False
