from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class User:
    id: str
    email: str
    name: str
    locale: str
    is_active: bool = True
