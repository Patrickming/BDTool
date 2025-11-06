"""Tag models for organizing KOLs."""

from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Tag(Base):
    """Tag model for user-defined labels."""

    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Tag data
    name = Column(String(50), nullable=False)
    color = Column(String(7), default="#1890ff", nullable=False)  # Hex color code

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="tags")
    kol_tags = relationship("KOLTag", back_populates="tag", cascade="all, delete-orphan")

    # Constraints
    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_user_tag_name"),
        CheckConstraint("color ~ '^#[0-9A-Fa-f]{6}$'", name="chk_color_format"),
    )

    def __repr__(self) -> str:
        return f"<Tag(id={self.id}, name='{self.name}', color='{self.color}')>"


class KOLTag(Base):
    """Junction table for many-to-many relationship between KOLs and Tags."""

    __tablename__ = "kol_tags"

    kol_id = Column(Integer, ForeignKey("kols.id", ondelete="CASCADE"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    kol = relationship("KOL", back_populates="kol_tags")
    tag = relationship("Tag", back_populates="kol_tags")

    def __repr__(self) -> str:
        return f"<KOLTag(kol_id={self.kol_id}, tag_id={self.tag_id})>"
