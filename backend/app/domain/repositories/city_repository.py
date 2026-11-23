from typing import Protocol

from app.domain.entities.city import City, CityDetail


class CityRepository(Protocol):
    def list(self, *, query: str = "", limit: int = 50) -> list[City]: ...

    def get_by_slug(self, slug: str) -> CityDetail | None: ...
