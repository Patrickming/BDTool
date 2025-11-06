"""Tweet model for storing KOL content."""

from sqlalchemy import Column, ForeignKey, Integer, String, Text, DateTime, CheckConstraint, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Tweet(Base):
    """Tweet model storing KOL tweets for analysis."""

    __tablename__ = "tweets"

    id = Column(Integer, primary_key=True, index=True)
    kol_id = Column(Integer, ForeignKey("kols.id", ondelete="CASCADE"), nullable=False, index=True)

    # Twitter data
    tweet_id = Column(String(50), unique=True, nullable=False, index=True)
    content = Column(Text, nullable=False)

    # Engagement metrics
    likes = Column(Integer, default=0, nullable=False)
    retweets = Column(Integer, default=0, nullable=False)
    replies = Column(Integer, default=0, nullable=False)

    # Analysis
    posted_at = Column(DateTime(timezone=True), nullable=False, index=True)
    crypto_keywords = Column(JSON, nullable=True)  # Array of detected keywords
    relevance_score = Column(Integer, default=0, nullable=False)  # 0-100 score

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    kol = relationship("KOL", back_populates="tweets")

    # Constraints
    __table_args__ = (
        CheckConstraint("likes >= 0", name="chk_likes"),
        CheckConstraint("retweets >= 0", name="chk_retweets"),
        CheckConstraint("replies >= 0", name="chk_replies"),
        CheckConstraint("relevance_score >= 0 AND relevance_score <= 100", name="chk_relevance_score"),
    )

    @property
    def engagement_count(self) -> int:
        """Calculate total engagement."""
        return self.likes + self.retweets + self.replies

    def __repr__(self) -> str:
        return f"<Tweet(id={self.id}, tweet_id='{self.tweet_id}', engagement={self.engagement_count})>"
