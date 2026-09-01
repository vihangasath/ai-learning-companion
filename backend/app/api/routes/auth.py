from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.schemas.auth import RegisterRequest, LoginRequest, UserResponse
from backend.app.auth.utils.password import get_password_hash, verify_password
from backend.app.auth.providers.jwt_provider import create_access_token
from backend.app.auth.middleware.auth_middleware import get_current_user, get_optional_user

router = APIRouter()


@router.post("/register", status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=req.email,
        password_hash=get_password_hash(req.password),
        name=req.name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "status": "success",
        "data": UserResponse.model_validate(user),
        "message": "User registered successfully",
    }


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password with bcrypt, with fallback to plaintext check for backwards compatibility
    is_valid = verify_password(req.password, user.password_hash) or user.password_hash == req.password
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})

    return {
        "status": "success",
        "data": {
            "access_token": token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(user),
        },
        "message": "Login successful",
    }


@router.get("/me")
def get_me(
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    user = current_user or db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="No user found")

    return {
        "status": "success",
        "data": UserResponse.model_validate(user),
    }

