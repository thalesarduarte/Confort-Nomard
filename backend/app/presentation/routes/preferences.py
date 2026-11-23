from flask import Blueprint, current_app, jsonify, request
from sqlalchemy.orm import Session, sessionmaker

from app.application.use_cases.preferences import GetPreferences, UpdatePreferences
from app.domain.exceptions import ConfigurationError
from app.infrastructure.repositories.sqlalchemy_user_repository import SqlAlchemyUserRepository
from app.presentation.authentication import authenticated_user_id

preferences_blueprint = Blueprint("preferences", __name__)


def _session_factory() -> sessionmaker[Session]:
    factory = current_app.extensions.get("session_factory")
    if factory is None:
        raise ConfigurationError("DATABASE_URL must be configured for preference endpoints")
    return factory


@preferences_blueprint.get("/preferences")
def get_preferences():
    user_id = authenticated_user_id()
    with _session_factory()() as session:
        values = GetPreferences(SqlAlchemyUserRepository(session)).execute(user_id)
    return jsonify({"data": values})


@preferences_blueprint.put("/preferences")
def update_preferences():
    user_id = authenticated_user_id()
    values = request.get_json(silent=True)
    if not isinstance(values, dict):
        return jsonify({"error": {"code": "invalid_input", "message": "A JSON object is required"}}), 400
    with _session_factory().begin() as session:
        updated = UpdatePreferences(SqlAlchemyUserRepository(session)).execute(user_id, values)
    return jsonify({"data": updated})
