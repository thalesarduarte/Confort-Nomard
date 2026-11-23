import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.entities.user import User
from app.domain.repositories.user_repository import UserRepository
from app.infrastructure.database.models import UserModel, UserPreferenceProfileModel


class SqlAlchemyUserRepository(UserRepository):
    def __init__(self, session: Session) -> None:
        self._session = session

    @staticmethod
    def _entity(row: UserModel) -> User:
        return User(
            id=str(row.id),
            email=row.email,
            name=row.name,
            locale=row.locale,
            is_active=row.is_active,
        )

    def get_by_email(self, email: str) -> User | None:
        row = self._session.scalar(select(UserModel).where(UserModel.email == email))
        return self._entity(row) if row else None

    def get_by_id(self, user_id: str) -> User | None:
        try:
            parsed_id = uuid.UUID(user_id)
        except ValueError:
            return None
        row = self._session.get(UserModel, parsed_id)
        return self._entity(row) if row else None

    def get_password_hash(self, user_id: str) -> str | None:
        try:
            row = self._session.get(UserModel, uuid.UUID(user_id))
        except ValueError:
            return None
        return row.password_hash if row else None

    def create(self, *, email: str, name: str, password_hash: str, locale: str) -> User:
        row = UserModel(email=email, name=name, password_hash=password_hash, locale=locale)
        row.preferences = UserPreferenceProfileModel()
        self._session.add(row)
        self._session.flush()
        return self._entity(row)

    def get_preferences(self, user_id: str) -> dict[str, object] | None:
        try:
            row = self._session.get(UserPreferenceProfileModel, uuid.UUID(user_id))
        except ValueError:
            return None
        if row is None:
            return None
        return {
            "origin": row.origin,
            "nationality": row.nationality,
            "purpose": row.purpose,
            "monthly_budget": float(row.monthly_budget) if row.monthly_budget is not None else None,
            "budget_currency": row.budget_currency,
            "thermal_preference": row.thermal_preference,
            "comfort_foods": row.comfort_foods,
            "languages": row.languages,
            "work_style": row.work_style,
            "pace": row.pace,
            "stay_months": row.stay_months,
            "safety_priority": row.safety_priority,
            "social_priority": row.social_priority,
            "transit_priority": row.transit_priority,
            "cultural_openness": row.cultural_openness,
            "pillar_weights": row.pillar_weights,
        }

    def update_preferences(self, user_id: str, values: dict[str, object]) -> dict[str, object]:
        profile_id = uuid.UUID(user_id)
        row = self._session.get(UserPreferenceProfileModel, profile_id)
        if row is None:
            row = UserPreferenceProfileModel(user_id=profile_id)
            self._session.add(row)
        for field, value in values.items():
            setattr(row, field, value)
        self._session.flush()
        return self.get_preferences(user_id) or {}
