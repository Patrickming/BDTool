"""Message template model."""

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Template(Base):
    """Message template model for outreach communications."""

    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Template data
    name = Column(String(100), nullable=False)
    category = Column(
        String(30),
        nullable=False,
        index=True
    )  # 'initial', 'followup', 'negotiation', 'collaboration', 'maintenance'
    content = Column(Text, nullable=False)
    language = Column(String(10), default="en", nullable=False)
    ai_generated = Column(Boolean, default=False, nullable=False)

    # Usage statistics
    use_count = Column(Integer, default=0, nullable=False)
    success_count = Column(Integer, default=0, nullable=False)  # Number of times KOL responded

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="templates")
    contact_logs = relationship("ContactLog", back_populates="template")

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "category IN ('initial', 'followup', 'negotiation', 'collaboration', 'maintenance')",
            name="chk_category"
        ),
        CheckConstraint("use_count >= 0", name="chk_use_count"),
        CheckConstraint("success_count >= 0", name="chk_success_count"),
        CheckConstraint("success_count <= use_count", name="chk_success_rate"),
    )

    @property
    def success_rate(self) -> float:
        """Calculate success rate as percentage."""
        if self.use_count == 0:
            return 0.0
        return round((self.success_count / self.use_count) * 100, 2)

    def __repr__(self) -> str:
        return f"<Template(id={self.id}, name='{self.name}', category='{self.category}', success_rate={self.success_rate}%)>"
