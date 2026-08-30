"""
Auth Middleware - Dependency for protected routes
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database.connection import get_db
from backend.app.models.user import User
from auth.providers.jwt_provider import decode_token


security_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise credentials_exception

    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise credentials_exception

    sub = payload.get("sub")
    email = payload.get("email")
    if not sub and not email:
        raise credentials_exception

    user = None
    if sub:
        user = db.query(User).filter(User.id == sub).first()
        if not user:
            user = db.query(User).filter(User.email == sub).first()
    if not user and email:
        user = db.query(User).filter(User.email == email).first()

    if user is None:
        raise credentials_exception
    return user


def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User | None:
    if credentials is None:
        return None
    try:
        return get_current_user(credentials=credentials, db=db)
    except HTTPException:
        return None

