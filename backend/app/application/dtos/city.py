from app.domain.entities.city import City, CityDetail


def city_summary(city: City) -> dict[str, object]:
    return {
        "id": city.id,
        "slug": city.slug,
        "name": city.name,
        "country": city.country,
        "countryCode": city.country_code,
        "timezone": city.timezone,
        "language": city.language,
        "currency": city.currency,
        "coordinates": {"latitude": city.latitude, "longitude": city.longitude},
    }


def city_detail(detail: CityDetail) -> dict[str, object]:
    return {
        **city_summary(detail.city),
        "tagline": detail.tagline,
        "counts": {
            "neighborhoods": detail.neighborhood_count,
            "climateMonths": detail.climate_month_count,
        },
    }
