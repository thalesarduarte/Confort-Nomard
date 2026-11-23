from app.domain.entities.city import CityDetail
from app.domain.exceptions import NotFoundError
from app.domain.repositories.city_repository import CityRepository


class ListCities:
    def __init__(self, repository: CityRepository) -> None:
        self._repository = repository

    def execute(self, *, query: str = "", limit: int = 50):
        return self._repository.list(query=query, limit=limit)


class GetCity:
    def __init__(self, repository: CityRepository) -> None:
        self._repository = repository

    def execute(self, slug: str) -> CityDetail:
        city = self._repository.get_by_slug(slug)
        if city is None:
            raise NotFoundError("City not found")
        return city
