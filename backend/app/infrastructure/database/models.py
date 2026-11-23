from datetime import date, datetime
from decimal import Decimal
import uuid

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    JSON,
    Numeric,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.base import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class UserModel(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    locale: Mapped[str] = mapped_column(String(10), default="pt-BR", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    preferences: Mapped["UserPreferenceProfileModel | None"] = relationship(
        back_populates="user", cascade="all, delete-orphan", uselist=False
    )


class UserPreferenceProfileModel(TimestampMixin, Base):
    __tablename__ = "user_preference_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    origin: Mapped[str | None] = mapped_column(String(120))
    nationality: Mapped[str | None] = mapped_column(String(120))
    purpose: Mapped[str] = mapped_column(String(32), default="relocation", nullable=False)
    monthly_budget: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    budget_currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    thermal_preference: Mapped[str] = mapped_column(String(16), default="flexible", nullable=False)
    comfort_foods: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    languages: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    work_style: Mapped[str | None] = mapped_column(String(24))
    pace: Mapped[str] = mapped_column(String(16), default="balanced", nullable=False)
    stay_months: Mapped[int | None] = mapped_column(SmallInteger)
    safety_priority: Mapped[int] = mapped_column(SmallInteger, default=5, nullable=False)
    social_priority: Mapped[int] = mapped_column(SmallInteger, default=5, nullable=False)
    transit_priority: Mapped[int] = mapped_column(SmallInteger, default=5, nullable=False)
    cultural_openness: Mapped[int] = mapped_column(SmallInteger, default=5, nullable=False)
    pillar_weights: Mapped[dict[str, float]] = mapped_column(JSON, default=dict, nullable=False)
    user: Mapped[UserModel] = relationship(back_populates="preferences")


class CityModel(TimestampMixin, Base):
    __tablename__ = "cities"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    country: Mapped[str] = mapped_column(String(120), nullable=False)
    country_code: Mapped[str] = mapped_column(String(2), nullable=False)
    timezone: Mapped[str] = mapped_column(String(64), nullable=False)
    language: Mapped[str] = mapped_column(String(32), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    tagline: Mapped[str | None] = mapped_column(String(300))
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    neighborhoods: Mapped[list["NeighborhoodModel"]] = relationship(
        back_populates="city", cascade="all, delete-orphan"
    )
    cost_records: Mapped[list["CostOfLivingModel"]] = relationship(
        back_populates="city", cascade="all, delete-orphan"
    )
    climate_records: Mapped[list["ClimateDataModel"]] = relationship(
        back_populates="city", cascade="all, delete-orphan"
    )
    food_establishments: Mapped[list["FoodEstablishmentModel"]] = relationship(
        back_populates="city", cascade="all, delete-orphan"
    )
    cultural_insights: Mapped[list["CulturalInsightModel"]] = relationship(
        back_populates="city", cascade="all, delete-orphan"
    )


class NeighborhoodModel(TimestampMixin, Base):
    __tablename__ = "neighborhoods"
    __table_args__ = (UniqueConstraint("city_id", "slug"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    city_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    slug: Mapped[str] = mapped_column(String(120), nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    cost_tier: Mapped[str | None] = mapped_column(String(24))
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    description: Mapped[str | None] = mapped_column(Text)
    city: Mapped[CityModel] = relationship(back_populates="neighborhoods")
    cost_records: Mapped[list["CostOfLivingModel"]] = relationship(back_populates="neighborhood")


class CostOfLivingModel(TimestampMixin, Base):
    __tablename__ = "cost_of_living"
    __table_args__ = (
        CheckConstraint("amount >= 0", name="amount_nonnegative"),
        CheckConstraint("confidence >= 0 AND confidence <= 1", name="confidence_range"),
        Index("ix_cost_city_category_date", "city_id", "category", "effective_date"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    city_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("cities.id", ondelete="CASCADE"), nullable=False
    )
    neighborhood_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("neighborhoods.id", ondelete="SET NULL")
    )
    category: Mapped[str] = mapped_column(String(48), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    effective_date: Mapped[date] = mapped_column(Date, nullable=False)
    source_name: Mapped[str] = mapped_column(String(180), nullable=False)
    source_url: Mapped[str | None] = mapped_column(String(2048))
    confidence: Mapped[Decimal] = mapped_column(Numeric(3, 2), default=Decimal("0.00"), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    city: Mapped[CityModel] = relationship(back_populates="cost_records")
    neighborhood: Mapped[NeighborhoodModel | None] = relationship(back_populates="cost_records")


class ClimateDataModel(TimestampMixin, Base):
    __tablename__ = "climate_data"
    __table_args__ = (
        UniqueConstraint("city_id", "month", "effective_year"),
        CheckConstraint("month >= 1 AND month <= 12", name="month_range"),
        CheckConstraint("confidence >= 0 AND confidence <= 1", name="confidence_range"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    city_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    month: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    effective_year: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    average_min_c: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    average_max_c: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    average_humidity_pct: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    average_rain_mm: Mapped[Decimal | None] = mapped_column(Numeric(7, 2))
    average_sun_hours: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    source_name: Mapped[str] = mapped_column(String(180), nullable=False)
    source_url: Mapped[str | None] = mapped_column(String(2048))
    confidence: Mapped[Decimal] = mapped_column(Numeric(3, 2), default=Decimal("0.00"), nullable=False)
    city: Mapped[CityModel] = relationship(back_populates="climate_records")


class FoodEstablishmentModel(TimestampMixin, Base):
    __tablename__ = "food_establishments"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    city_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    neighborhood_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("neighborhoods.id", ondelete="SET NULL")
    )
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    categories: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    cuisines: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    comfort_food_tags: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    price_level: Mapped[int | None] = mapped_column(SmallInteger)
    currency: Mapped[str | None] = mapped_column(String(3))
    provider: Mapped[str] = mapped_column(String(80), nullable=False)
    provider_record_id: Mapped[str | None] = mapped_column(String(180))
    source_url: Mapped[str | None] = mapped_column(String(2048))
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    city: Mapped[CityModel] = relationship(back_populates="food_establishments")


class CulturalInsightModel(TimestampMixin, Base):
    __tablename__ = "cultural_insights"
    __table_args__ = (
        CheckConstraint("confidence >= 0 AND confidence <= 1", name="confidence_range"),
        Index("ix_cultural_city_status_locale", "city_id", "status", "locale"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    city_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("cities.id", ondelete="CASCADE"), nullable=False
    )
    category: Mapped[str] = mapped_column(String(48), nullable=False)
    locale: Mapped[str] = mapped_column(String(10), default="pt-BR", nullable=False)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    source_name: Mapped[str] = mapped_column(String(180), nullable=False)
    source_url: Mapped[str | None] = mapped_column(String(2048))
    confidence: Mapped[Decimal] = mapped_column(Numeric(3, 2), default=Decimal("0.00"), nullable=False)
    status: Mapped[str] = mapped_column(String(24), default="draft", nullable=False)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    city: Mapped[CityModel] = relationship(back_populates="cultural_insights")
