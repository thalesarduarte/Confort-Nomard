class DomainError(Exception):
    status_code = 400
    code = "domain_error"


class NotFoundError(DomainError):
    status_code = 404
    code = "not_found"


class ConflictError(DomainError):
    status_code = 409
    code = "conflict"


class AuthenticationError(DomainError):
    status_code = 401
    code = "authentication_failed"


class ConfigurationError(DomainError):
    status_code = 503
    code = "service_not_configured"
