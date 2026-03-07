from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..services.auth import resolve_session


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get("session_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = resolve_session(db, token)
    if user is None:
        raise HTTPException(status_code=401, detail="Session expired or invalid")
    return user
