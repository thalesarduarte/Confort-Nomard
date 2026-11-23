from flask import Blueprint, current_app, jsonify, request
from sqlalchemy.orm import Session, sessionmaker

from app.application.use_cases.auth import AuthenticateUser, RegisterUser
from app.domain.exceptions import ConfigurationError
from app.infrastructure.repositories.sqlalchemy_user_repository import SqlAlchemyUserRepository
from app.infrastructure.security.tokens import JwtAccessTokenIssuer, WerkzeugPasswordHasher

auth_blueprint = Blueprint("auth", __name__)


def _session_factory() -> sessionmaker[Session]:
    factory = current_app.extensions.get("session_factory")
    if factory is None:
        raise ConfigurationError("DATABASE_URL must be configured for authentication")
    return factory


def _token_issuer() -> JwtAccessTokenIssuer:
    return JwtAccessTokenIssuer(
        secret=current_app.config.get("JWT_SECRET"),
        issuer=current_app.config["JWT_ISSUER"],
        ttl_seconds=current_app.config["ACCESS_TOKEN_TTL_SECONDS"],
    )


def _payload() -> dict[str, object]:
    value = request.get_json(silent=True)
    if not isinstance(value, dict):
        raise ValueError("A JSON object is required")
    return value


@auth_blueprint.post("/register")
def register():
    payload = _payload()
    try:
        with _session_factory().begin() as session:
            user, token = RegisterUser(
                SqlAlchemyUserRepository(session), WerkzeugPasswordHasher(), _token_issuer()
            ).execute(
                email=str(payload.get("email", "")),
                name=str(payload.get("name", "")),
                password=str(payload.get("password", "")),
                locale=str(payload.get("locale", "pt-BR")),
            )
    except ValueError as error:
        return jsonify({"error": {"code": "invalid_input", "message": str(error)}}), 400
    return jsonify({"data": {"accessToken": token, "user": {"id": user.id, "email": user.email, "name": user.name, "locale": user.locale}}}), 201


@auth_blueprint.post("/login")
def login():
    payload = _payload()
    with _session_factory().begin() as session:
        user, token = AuthenticateUser(
            SqlAlchemyUserRepository(session), WerkzeugPasswordHasher(), _token_issuer()
        ).execute(email=str(payload.get("email", "")), password=str(payload.get("password", "")))
    return jsonify({"data": {"accessToken": token, "user": {"id": user.id, "email": user.email, "name": user.name, "locale": user.locale}}})
