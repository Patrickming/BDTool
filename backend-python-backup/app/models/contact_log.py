"""Contact log model for tracking interactions with KOLs."""

from sqlalchemy import Column, ForeignKey, Integer, String, Text, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class ContactLog(Base):
    """Contact log model storing all interactions with KOLs."""

    __tablename__ = "contact_logs"

    id = Column(Integer, primary_key=True, index=True)
    kol_id = Column(Integer, ForeignKey("kols.id", ondelete="CASCADE"), nullable=False, index=True)
    template_id = Column(Integer, ForeignKey("templates.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Contact details
    message_content = Column(Text, nullable=False)
    contact_type = Column(
        String(20),
        default="dm",
        nullable=False
    )  # 'dm', 'reply', 'email', 'other'
    status = Column(
        String(20),
        default="sent",
        nullable=False
    )  # 'sent', 'replied', 'no_response'

    # Timestamps
    sent_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    replied_at = Column(DateTime(timezone=True), nullable=True)

    # Response data
    response_content = Column(Text, nullable=True)
    sentiment = Column(String(20), nullable=True)  # 'positive', 'neutral', 'negative'
    notes = Column(Text, nullable=True)

    # Record metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    kol = relationship("KOL", back_populates="contact_logs")
    template = relationship("Template", back_populates="contact_logs")
    user = relationship("User", back_populates="contact_logs")

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "contact_type IN ('dm', 'reply', 'email', 'other')",
            name="chk_contact_type"
        ),
        CheckConstraint(
            "status IN ('sent', 'replied', 'no_response')",
            name="chk_status"
        ),
        CheckConstraint(
            "sentiment IN ('positive', 'neutral', 'negative') OR sentiment IS NULL",
            name="chk_sentiment"
        ),
    )

    def __repr__(self) -> str:
        return f"<ContactLog(id={self.id}, kol_id={self.kol_id}, type='{self.contact_type}', status='{self.status}')>"
