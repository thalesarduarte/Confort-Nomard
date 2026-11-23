from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.domain.entities.city import City, CityDetail
from app.domain.repositories.city_repository import CityRepository
from app.infrastructure.database.models import CityModel


class SqlAlchemyCityRepository(CityRepository):
    def __init__(self, session: Session) -> None:
        self._session = session

    @staticmethod
    def _entity(row: CityModel) -> City:
        return City(
            id=str(row.id),
            slug=row.slug,
            name=row.name,
            country=row.country,
            country_code=row.country_code,
            timezone=row.timezone,
            language=row.language,
            currency=row.currency,
            latitude=float(row.latitude) if row.latitude is not None else None,
            longitude=float(row.longitude) if row.longitude is not None else None,
        )

    def list(self, *, query: str = "", limit: int = 50) -> list[City]:
        statement = select(CityModel).order_by(CityModel.name).limit(limit)
        if query:
            pattern = f"%{query.strip()}%"
            statement = statement.where(
                CityModel.name.ilike(pattern) | CityModel.country.ilike(pattern)
            )
        return [self._entity(row) for row in self._session.scalars(statement)]

    def get_by_slug(self, slug: str) -> CityDetail | None:
        statement = (
            select(CityModel)
            .options(selectinload(CityModel.neighborhoods), selectinload(CityModel.climate_records))
            .where(CityModel.slug == slug)
        )
        row = self._session.scalar(statement)
        if row is None:
            return None
        return CityDetail(
            city=self._entity(row),
            tagline=row.tagline,
            neighborhood_count=len(row.neighborhoods),
            climate_month_count=len(row.climate_records),
        )
