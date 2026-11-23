from datetime import UTC, datetime, timedelta
import uuid

import jwt
from werkzeug.security import check_password_hash, generate_password_hash

from app.domain.entities.user import User
from app.domain.exceptions import ConfigurationError


class WerkzeugPasswordHasher:
    def hash(self, password: str) -> str:
        return generate_password_hash(password, method="scrypt")

    def verify(self, password: str, password_hash: str) -> bool:
        return check_password_hash(password_hash, password)


class JwtAccessTokenIssuer:
    def __init__(self, *, secret: str | None, issuer: str, ttl_seconds: int) -> None:
        self._secret = secret
        self._issuer = issuer
        self._ttl_seconds = ttl_seconds

    def issue(self, user: User) -> str:
        if not self._secret or len(self._secret) < 32:
            raise ConfigurationError("JWT_SECRET must be configured with at least 32 characters")
        now = datetime.now(UTC)
        payload = {
            "sub": user.id,
            "iss": self._issuer,
            "iat": now,
            "exp": now + timedelta(seconds=self._ttl_seconds),
            "jti": str(uuid.uuid4()),
            "token_type": "access",
        }
        return jwt.encode(payload, self._secret, algorithm="HS256")

    def decode(self, token: str) -> str:
        if not self._secret or len(self._secret) < 32:
            raise ConfigurationError("JWT_SECRET must be configured with at least 32 characters")
        payload = jwt.decode(token, self._secret, algorithms=["HS256"], issuer=self._issuer)
        subject = payload.get("sub")
        if not isinstance(subject, str) or payload.get("token_type") != "access":
            raise jwt.InvalidTokenError("Invalid access token")
        return subject
