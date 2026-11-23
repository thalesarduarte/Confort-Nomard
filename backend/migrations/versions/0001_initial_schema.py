"""Create the initial Comfort Nomad relational schema."""

from alembic import op
import sqlalchemy as sa

revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def _timestamps() -> tuple[sa.Column, sa.Column]:
    return (
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("locale", sa.String(length=10), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        *_timestamps(),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_table(
        "user_preference_profiles",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("origin", sa.String(length=120)),
        sa.Column("nationality", sa.String(length=120)),
        sa.Column("purpose", sa.String(length=32), nullable=False),
        sa.Column("monthly_budget", sa.Numeric(12, 2)),
        sa.Column("budget_currency", sa.String(length=3), nullable=False),
        sa.Column("thermal_preference", sa.String(length=16), nullable=False),
        sa.Column("comfort_foods", sa.JSON(), nullable=False),
        sa.Column("languages", sa.JSON(), nullable=False),
        sa.Column("work_style", sa.String(length=24)),
        sa.Column("pace", sa.String(length=16), nullable=False),
        sa.Column("stay_months", sa.SmallInteger()),
        sa.Column("safety_priority", sa.SmallInteger(), nullable=False),
        sa.Column("social_priority", sa.SmallInteger(), nullable=False),
        sa.Column("transit_priority", sa.SmallInteger(), nullable=False),
        sa.Column("cultural_openness", sa.SmallInteger(), nullable=False),
        sa.Column("pillar_weights", sa.JSON(), nullable=False),
        *_timestamps(),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE", name="fk_user_preferences_user"),
        sa.PrimaryKeyConstraint("user_id", name="pk_user_preference_profiles"),
    )
    op.create_table(
        "cities",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("country", sa.String(length=120), nullable=False),
        sa.Column("country_code", sa.String(length=2), nullable=False),
        sa.Column("timezone", sa.String(length=64), nullable=False),
        sa.Column("language", sa.String(length=32), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("tagline", sa.String(length=300)),
        sa.Column("latitude", sa.Numeric(9, 6)),
        sa.Column("longitude", sa.Numeric(9, 6)),
        *_timestamps(),
        sa.UniqueConstraint("slug", name="uq_cities_slug"),
    )
    op.create_table(
        "neighborhoods",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("city_id", sa.Uuid(), nullable=False),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("cost_tier", sa.String(length=24)),
        sa.Column("latitude", sa.Numeric(9, 6)),
        sa.Column("longitude", sa.Numeric(9, 6)),
        sa.Column("description", sa.Text()),
        *_timestamps(),
        sa.ForeignKeyConstraint(["city_id"], ["cities.id"], ondelete="CASCADE", name="fk_neighborhoods_city"),
        sa.UniqueConstraint("city_id", "slug", name="uq_neighborhood_city_slug"),
    )
    op.create_index("ix_neighborhoods_city_id", "neighborhoods", ["city_id"])
    op.create_table(
        "cost_of_living",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("city_id", sa.Uuid(), nullable=False),
        sa.Column("neighborhood_id", sa.Uuid()),
        sa.Column("category", sa.String(length=48), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("effective_date", sa.Date(), nullable=False),
        sa.Column("source_name", sa.String(length=180), nullable=False),
        sa.Column("source_url", sa.String(length=2048)),
        sa.Column("confidence", sa.Numeric(3, 2), nullable=False),
        sa.Column("notes", sa.Text()),
        *_timestamps(),
        sa.CheckConstraint("amount >= 0", name="ck_cost_amount_nonnegative"),
        sa.CheckConstraint("confidence >= 0 AND confidence <= 1", name="ck_cost_confidence_range"),
        sa.ForeignKeyConstraint(["city_id"], ["cities.id"], ondelete="CASCADE", name="fk_cost_city"),
        sa.ForeignKeyConstraint(["neighborhood_id"], ["neighborhoods.id"], ondelete="SET NULL", name="fk_cost_neighborhood"),
    )
    op.create_index("ix_cost_city_category_date", "cost_of_living", ["city_id", "category", "effective_date"])
    op.create_table(
        "climate_data",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("city_id", sa.Uuid(), nullable=False),
        sa.Column("month", sa.SmallInteger(), nullable=False),
        sa.Column("effective_year", sa.SmallInteger(), nullable=False),
        sa.Column("average_min_c", sa.Numeric(5, 2)),
        sa.Column("average_max_c", sa.Numeric(5, 2)),
        sa.Column("average_humidity_pct", sa.Numeric(5, 2)),
        sa.Column("average_rain_mm", sa.Numeric(7, 2)),
        sa.Column("average_sun_hours", sa.Numeric(5, 2)),
        sa.Column("source_name", sa.String(length=180), nullable=False),
        sa.Column("source_url", sa.String(length=2048)),
        sa.Column("confidence", sa.Numeric(3, 2), nullable=False),
        *_timestamps(),
        sa.CheckConstraint("month >= 1 AND month <= 12", name="ck_climate_month_range"),
        sa.CheckConstraint("confidence >= 0 AND confidence <= 1", name="ck_climate_confidence_range"),
        sa.ForeignKeyConstraint(["city_id"], ["cities.id"], ondelete="CASCADE", name="fk_climate_city"),
        sa.UniqueConstraint("city_id", "month", "effective_year", name="uq_climate_city_month_year"),
    )
    op.create_index("ix_climate_data_city_id", "climate_data", ["city_id"])
    op.create_table(
        "food_establishments",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("city_id", sa.Uuid(), nullable=False),
        sa.Column("neighborhood_id", sa.Uuid()),
        sa.Column("name", sa.String(length=180), nullable=False),
        sa.Column("categories", sa.JSON(), nullable=False),
        sa.Column("cuisines", sa.JSON(), nullable=False),
        sa.Column("comfort_food_tags", sa.JSON(), nullable=False),
        sa.Column("latitude", sa.Numeric(9, 6)),
        sa.Column("longitude", sa.Numeric(9, 6)),
        sa.Column("price_level", sa.SmallInteger()),
        sa.Column("currency", sa.String(length=3)),
        sa.Column("provider", sa.String(length=80), nullable=False),
        sa.Column("provider_record_id", sa.String(length=180)),
        sa.Column("source_url", sa.String(length=2048)),
        sa.Column("verified_at", sa.DateTime(timezone=True)),
        *_timestamps(),
        sa.ForeignKeyConstraint(["city_id"], ["cities.id"], ondelete="CASCADE", name="fk_food_city"),
        sa.ForeignKeyConstraint(["neighborhood_id"], ["neighborhoods.id"], ondelete="SET NULL", name="fk_food_neighborhood"),
    )
    op.create_index("ix_food_establishments_city_id", "food_establishments", ["city_id"])
    op.create_table(
        "cultural_insights",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("city_id", sa.Uuid(), nullable=False),
        sa.Column("category", sa.String(length=48), nullable=False),
        sa.Column("locale", sa.String(length=10), nullable=False),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("source_name", sa.String(length=180), nullable=False),
        sa.Column("source_url", sa.String(length=2048)),
        sa.Column("confidence", sa.Numeric(3, 2), nullable=False),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("reviewed_at", sa.DateTime(timezone=True)),
        *_timestamps(),
        sa.CheckConstraint("confidence >= 0 AND confidence <= 1", name="ck_cultural_confidence_range"),
        sa.ForeignKeyConstraint(["city_id"], ["cities.id"], ondelete="CASCADE", name="fk_cultural_city"),
    )
    op.create_index("ix_cultural_city_status_locale", "cultural_insights", ["city_id", "status", "locale"])


def downgrade() -> None:
    op.drop_index("ix_cultural_city_status_locale", table_name="cultural_insights")
    op.drop_table("cultural_insights")
    op.drop_index("ix_food_establishments_city_id", table_name="food_establishments")
    op.drop_table("food_establishments")
    op.drop_index("ix_climate_data_city_id", table_name="climate_data")
    op.drop_table("climate_data")
    op.drop_index("ix_cost_city_category_date", table_name="cost_of_living")
    op.drop_table("cost_of_living")
    op.drop_index("ix_neighborhoods_city_id", table_name="neighborhoods")
    op.drop_table("neighborhoods")
    op.drop_table("cities")
    op.drop_table("user_preference_profiles")
    op.drop_table("users")
