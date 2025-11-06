"""KOL (Key Opinion Leader) model."""

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class KOL(Base):
    """KOL model storing Twitter influencer information."""

    __tablename__ = "kols"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Twitter profile data
    twitter_id = Column(String(50), unique=True, nullable=True, index=True)
    username = Column(String(50), nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    bio = Column(Text, nullable=True)
    follower_count = Column(Integer, default=0, nullable=False)
    following_count = Column(Integer, default=0, nullable=False)
    verified = Column(Boolean, default=False, nullable=False)
    profile_img_url = Column(String(500), nullable=True)

    # Analysis data
    language = Column(String(10), nullable=True)  # ISO language code
    last_tweet_date = Column(DateTime(timezone=True), nullable=True)
    account_created = Column(DateTime(timezone=True), nullable=True)
    quality_score = Column(Integer, default=0, nullable=False, index=True)
    content_category = Column(String(50), nullable=True, index=True)  # 'contract_trading', 'crypto_trading', 'web3'

    # CRM data
    status = Column(
        String(30),
        default="new",
        nullable=False,
        index=True
    )  # 'new', 'contacted', 'replied', 'negotiating', 'cooperating', 'rejected', 'not_interested'
    custom_notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="kols")
    contact_logs = relationship("ContactLog", back_populates="kol", cascade="all, delete-orphan")
    tweets = relationship("Tweet", back_populates="kol", cascade="all, delete-orphan")
    kol_tags = relationship("KOLTag", back_populates="kol", cascade="all, delete-orphan")

    # Constraints
    __table_args__ = (
        CheckConstraint("quality_score >= 0 AND quality_score <= 100", name="chk_quality_score"),
        CheckConstraint("follower_count >= 0", name="chk_follower_count"),
        CheckConstraint(
            "status IN ('new', 'contacted', 'replied', 'negotiating', 'cooperating', 'rejected', 'not_interested')",
            name="chk_status"
        ),
        CheckConstraint(
            "content_category IN ('contract_trading', 'crypto_trading', 'web3', 'unknown') OR content_category IS NULL",
            name="chk_content_category"
        ),
    )

    def __repr__(self) -> str:
        return f"<KOL(id={self.id}, username='@{self.username}', followers={self.follower_count}, score={self.quality_score})>"
