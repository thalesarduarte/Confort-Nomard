from app.domain.exceptions import NotFoundError
from app.domain.repositories.user_repository import UserRepository

ALLOWED_FIELDS = {
    "origin",
    "nationality",
    "purpose",
    "monthly_budget",
    "budget_currency",
    "thermal_preference",
    "comfort_foods",
    "languages",
    "work_style",
    "pace",
    "stay_months",
    "safety_priority",
    "social_priority",
    "transit_priority",
    "cultural_openness",
    "pillar_weights",
}


class GetPreferences:
    def __init__(self, users: UserRepository) -> None:
        self._users = users

    def execute(self, user_id: str) -> dict[str, object]:
        if self._users.get_by_id(user_id) is None:
            raise NotFoundError("User not found")
        return self._users.get_preferences(user_id) or {}


class UpdatePreferences:
    def __init__(self, users: UserRepository) -> None:
        self._users = users

    def execute(self, user_id: str, values: dict[str, object]) -> dict[str, object]:
        if self._users.get_by_id(user_id) is None:
            raise NotFoundError("User not found")
        unknown = set(values) - ALLOWED_FIELDS
        if unknown:
            raise ValueError(f"Unknown preference fields: {', '.join(sorted(unknown))}")
        for field in ("safety_priority", "social_priority", "transit_priority", "cultural_openness"):
            value = values.get(field)
            if value is not None and (type(value) is not int or not 0 <= value <= 10):
                raise ValueError(f"{field} must be an integer between 0 and 10")
        budget = values.get("monthly_budget")
        if budget is not None and (
            type(budget) not in {int, float} or not 0 <= budget <= 1_000_000_000
        ):
            raise ValueError("monthly_budget must be a non-negative number")
        string_limits = {
            "origin": 120,
            "nationality": 120,
            "purpose": 32,
            "budget_currency": 3,
            "thermal_preference": 16,
            "work_style": 24,
            "pace": 16,
        }
        for field, limit in string_limits.items():
            value = values.get(field)
            if value is not None and (not isinstance(value, str) or len(value) > limit):
                raise ValueError(f"{field} must be a string with at most {limit} characters")
        currency = values.get("budget_currency")
        if currency is not None and (
            not isinstance(currency, str)
            or len(currency) != 3
            or not currency.isalpha()
            or not currency.isupper()
        ):
            raise ValueError("budget_currency must be a three-letter uppercase code")
        for field in ("comfort_foods", "languages"):
            value = values.get(field)
            if value is not None and (
                not isinstance(value, list)
                or len(value) > 30
                or any(not isinstance(item, str) or len(item) > 80 for item in value)
            ):
                raise ValueError(f"{field} must be a list of up to 30 short strings")
        stay_months = values.get("stay_months")
        if stay_months is not None and (
            type(stay_months) is not int or not 1 <= stay_months <= 1200
        ):
            raise ValueError("stay_months must be an integer between 1 and 1200")
        weights = values.get("pillar_weights")
        if weights is not None and (
            not isinstance(weights, dict)
            or len(weights) > 20
            or any(
                not isinstance(key, str)
                or type(weight) not in {int, float}
                or not 0 <= weight <= 100
                for key, weight in weights.items()
            )
        ):
            raise ValueError("pillar_weights must map up to 20 names to values between 0 and 100")
        return self._users.update_preferences(user_id, values)
