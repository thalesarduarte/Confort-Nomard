from flask import Flask, jsonify
from sqlalchemy.exc import SQLAlchemyError

from app.domain.exceptions import DomainError


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(DomainError)
    def handle_domain_error(error: DomainError):
        return jsonify({"error": {"code": error.code, "message": str(error)}}), error.status_code

    @app.errorhandler(ValueError)
    def handle_invalid_input(error: ValueError):
        return jsonify({"error": {"code": "invalid_input", "message": str(error)}}), 400

    @app.errorhandler(SQLAlchemyError)
    def handle_database_error(_error: SQLAlchemyError):
        app.logger.exception("Database request failed")
        return jsonify({"error": {"code": "database_error", "message": "Database request failed"}}), 503

    @app.errorhandler(500)
    def handle_unexpected_error(_error: Exception):
        app.logger.exception("Unhandled request error")
        return jsonify({"error": {"code": "internal_error", "message": "Internal server error"}}), 500
