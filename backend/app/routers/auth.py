from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from ..config import get_settings
from ..database import get_db
from ..models.session import Session as SessionModel
from ..models.user import User
from ..schemas.user import LoginRequest, LoginResponse, UserResponse
from ..services.auth import create_session, resolve_session, verify_password

router = APIRouter(prefix="/api/auth")


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    settings = get_settings()
    user = db.query(User).filter(User.username == body.username).first()
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_session(db, user.id)
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=not settings.debug,
    )
    return LoginResponse(user=UserResponse.model_validate(user))


@router.post("/logout", status_code=204)
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get("session_token")
    if token:
        db.query(SessionModel).filter(SessionModel.token == token).delete()
        db.commit()
    response.delete_cookie(key="session_token")


@router.get("/me", response_model=UserResponse)
def me(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("session_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = resolve_session(db, token)
    if user is None:
        raise HTTPException(status_code=401, detail="Session expired or invalid")
    return UserResponse.model_validate(user)
