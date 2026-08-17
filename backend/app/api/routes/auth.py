from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.schemas.auth import RegisterRequest, LoginRequest, UserResponse

router = APIRouter()


@router.post("/register", status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=req.email,
        password_hash=req.password,
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
    if not user or user.password_hash != req.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "status": "success",
        "data": {
            "access_token": "placeholder-token",
            "token_type": "bearer",
        },
        "message": "Login successful",
    }


@router.get("/me")
def get_me(db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="No user found")

    return {
        "status": "success",
        "data": UserResponse.model_validate(user),
    }
