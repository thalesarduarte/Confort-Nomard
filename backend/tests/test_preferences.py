import unittest

from app.application.use_cases.preferences import UpdatePreferences
from app.domain.entities.user import User


class InMemoryUsers:
    def __init__(self) -> None:
        self.values: dict[str, object] = {}

    def get_by_email(self, email: str) -> User | None:
        return None

    def get_by_id(self, user_id: str) -> User | None:
        return User(id=user_id, email="nomad@example.test", name="Nomad", locale="pt-BR")

    def get_preferences(self, user_id: str) -> dict[str, object] | None:
        return self.values

    def get_password_hash(self, user_id: str) -> str | None:
        return None

    def create(self, *, email: str, name: str, password_hash: str, locale: str) -> User:
        return User(id="user-1", email=email, name=name, locale=locale)

    def update_preferences(self, user_id: str, values: dict[str, object]) -> dict[str, object]:
        self.values.update(values)
        return dict(self.values)


class PreferenceUseCaseTests(unittest.TestCase):
    def test_rejects_invalid_preferences(self) -> None:
        invalid_payloads: list[dict[str, object]] = [
            {"unsupported": "value"},
            {"safety_priority": True},
            {"monthly_budget": True},
            {"budget_currency": 840},
            {"languages": ["pt-BR", 12]},
            {"stay_months": 0},
            {"pillar_weights": {"cost": 101}},
        ]
        for payload in invalid_payloads:
            with self.subTest(payload=payload), self.assertRaises(ValueError):
                UpdatePreferences(InMemoryUsers()).execute("user-1", payload)

    def test_accepts_valid_preferences(self) -> None:
        result = UpdatePreferences(InMemoryUsers()).execute(
            "user-1",
            {
                "safety_priority": 8,
                "monthly_budget": 2500.0,
                "budget_currency": "EUR",
                "languages": ["pt-BR", "en"],
                "pillar_weights": {"cost": 60, "climate": 40},
            },
        )
        self.assertEqual(result["budget_currency"], "EUR")
        self.assertEqual(result["languages"], ["pt-BR", "en"])


if __name__ == "__main__":
    unittest.main()
