from collections.abc import Mapping
from typing import cast

from flask import Flask
from flask_cors import CORS
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config import Settings
from app.presentation.errors import register_error_handlers
from app.presentation.routes.auth import auth_blueprint
from app.presentation.routes.cities import cities_blueprint
from app.presentation.routes.health import health_blueprint
from app.presentation.routes.preferences import preferences_blueprint


def create_app(overrides: Mapping[str, object] | None = None) -> Flask:
    settings = Settings.from_environment()
    app = Flask(__name__)
    app.config.from_mapping(
        DATABASE_URL=settings.database_url,
        JWT_SECRET=settings.jwt_secret,
        JWT_ISSUER=settings.jwt_issuer,
        ACCESS_TOKEN_TTL_SECONDS=settings.access_token_ttl_seconds,
        CORS_ORIGINS=settings.cors_origins,
        DEBUG=settings.debug,
    )
    if overrides:
        app.config.update(cast(dict[str, object], dict(overrides)))

    engine: Engine | None = None
    session_factory: sessionmaker[Session] | None = None
    if app.config["DATABASE_URL"]:
        engine = create_engine(app.config["DATABASE_URL"], pool_pre_ping=True)
        session_factory = sessionmaker(bind=engine, expire_on_commit=False)
    app.extensions["database_engine"] = engine
    app.extensions["session_factory"] = session_factory

    origins = app.config["CORS_ORIGINS"]
    if origins:
        CORS(app, resources={r"/api/*": {"origins": origins}})

    app.register_blueprint(health_blueprint, url_prefix="/api/v1")
    app.register_blueprint(auth_blueprint, url_prefix="/api/v1/auth")
    app.register_blueprint(cities_blueprint, url_prefix="/api/v1/cities")
    app.register_blueprint(preferences_blueprint, url_prefix="/api/v1/users/me")
    register_error_handlers(app)
    return app
