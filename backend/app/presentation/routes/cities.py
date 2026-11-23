from flask import Blueprint, current_app, jsonify, request
from sqlalchemy.orm import Session, sessionmaker

from app.application.dtos.city import city_detail, city_summary
from app.application.use_cases.cities import GetCity, ListCities
from app.domain.exceptions import ConfigurationError
from app.infrastructure.repositories.sqlalchemy_city_repository import SqlAlchemyCityRepository

cities_blueprint = Blueprint("cities", __name__)


def _session_factory() -> sessionmaker[Session]:
    factory = current_app.extensions.get("session_factory")
    if factory is None:
        raise ConfigurationError("DATABASE_URL must be configured for city endpoints")
    return factory


@cities_blueprint.get("")
def list_cities():
    query = request.args.get("q", "", type=str).strip()[:120]
    limit = min(max(request.args.get("limit", 50, type=int), 1), 100)
    with _session_factory()() as session:
        cities = ListCities(SqlAlchemyCityRepository(session)).execute(query=query, limit=limit)
    return jsonify({"data": [city_summary(city) for city in cities], "meta": {"count": len(cities)}})


@cities_blueprint.get("/<slug>")
def get_city(slug: str):
    with _session_factory()() as session:
        result = GetCity(SqlAlchemyCityRepository(session)).execute(slug)
    return jsonify({"data": city_detail(result)})
