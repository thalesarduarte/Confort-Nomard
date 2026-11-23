import re
from typing import Protocol

from app.domain.entities.user import User
from app.domain.exceptions import AuthenticationError, ConflictError
from app.domain.repositories.user_repository import UserRepository


class PasswordHasher(Protocol):
    def hash(self, password: str) -> str: ...

    def verify(self, password: str, password_hash: str) -> bool: ...


class AccessTokenIssuer(Protocol):
    def issue(self, user: User) -> str: ...


class RegisterUser:
    def __init__(
        self, users: UserRepository, passwords: PasswordHasher, tokens: AccessTokenIssuer
    ) -> None:
        self._users = users
        self._passwords = passwords
        self._tokens = tokens

    def execute(self, *, email: str, name: str, password: str, locale: str) -> tuple[User, str]:
        normalized_email = email.strip().casefold()
        normalized_name = name.strip()
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", normalized_email):
            raise ValueError("A valid email address is required")
        if len(normalized_name) < 2 or len(normalized_name) > 120:
            raise ValueError("Name must contain between 2 and 120 characters")
        if len(password) < 12:
            raise ValueError("Password must contain at least 12 characters")
        if self._users.get_by_email(normalized_email) is not None:
            raise ConflictError("An account with this email already exists")
        user = self._users.create(
            email=normalized_email,
            name=normalized_name,
            password_hash=self._passwords.hash(password),
            locale=locale if locale in {"pt-BR", "en", "es"} else "pt-BR",
        )
        return user, self._tokens.issue(user)


class AuthenticateUser:
    def __init__(
        self, users: UserRepository, passwords: PasswordHasher, tokens: AccessTokenIssuer
    ) -> None:
        self._users = users
        self._passwords = passwords
        self._tokens = tokens

    def execute(self, *, email: str, password: str) -> tuple[User, str]:
        user = self._users.get_by_email(email.strip().casefold())
        password_hash = self._users.get_password_hash(user.id) if user else None
        if (
            user is None
            or not user.is_active
            or password_hash is None
            or not self._passwords.verify(password, password_hash)
        ):
            raise AuthenticationError("Email or password is incorrect")
        return user, self._tokens.issue(user)
