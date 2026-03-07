import secrets
from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext
from sqlalchemy.orm import Session

from ..config import get_settings
from ..models.session import Session as SessionModel
from ..models.user import User

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_context.verify(plain, hashed)


def create_session(db: Session, user_id: int) -> str:
    settings = get_settings()
    token = secrets.token_hex(32)
    expires_at = datetime.now(timezone.utc) + timedelta(
        hours=settings.session_ttl_hours
    )
    session = SessionModel(user_id=user_id, token=token, expires_at=expires_at)
    db.add(session)
    db.commit()
    return token


def resolve_session(db: Session, token: str) -> User | None:
    now = datetime.now(timezone.utc)
    session = (
        db.query(SessionModel)
        .filter(SessionModel.token == token, SessionModel.expires_at > now)
        .first()
    )
    if session is None:
        return None
    return db.query(User).filter(User.id == session.user_id).first()
