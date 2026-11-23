from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class City:
    id: str
    slug: str
    name: str
    country: str
    country_code: str
    timezone: str
    language: str
    currency: str
    latitude: float | None = None
    longitude: float | None = None


@dataclass(frozen=True, slots=True)
class CityDetail:
    city: City
    tagline: str | None
    neighborhood_count: int
    climate_month_count: int
