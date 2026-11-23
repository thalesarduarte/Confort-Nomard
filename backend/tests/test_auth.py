import unittest

from app.application.use_cases.auth import AuthenticateUser
from app.domain.entities.user import User
from app.domain.exceptions import AuthenticationError


class InactiveUserRepository:
    def get_by_email(self, email: str) -> User | None:
        return User(
            id="user-1",
            email=email,
            name="Nomad",
            locale="pt-BR",
            is_active=False,
        )

    def get_password_hash(self, user_id: str) -> str | None:
        return "hashed-password"


class PasswordVerifier:
    def verify(self, password: str, password_hash: str) -> bool:
        raise AssertionError("Inactive users must be rejected before password verification")


class TokenIssuer:
    def issue(self, user: User) -> str:
        raise AssertionError("Inactive users must not receive an access token")


class AuthenticationUseCaseTests(unittest.TestCase):
    def test_inactive_user_cannot_authenticate(self) -> None:
        use_case = AuthenticateUser(InactiveUserRepository(), PasswordVerifier(), TokenIssuer())
        with self.assertRaises(AuthenticationError):
            use_case.execute(email="nomad@example.test", password="a-long-password")


if __name__ == "__main__":
    unittest.main()
