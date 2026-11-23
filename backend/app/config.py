from dataclasses import dataclass
import os


def normalize_database_url(url: str | None) -> str | None:
    if url is None:
        return None
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url.removeprefix("postgres://")
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url.removeprefix("postgresql://")
    return url


@dataclass(frozen=True, slots=True)
class Settings:
    database_url: str | None
    jwt_secret: str | None
    jwt_issuer: str
    access_token_ttl_seconds: int
    cors_origins: tuple[str, ...]
    debug: bool

    @classmethod
    def from_environment(cls) -> "Settings":
        origins = tuple(
            origin.strip()
            for origin in os.getenv(
                "CORS_ORIGINS", "http://127.0.0.1:5173,http://localhost:5173"
            ).split(",")
            if origin.strip()
        )
        ttl = int(os.getenv("ACCESS_TOKEN_TTL_SECONDS", "900"))
        if ttl <= 0:
            raise ValueError("ACCESS_TOKEN_TTL_SECONDS must be a positive integer")
        return cls(
            database_url=normalize_database_url(os.getenv("DATABASE_URL")),
            jwt_secret=os.getenv("JWT_SECRET"),
            jwt_issuer=os.getenv("JWT_ISSUER", "comfort-nomad-api"),
            access_token_ttl_seconds=ttl,
            cors_origins=origins,
            debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
        )
