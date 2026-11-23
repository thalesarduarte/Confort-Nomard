from collections.abc import Iterator
from contextlib import contextmanager

from sqlalchemy.orm import Session, sessionmaker


@contextmanager
def transactional_session(factory: sessionmaker[Session]) -> Iterator[Session]:
    with factory.begin() as session:
        yield session
