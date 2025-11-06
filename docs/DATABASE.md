# Database Design - KOL-BD-Tool

**Version:** 1.0
**Last Updated:** 2025-11-06
**Database:** PostgreSQL 14+ (Production) / SQLite (Development)

---

## Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Table Specifications](#table-specifications)
4. [Indexes](#indexes)
5. [Constraints and Validation](#constraints-and-validation)
6. [Sample Queries](#sample-queries)

---

## 1. Overview

### 1.1 Database Technology
- **Production:** PostgreSQL 14+
- **Development:** SQLite 3.35+
- **ORM:** SQLAlchemy 2.0
- **Migrations:** Alembic

### 1.2 Design Principles
- **Normalization:** 3NF (Third Normal Form) to reduce redundancy
- **Audit Trail:** Created/updated timestamps on all tables
- **Soft Deletes:** Use `deleted_at` instead of hard deletes (optional)
- **JSON Fields:** For flexible data (tags, metadata)

### 1.3 Naming Conventions
- **Tables:** Plural, lowercase, snake_case (e.g., `kols`, `contact_logs`)
- **Columns:** Lowercase, snake_case (e.g., `follower_count`, `created_at`)
- **Primary Keys:** `id` (integer, auto-increment)
- **Foreign Keys:** `{table}_id` (e.g., `kol_id`, `template_id`)
- **Timestamps:** `created_at`, `updated_at`, `deleted_at`

---

## 2. Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
│─────────────────│
│ id (PK)         │
│ email           │
│ hashed_password │
│ full_name       │
│ role            │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         │
         ├──────────────────────────────────────┐
         │                                      │
         │                                      │
┌────────▼────────┐                   ┌────────▼────────┐
│      kols       │                   │   templates     │
│─────────────────│                   │─────────────────│
│ id (PK)         │                   │ id (PK)         │
│ user_id (FK)    │                   │ user_id (FK)    │
│ twitter_id      │◄──────┐           │ name            │
│ username        │       │           │ category        │
│ display_name    │       │           │ content         │
│ bio             │       │           │ language        │
│ follower_count  │       │           │ ai_generated    │
│ following_count │       │           │ use_count       │
│ verified        │       │           │ success_count   │
│ profile_img_url │       │           │ created_at      │
│ language        │       │           │ updated_at      │
│ last_tweet_date │       │           └────────┬────────┘
│ account_created │       │                    │
│ quality_score   │       │                    │
│ content_category│       │                    │ N:1
│ status          │       │                    │
│ created_at      │       │           ┌────────▼────────┐
│ updated_at      │       │           │  contact_logs   │
└────────┬────────┘       │           │─────────────────│
         │                │           │ id (PK)         │
         │ 1:N            └───────────┤ kol_id (FK)     │
         │                            │ template_id (FK)│
┌────────▼────────┐                   │ user_id (FK)    │
│     tweets      │                   │ message_content │
│─────────────────│                   │ contact_type    │
│ id (PK)         │                   │ status          │
│ kol_id (FK)     │                   │ sent_at         │
│ tweet_id        │                   │ replied_at      │
│ content         │                   │ response_content│
│ likes           │                   │ sentiment       │
│ retweets        │                   │ notes           │
│ replies         │                   └─────────────────┘
│ posted_at       │
│ crypto_keywords │
│ relevance_score │
│ created_at      │
└────────┬────────┘
         │
         │ N:M
         │
┌────────▼────────┐
│      tags       │
│─────────────────│
│ id (PK)         │
│ user_id (FK)    │
│ name            │
│ color           │
│ created_at      │
└────────┬────────┘
         │
         │ N:M
         │
┌────────▼────────┐
│   kol_tags      │
│─────────────────│
│ kol_id (FK)     │
│ tag_id (FK)     │
│ created_at      │
└─────────────────┘
```

---

## 3. Table Specifications

### 3.1 `users` Table

**Purpose:** Store user accounts (BD team members)

| Column          | Type         | Constraints           | Description                    |
|-----------------|--------------|-----------------------|--------------------------------|
| id              | INTEGER      | PRIMARY KEY           | Unique user identifier         |
| email           | VARCHAR(255) | UNIQUE, NOT NULL      | Login email                    |
| hashed_password | VARCHAR(255) | NOT NULL              | Bcrypt hashed password         |
| full_name       | VARCHAR(100) | NOT NULL              | User's full name               |
| role            | VARCHAR(20)  | DEFAULT 'member'      | 'admin' or 'member'            |
| is_active       | BOOLEAN      | DEFAULT true          | Account active status          |
| created_at      | TIMESTAMP    | DEFAULT NOW()         | Account creation time          |
| updated_at      | TIMESTAMP    | DEFAULT NOW()         | Last update time               |

**Indexes:**
- `idx_users_email` on `email`

**Sample Data:**
```sql
INSERT INTO users (email, hashed_password, full_name, role) VALUES
('alex@kcex.com', '$2b$12$...', 'Alex Chen', 'member'),
('manager@kcex.com', '$2b$12$...', 'Sarah Johnson', 'admin');
```

---

### 3.2 `kols` Table

**Purpose:** Store KOL (Key Opinion Leader) information

| Column           | Type          | Constraints           | Description                           |
|------------------|---------------|-----------------------|---------------------------------------|
| id               | INTEGER       | PRIMARY KEY           | Unique KOL identifier                 |
| user_id          | INTEGER       | FOREIGN KEY, NOT NULL | Owner of this KOL record              |
| twitter_id       | VARCHAR(50)   | UNIQUE                | Twitter's internal user ID            |
| username         | VARCHAR(50)   | NOT NULL              | Twitter handle (without @)            |
| display_name     | VARCHAR(100)  | NOT NULL              | Display name on profile               |
| bio              | TEXT          | NULL                  | Profile bio/description               |
| follower_count   | INTEGER       | DEFAULT 0             | Number of followers                   |
| following_count  | INTEGER       | DEFAULT 0             | Number of following                   |
| verified         | BOOLEAN       | DEFAULT false         | Twitter verified badge                |
| profile_img_url  | VARCHAR(500)  | NULL                  | Avatar image URL                      |
| language         | VARCHAR(10)   | NULL                  | Primary language (ISO code)           |
| last_tweet_date  | TIMESTAMP     | NULL                  | Date of most recent tweet             |
| account_created  | TIMESTAMP     | NULL                  | Twitter account creation date         |
| quality_score    | INTEGER       | DEFAULT 0             | 0-100 calculated score                |
| content_category | VARCHAR(50)   | NULL                  | 'contract_trading', 'crypto', 'web3'  |
| status           | VARCHAR(30)   | DEFAULT 'new'         | Contact status                        |
| custom_notes     | TEXT          | NULL                  | User's private notes                  |
| created_at       | TIMESTAMP     | DEFAULT NOW()         | Record creation time                  |
| updated_at       | TIMESTAMP     | DEFAULT NOW()         | Last update time                      |

**Enum Values:**

**`status` column:**
- `new` - Just discovered
- `contacted` - Initial outreach sent
- `replied` - KOL responded
- `negotiating` - Discussing terms
- `cooperating` - Active partnership
- `rejected` - KOL declined
- `not_interested` - We passed

**`content_category` column:**
- `contract_trading` - Priority 1
- `crypto_trading` - Priority 2
- `web3` - Priority 3
- `unknown` - Not yet analyzed

**Indexes:**
- `idx_kols_username` on `username`
- `idx_kols_user_id` on `user_id`
- `idx_kols_status` on `status`
- `idx_kols_quality_score` on `quality_score`
- `idx_kols_follower_count` on `follower_count`

**Constraints:**
- `quality_score` between 0 and 100
- `follower_count` >= 0

**Sample Data:**
```sql
INSERT INTO kols (user_id, username, display_name, follower_count, quality_score, status, content_category) VALUES
(1, 'cryptotrader_pro', 'Crypto Trader Pro', 15000, 85, 'new', 'contract_trading'),
(1, 'defi_degen', 'DeFi Degen', 8500, 72, 'contacted', 'crypto_trading');
```

---

### 3.3 `templates` Table

**Purpose:** Store message templates for outreach

| Column        | Type         | Constraints        | Description                          |
|---------------|--------------|--------------------|--------------------------------------|
| id            | INTEGER      | PRIMARY KEY        | Unique template identifier           |
| user_id       | INTEGER      | FOREIGN KEY        | Template owner                       |
| name          | VARCHAR(100) | NOT NULL           | Template name                        |
| category      | VARCHAR(30)  | NOT NULL           | Template category                    |
| content       | TEXT         | NOT NULL           | Template text with variables         |
| language      | VARCHAR(10)  | DEFAULT 'en'       | Template language (ISO code)         |
| ai_generated  | BOOLEAN      | DEFAULT false      | Was this AI-generated?               |
| use_count     | INTEGER      | DEFAULT 0          | Times used                           |
| success_count | INTEGER      | DEFAULT 0          | Times KOL responded                  |
| created_at    | TIMESTAMP    | DEFAULT NOW()      | Creation time                        |
| updated_at    | TIMESTAMP    | DEFAULT NOW()      | Last update time                     |

**Enum Values:**

**`category` column:**
- `initial` - First contact
- `followup` - Second attempt if no response
- `negotiation` - Discussing terms
- `collaboration` - Finalizing details
- `maintenance` - Ongoing relationship

**`language` column:**
- `en` - English
- `es` - Spanish
- `pt` - Portuguese
- `de` - German
- `fr` - French
- etc.

**Computed Field:**
- `success_rate` = `success_count` / `use_count` * 100 (calculated in queries)

**Indexes:**
- `idx_templates_user_id` on `user_id`
- `idx_templates_category` on `category`

**Sample Data:**
```sql
INSERT INTO templates (user_id, name, category, content, language) VALUES
(1, 'Initial Contact - Friendly', 'initial',
 'Hey {{display_name}}! Love your content on contract trading. Would you be interested in partnering with KCEX?',
 'en'),
(1, 'Follow-up', 'followup',
 'Hi {{display_name}}, just following up on my previous message. Still interested in discussing a partnership?',
 'en');
```

---

### 3.4 `contact_logs` Table

**Purpose:** Track all interactions with KOLs

| Column           | Type         | Constraints        | Description                       |
|------------------|--------------|--------------------|-----------------------------------|
| id               | INTEGER      | PRIMARY KEY        | Unique log identifier             |
| kol_id           | INTEGER      | FOREIGN KEY        | KOL this contact is about         |
| template_id      | INTEGER      | FOREIGN KEY, NULL  | Template used (if any)            |
| user_id          | INTEGER      | FOREIGN KEY        | User who made contact             |
| message_content  | TEXT         | NOT NULL           | Actual message sent               |
| contact_type     | VARCHAR(20)  | DEFAULT 'dm'       | Communication channel             |
| status           | VARCHAR(20)  | DEFAULT 'sent'     | Contact status                    |
| sent_at          | TIMESTAMP    | DEFAULT NOW()      | When message was sent             |
| replied_at       | TIMESTAMP    | NULL               | When KOL replied                  |
| response_content | TEXT         | NULL               | KOL's response                    |
| sentiment        | VARCHAR(20)  | NULL               | Response sentiment                |
| notes            | TEXT         | NULL               | Additional notes                  |
| created_at       | TIMESTAMP    | DEFAULT NOW()      | Record creation time              |

**Enum Values:**

**`contact_type` column:**
- `dm` - Twitter Direct Message
- `reply` - Public reply to tweet
- `email` - Email outreach
- `other` - Other channel

**`status` column:**
- `sent` - Message sent
- `replied` - KOL responded
- `no_response` - No reply after X days

**`sentiment` column:**
- `positive` - Interested/friendly
- `neutral` - Acknowledges but unclear
- `negative` - Not interested/hostile

**Indexes:**
- `idx_contact_logs_kol_id` on `kol_id`
- `idx_contact_logs_user_id` on `user_id`
- `idx_contact_logs_sent_at` on `sent_at`

**Sample Data:**
```sql
INSERT INTO contact_logs (kol_id, template_id, user_id, message_content, contact_type, status) VALUES
(1, 1, 1, 'Hey Crypto Trader Pro! Love your content...', 'dm', 'sent'),
(1, NULL, 1, 'Thanks for getting back to me! Let me share...', 'dm', 'sent');
```

---

### 3.5 `tweets` Table

**Purpose:** Store KOL tweets for analysis

| Column          | Type         | Constraints        | Description                        |
|-----------------|--------------|--------------------|-------------------------------------|
| id              | INTEGER      | PRIMARY KEY        | Unique tweet identifier            |
| kol_id          | INTEGER      | FOREIGN KEY        | KOL who posted                     |
| tweet_id        | VARCHAR(50)  | UNIQUE             | Twitter's tweet ID                 |
| content         | TEXT         | NOT NULL           | Tweet text                         |
| likes           | INTEGER      | DEFAULT 0          | Like count                         |
| retweets        | INTEGER      | DEFAULT 0          | Retweet count                      |
| replies         | INTEGER      | DEFAULT 0          | Reply count                        |
| posted_at       | TIMESTAMP    | NOT NULL           | When tweet was posted              |
| crypto_keywords | JSON         | NULL               | Array of detected keywords         |
| relevance_score | INTEGER      | DEFAULT 0          | 0-100 content relevance            |
| created_at      | TIMESTAMP    | DEFAULT NOW()      | Record creation time               |

**JSON Field Example:**

`crypto_keywords`:
```json
["bitcoin", "leverage", "long", "futures", "degen"]
```

**Indexes:**
- `idx_tweets_kol_id` on `kol_id`
- `idx_tweets_tweet_id` on `tweet_id`
- `idx_tweets_posted_at` on `posted_at`

**Sample Data:**
```sql
INSERT INTO tweets (kol_id, tweet_id, content, likes, retweets, posted_at, crypto_keywords, relevance_score) VALUES
(1, '1234567890', 'Looking at BTC futures, strong long setup at 42k...', 250, 45, '2025-11-05 14:30:00',
 '["BTC", "futures", "long", "42k"]'::json, 95);
```

---

### 3.6 `tags` Table

**Purpose:** User-defined tags for organizing KOLs

| Column     | Type         | Constraints        | Description                  |
|------------|--------------|--------------------|------------------------------|
| id         | INTEGER      | PRIMARY KEY        | Unique tag identifier        |
| user_id    | INTEGER      | FOREIGN KEY        | Tag owner                    |
| name       | VARCHAR(50)  | NOT NULL           | Tag name                     |
| color      | VARCHAR(7)   | DEFAULT '#1890ff'  | Hex color code               |
| created_at | TIMESTAMP    | DEFAULT NOW()      | Creation time                |

**Constraints:**
- UNIQUE constraint on (`user_id`, `name`) - prevent duplicate tag names per user

**Indexes:**
- `idx_tags_user_id` on `user_id`

**Sample Data:**
```sql
INSERT INTO tags (user_id, name, color) VALUES
(1, 'High Priority', '#f5222d'),
(1, 'Contract Expert', '#52c41a'),
(1, 'Responsive', '#1890ff');
```

---

### 3.7 `kol_tags` Table (Junction Table)

**Purpose:** Many-to-many relationship between KOLs and tags

| Column     | Type      | Constraints        | Description           |
|------------|-----------|--------------------|------------------------|
| kol_id     | INTEGER   | FOREIGN KEY        | KOL being tagged       |
| tag_id     | INTEGER   | FOREIGN KEY        | Tag applied            |
| created_at | TIMESTAMP | DEFAULT NOW()      | When tag was applied   |

**Constraints:**
- PRIMARY KEY on (`kol_id`, `tag_id`) - prevent duplicate tags
- CASCADE DELETE on both foreign keys

**Indexes:**
- `idx_kol_tags_kol_id` on `kol_id`
- `idx_kol_tags_tag_id` on `tag_id`

**Sample Data:**
```sql
INSERT INTO kol_tags (kol_id, tag_id) VALUES
(1, 1),  -- cryptotrader_pro is High Priority
(1, 2),  -- cryptotrader_pro is Contract Expert
(2, 3);  -- defi_degen is Responsive
```

---

## 4. Indexes

### 4.1 Performance Indexes

**Priority 1 (High Impact):**
```sql
CREATE INDEX idx_kols_user_id_status ON kols(user_id, status);
CREATE INDEX idx_kols_quality_score_desc ON kols(quality_score DESC);
CREATE INDEX idx_contact_logs_kol_id_sent_at ON contact_logs(kol_id, sent_at DESC);
```

**Priority 2 (Moderate Impact):**
```sql
CREATE INDEX idx_kols_follower_count ON kols(follower_count);
CREATE INDEX idx_kols_content_category ON kols(content_category);
CREATE INDEX idx_tweets_posted_at_desc ON tweets(posted_at DESC);
```

**Full-Text Search (PostgreSQL):**
```sql
CREATE INDEX idx_kols_username_trgm ON kols USING gin(username gin_trgm_ops);
CREATE INDEX idx_kols_bio_fulltext ON kols USING gin(to_tsvector('english', bio));
```

---

## 5. Constraints and Validation

### 5.1 Check Constraints

```sql
-- Quality score must be 0-100
ALTER TABLE kols ADD CONSTRAINT chk_quality_score
  CHECK (quality_score >= 0 AND quality_score <= 100);

-- Follower count must be non-negative
ALTER TABLE kols ADD CONSTRAINT chk_follower_count
  CHECK (follower_count >= 0);

-- Status must be valid value
ALTER TABLE kols ADD CONSTRAINT chk_status
  CHECK (status IN ('new', 'contacted', 'replied', 'negotiating', 'cooperating', 'rejected', 'not_interested'));

-- Color must be valid hex code
ALTER TABLE tags ADD CONSTRAINT chk_color
  CHECK (color ~* '^#[0-9A-F]{6}$');
```

### 5.2 Foreign Key Cascades

```sql
-- When user is deleted, delete their KOLs
ALTER TABLE kols ADD CONSTRAINT fk_kols_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- When KOL is deleted, delete associated contact logs
ALTER TABLE contact_logs ADD CONSTRAINT fk_contact_logs_kol
  FOREIGN KEY (kol_id) REFERENCES kols(id) ON DELETE CASCADE;

-- When tag is deleted, remove from kol_tags
ALTER TABLE kol_tags ADD CONSTRAINT fk_kol_tags_tag
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE;
```

### 5.3 Triggers (Auto-update)

**Update `updated_at` timestamp:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kols_updated_at BEFORE UPDATE ON kols
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Auto-update KOL status when contact is logged:**
```sql
CREATE OR REPLACE FUNCTION update_kol_status_on_contact()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE kols SET status = 'contacted', updated_at = NOW()
  WHERE id = NEW.kol_id AND status = 'new';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_status_after_contact AFTER INSERT ON contact_logs
  FOR EACH ROW EXECUTE FUNCTION update_kol_status_on_contact();
```

---

## 6. Sample Queries

### 6.1 Find High-Quality Uncontacted KOLs

```sql
SELECT
  username,
  display_name,
  follower_count,
  quality_score,
  content_category
FROM kols
WHERE
  user_id = 1
  AND status = 'new'
  AND quality_score >= 70
  AND content_category = 'contract_trading'
ORDER BY quality_score DESC
LIMIT 20;
```

### 6.2 Get KOL with Contact History

```sql
SELECT
  k.username,
  k.display_name,
  k.follower_count,
  k.status,
  cl.sent_at,
  cl.message_content,
  cl.replied_at,
  cl.sentiment
FROM kols k
LEFT JOIN contact_logs cl ON k.id = cl.kol_id
WHERE k.id = 1
ORDER BY cl.sent_at DESC;
```

### 6.3 Calculate Template Success Rates

```sql
SELECT
  t.name,
  t.category,
  t.use_count,
  t.success_count,
  CASE
    WHEN t.use_count > 0 THEN ROUND(t.success_count::numeric / t.use_count * 100, 2)
    ELSE 0
  END as success_rate_percent
FROM templates t
WHERE t.user_id = 1
ORDER BY success_rate_percent DESC;
```

### 6.4 Find KOLs by Tags

```sql
SELECT
  k.username,
  k.display_name,
  k.quality_score,
  STRING_AGG(tg.name, ', ') as tags
FROM kols k
JOIN kol_tags kt ON k.id = kt.kol_id
JOIN tags tg ON kt.tag_id = tg.id
WHERE k.user_id = 1
  AND tg.name IN ('High Priority', 'Contract Expert')
GROUP BY k.id, k.username, k.display_name, k.quality_score
HAVING COUNT(DISTINCT tg.id) = 2  -- Has BOTH tags
ORDER BY k.quality_score DESC;
```

### 6.5 Weekly Contact Statistics

```sql
SELECT
  DATE(sent_at) as contact_date,
  COUNT(*) as contacts_sent,
  COUNT(replied_at) as responses_received,
  ROUND(COUNT(replied_at)::numeric / COUNT(*) * 100, 2) as response_rate
FROM contact_logs
WHERE
  user_id = 1
  AND sent_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(sent_at)
ORDER BY contact_date DESC;
```

### 6.6 KOL Quality Score Distribution

```sql
SELECT
  CASE
    WHEN quality_score >= 80 THEN 'Excellent (80-100)'
    WHEN quality_score >= 60 THEN 'Good (60-79)'
    WHEN quality_score >= 40 THEN 'Fair (40-59)'
    ELSE 'Poor (<40)'
  END as score_range,
  COUNT(*) as kol_count,
  ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM kols WHERE user_id = 1) * 100, 2) as percentage
FROM kols
WHERE user_id = 1
GROUP BY score_range
ORDER BY MIN(quality_score) DESC;
```

### 6.7 Recent Tweet Analysis for KOL

```sql
SELECT
  t.content,
  t.likes,
  t.retweets,
  t.replies,
  t.posted_at,
  t.crypto_keywords,
  t.relevance_score
FROM tweets t
WHERE t.kol_id = 1
ORDER BY t.posted_at DESC
LIMIT 20;
```

### 6.8 Find KOLs Needing Follow-up

```sql
SELECT
  k.username,
  k.display_name,
  k.status,
  MAX(cl.sent_at) as last_contact_date,
  NOW() - MAX(cl.sent_at) as days_since_contact
FROM kols k
JOIN contact_logs cl ON k.id = cl.kol_id
WHERE
  k.user_id = 1
  AND k.status IN ('contacted', 'replied')
  AND cl.replied_at IS NULL  -- No response yet
GROUP BY k.id, k.username, k.display_name, k.status
HAVING NOW() - MAX(cl.sent_at) > INTERVAL '3 days'
ORDER BY last_contact_date ASC;
```

---

## Appendix: Database Setup Scripts

### A1. PostgreSQL Setup

```sql
-- Create database
CREATE DATABASE kol_bd_tool;

-- Connect to database
\c kol_bd_tool;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- Run migrations (via Alembic)
-- alembic upgrade head
```

### A2. SQLite Setup (Development)

```bash
# SQLite database file
touch kol_bd_tool.db

# Apply migrations
alembic upgrade head
```

---

**End of Database Design Document**

*Schema changes should be managed through Alembic migrations, not manual SQL edits.*
