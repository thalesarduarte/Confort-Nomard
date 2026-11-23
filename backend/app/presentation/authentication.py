import jwt
from flask import current_app, request

from app.domain.exceptions import AuthenticationError
from app.infrastructure.security.tokens import JwtAccessTokenIssuer


def authenticated_user_id() -> str:
    header = request.headers.get("Authorization", "")
    scheme, _, token = header.partition(" ")
    if scheme.casefold() != "bearer" or not token:
        raise AuthenticationError("Bearer access token required")
    issuer = JwtAccessTokenIssuer(
        secret=current_app.config.get("JWT_SECRET"),
        issuer=current_app.config["JWT_ISSUER"],
        ttl_seconds=current_app.config["ACCESS_TOKEN_TTL_SECONDS"],
    )
    try:
        return issuer.decode(token)
    except jwt.PyJWTError as error:
        raise AuthenticationError("Access token is invalid or expired") from error
