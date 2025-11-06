# KOL-BD-Tool - Requirements Specification

**Version:** 1.0
**Last Updated:** 2025-11-06
**Project:** KOL Management System for KCEX Exchange BD Team

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [User Personas](#user-personas)
3. [Core Requirements](#core-requirements)
4. [KOL Filtering Rules](#kol-filtering-rules)
5. [Functional Requirements](#functional-requirements)
6. [Non-Functional Requirements](#non-functional-requirements)
7. [User Interface Requirements](#user-interface-requirements)
8. [Integration Requirements](#integration-requirements)
9. [Security Requirements](#security-requirements)
10. [Future Enhancements](#future-enhancements)

---

## 1. Project Overview

### 1.1 Purpose
Build a comprehensive web application to help KCEX exchange BD team efficiently discover, manage, and communicate with crypto KOLs on Twitter/X.

### 1.2 Background
- **Current Pain Point #1:** Manual template management and risk of account restrictions due to repetitive messages
- **Current Pain Point #2:** Time-consuming KOL discovery process (need to contact 100+ new KOLs per week)
- **Current Pain Point #3:** Lack of systematic relationship tracking and follow-up management

### 1.3 Goals
- **Efficiency:** Reduce KOL discovery time by 70%
- **Organization:** Centralized CRM for all KOL relationships
- **Safety:** Avoid Twitter account restrictions through manual sending
- **Quality:** Focus on high-quality, relevant KOLs (contract trading focus)

### 1.4 Success Metrics
- Contact 100+ new qualified KOLs per week
- Maintain organized database of 500+ KOLs
- Achieve 20%+ response rate
- Zero account suspensions

---

## 2. User Personas

### Primary User: BD Intern
- **Name:** Alex (example)
- **Role:** Business Development Intern at KCEX
- **Goals:**
  - Find 100+ new qualified crypto KOLs weekly
  - Manage outreach to multiple KOLs simultaneously
  - Track conversation history and follow-ups
  - Avoid repetitive messages that trigger account restrictions
- **Technical Skill:** Intermediate (comfortable with web apps)
- **Pain Points:**
  - Manual Twitter searching is time-consuming
  - Hard to remember which KOLs have been contacted
  - Creating unique messages for each KOL is tedious

### Secondary User: BD Manager
- **Role:** Team lead overseeing BD operations
- **Goals:**
  - Monitor team performance (contacts, response rates)
  - Ensure consistent quality in outreach
  - Review KOL partnership opportunities
- **Needs:**
  - Analytics dashboard
  - Export functionality for reporting

---

## 3. Core Requirements

### 3.1 Must Have (MVP - Phase 1)
1. ✅ KOL database with CRUD operations
2. ✅ Message template management
3. ✅ Manual KOL import (batch username input)
4. ✅ KOL detail view with contact history
5. ✅ Status tracking (new/contacted/replied/etc.)
6. ✅ Message preview with variable substitution
7. ✅ Copy-to-clipboard functionality
8. ✅ Basic filtering (status, follower count)

### 3.2 Should Have (Phase 2)
1. ✅ AI-powered template generation
2. ✅ Automatic KOL quality scoring
3. ✅ Tweet content analysis
4. ✅ Tag system for organization
5. ✅ Analytics dashboard
6. ✅ Browser extension for quick capture

### 3.3 Nice to Have (Phase 3)
1. ⏳ Seed expansion (discover from existing KOLs)
2. ⏳ Network visualization
3. ⏳ Follow-up reminders
4. ⏳ Team collaboration features
5. ⏳ Multi-language UI

---

## 4. KOL Filtering Rules

### 4.1 Inclusion Criteria (All Must Be Met)

#### 4.1.1 Follower Count
- **Minimum:** 1,000 followers
- **Maximum:** 50,000 followers
- **Rationale:**
  - <1k: Too small influence
  - >50k: Too expensive or already partnered with competitors

#### 4.1.2 Content Category (Priority Order)
1. **Priority 1 (Highest):** Contract Trading Analysis
   - Keywords: "contract", "leverage", "long", "short", "futures", "perpetual", "degen", "liquidation"
   - Content: Price predictions, entry/exit points, trading strategies

2. **Priority 2:** Crypto Token Trading
   - Keywords: "token", "coin", "buy", "sell", "pump", "alpha", "gem"
   - Content: Token recommendations, market analysis

3. **Priority 3:** Web3 General
   - Keywords: "web3", "blockchain", "defi", "nft", "dao"
   - Content: General crypto/blockchain discussion

#### 4.1.3 Activity Level
- **Requirement:** At least 1 tweet in the last 7 days
- **Rationale:** Inactive accounts won't promote effectively

#### 4.1.4 Language (EXCLUSION LIST)
**DO NOT include KOLs who primarily post in:**
- ❌ Chinese (Simplified/Traditional)
- ❌ Turkish
- ❌ Middle Eastern languages (Arabic, Hebrew)
- ❌ Persian (Farsi)

**Accepted languages:**
- ✅ English (preferred)
- ✅ Spanish
- ✅ Portuguese
- ✅ German
- ✅ French
- ✅ Japanese
- ✅ Korean
- ✅ Russian

### 4.2 Exclusion Criteria (Any One Disqualifies)
- ❌ Spam/bot accounts
- ❌ Suspended accounts
- ❌ Protected/private accounts
- ❌ No profile picture
- ❌ Generic/unclear bio
- ❌ No crypto-related content in recent 50 tweets
- ❌ Excessive promotional content (>80% retweets)

### 4.3 Quality Scoring Algorithm

**Total Score: 0-100 points**

1. **Follower Count (20 points)**
   - 1k-5k: 10 points
   - 5k-10k: 15 points
   - 10k-30k: 20 points
   - 30k-50k: 15 points

2. **Content Relevance (30 points)**
   - Contract trading focus: 30 points
   - Crypto trading focus: 20 points
   - Web3 general: 10 points
   - Mixed/unclear: 5 points

3. **Engagement Rate (25 points)**
   - Formula: (Avg Likes + Replies) / Follower Count * 1000
   - >10: 25 points
   - 5-10: 20 points
   - 2-5: 15 points
   - 1-2: 10 points
   - <1: 5 points

4. **Activity Level (15 points)**
   - Daily posts (7+ tweets/week): 15 points
   - Regular posts (3-6 tweets/week): 10 points
   - Occasional posts (1-2 tweets/week): 5 points

5. **Account Quality (10 points)**
   - Verified badge: +5 points
   - Account age >1 year: +3 points
   - Complete profile (bio, location, link): +2 points

**Score Interpretation:**
- 80-100: 🌟 Excellent - High priority
- 60-79: ✅ Good - Standard priority
- 40-59: ⚠️ Fair - Low priority
- <40: ❌ Poor - Consider excluding

---

## 5. Functional Requirements

### 5.1 Module 1: Message Template Management

#### FR-1.1: Template CRUD Operations
- **Description:** Users can create, read, update, and delete message templates
- **Acceptance Criteria:**
  - ✅ Create new template with name, category, and content
  - ✅ Edit existing templates
  - ✅ Delete templates (with confirmation)
  - ✅ View list of all templates grouped by category

#### FR-1.2: Template Categories
- **Categories:**
  1. Initial Contact (first DM to new KOL)
  2. Follow-up (second contact if no response)
  3. Negotiation (discussing terms, pricing)
  4. Collaboration Details (finalizing partnership)
  5. Relationship Maintenance (check-ins with existing partners)

#### FR-1.3: Variable Support
- **Supported Variables:**
  - `{{username}}` - KOL Twitter username
  - `{{display_name}}` - KOL display name
  - `{{follower_count}}` - Formatted follower number (e.g., "10.5K")
  - `{{bio}}` - KOL bio text
  - `{{my_name}}` - User's name
  - `{{exchange_name}}` - "KCEX"
  - `{{custom_note}}` - User-provided custom text

- **Acceptance Criteria:**
  - ✅ Variables displayed in template editor
  - ✅ Preview shows variables replaced with actual data
  - ✅ Validation warns if variable syntax is incorrect

#### FR-1.4: AI Template Generation
- **Description:** Generate message templates using AI (OpenAI/Claude)
- **Input:**
  - Scenario (initial contact, follow-up, etc.)
  - Tone (professional, friendly, casual)
  - Key points to include
  - Language preference

- **Output:**
  - 3-5 different template variations
  - Each variation avoids repetitive phrasing

- **Acceptance Criteria:**
  - ✅ AI generation takes <10 seconds
  - ✅ User can regenerate if unsatisfied
  - ✅ Generated templates can be edited before saving
  - ✅ Graceful error handling if AI API fails

#### FR-1.5: Template Effectiveness Tracking
- **Metrics:**
  - Times used
  - Response rate (if logged)
  - Average response time

- **Acceptance Criteria:**
  - ✅ Display metrics on template list
  - ✅ Sort templates by effectiveness
  - ✅ Highlight top-performing templates

---

### 5.2 Module 2: KOL Discovery

#### FR-2.1: Manual Batch Import
- **Description:** Import multiple KOLs by pasting usernames
- **Input:**
  - Text area accepting:
    - Plain usernames (one per line)
    - @usernames
    - Full Twitter URLs
    - Comma-separated list

- **Process:**
  1. Parse input and extract usernames
  2. Fetch basic profile data for each
  3. Apply filtering rules
  4. Calculate quality scores
  5. Show preview of discovered KOLs
  6. User confirms import

- **Acceptance Criteria:**
  - ✅ Handle 100+ usernames in single import
  - ✅ Skip duplicates automatically
  - ✅ Show progress indicator
  - ✅ Display success/failure count
  - ✅ List any usernames that failed (not found, suspended, etc.)

#### FR-2.2: Browser Extension Import
- **Description:** Quickly capture KOL info while browsing Twitter
- **Features:**
  1. **Single KOL Capture:**
     - Click extension icon on KOL's Twitter profile
     - Auto-extract: username, name, follower count, bio, avatar
     - Save to database with one click

  2. **Batch Following List Import:**
     - Navigate to your Twitter following page
     - Click "Import Following List"
     - Extension scrolls and captures all accounts
     - Send to backend for filtering and scoring

- **Acceptance Criteria:**
  - ✅ Extension works on twitter.com and x.com
  - ✅ Captures data accurately
  - ✅ Shows success notification
  - ✅ Handles rate limiting gracefully

#### FR-2.3: Seed Expansion (Future)
- **Description:** Discover new KOLs from existing ones
- **Process:**
  1. Select seed KOLs (high-quality accounts)
  2. Fetch their following lists
  3. Filter and score discovered accounts
  4. Recommend top matches

- **Note:** Requires Twitter API access or advanced scraping

#### FR-2.4: Quality Scoring
- **Description:** Automatically calculate quality score (0-100) for each KOL
- **Process:**
  1. Analyze follower count
  2. Fetch recent tweets (last 50)
  3. Calculate engagement rate
  4. Detect content category
  5. Check activity level
  6. Assign score

- **Acceptance Criteria:**
  - ✅ Scoring completes within 5 seconds per KOL
  - ✅ Score displayed prominently in UI
  - ✅ Score can be manually adjusted
  - ✅ Breakdown of score components visible

---

### 5.3 Module 3: KOL Database & CRM

#### FR-3.1: KOL List View
- **Display:** Table format with columns:
  - Avatar (thumbnail)
  - Username
  - Display Name
  - Follower Count
  - Quality Score (with color coding)
  - Status
  - Tags
  - Last Contact Date
  - Actions (View, Edit, Delete)

- **Features:**
  - ✅ Sortable by any column
  - ✅ Pagination (25/50/100 per page)
  - ✅ Search by username or name
  - ✅ Multi-select for batch operations

#### FR-3.2: Filtering & Search
- **Filters:**
  1. **Status:** New, Contacted, Replied, Negotiating, Cooperating, Rejected, Not Interested
  2. **Follower Range:** Custom min/max
  3. **Quality Score:** Excellent (80+), Good (60-79), Fair (40-59), Poor (<40)
  4. **Tags:** Multi-select
  5. **Content Category:** Contract Trading, Crypto Trading, Web3
  6. **Activity:** Active (7 days), Recent (30 days), Inactive

- **Search:**
  - ✅ Real-time search (debounced)
  - ✅ Search in username, display name, bio
  - ✅ Combine search with filters

#### FR-3.3: KOL Detail View
- **Layout:**

  **Left Panel (40%):**
  - Large avatar
  - Display name and username
  - Follower/following count
  - Verified badge (if applicable)
  - Bio
  - Quality score breakdown
  - Account created date
  - Twitter profile link (open in new tab)

  **Right Panel (60%):**
  - **Status selector** (dropdown)
  - **Tags** (add/remove)
  - **Notes** (rich text editor)
  - **Contact History** (timeline)
    - Date, message sent, response (if any)
    - Expandable to show full message
  - **Recent Tweets** (last 10)
    - Date, content, engagement metrics

- **Actions:**
  - "Prepare Message" button
  - "Update Status" button
  - "Add Note" button
  - "Delete KOL" button (with confirmation)

#### FR-3.4: Status Management
- **Available Statuses:**
  1. **New** - Just discovered, not contacted
  2. **Contacted** - Initial message sent
  3. **Replied** - KOL responded
  4. **Negotiating** - Discussing partnership terms
  5. **Cooperating** - Active partnership
  6. **Rejected** - KOL declined
  7. **Not Interested** - We decided not to pursue

- **Status Workflow:**
  - Automatic status change when logging contact
  - Manual status override available
  - Status history tracked

- **Color Coding:**
  - New: Gray
  - Contacted: Blue
  - Replied: Green
  - Negotiating: Yellow
  - Cooperating: Dark Green
  - Rejected: Red
  - Not Interested: Light Gray

#### FR-3.5: Tag System
- **Default Tags:**
  - High Priority
  - Contract Trading Expert
  - Responsive
  - Reasonable Price
  - Large Audience
  - High Engagement

- **Custom Tags:**
  - User can create custom tags
  - Tags have colors
  - Tags can be edited/deleted

- **Usage:**
  - Multi-select tags per KOL
  - Filter KOL list by tags
  - Bulk tag operations

#### FR-3.6: Contact History Timeline
- **Entry Types:**
  1. **Message Sent:**
     - Date/time
     - Template used
     - Message content (truncated, expandable)
     - Platform (DM, Reply, Email)

  2. **Response Received:**
     - Date/time
     - Response content
     - Sentiment (positive/neutral/negative) - optional

  3. **Status Change:**
     - Date/time
     - Old status → New status
     - Notes

  4. **Notes Added:**
     - Date/time
     - Note content

- **Display:**
  - Chronological order (newest first)
  - Icons for each entry type
  - Expandable cards

#### FR-3.7: Notes System
- **Features:**
  - Rich text editor (bold, italic, lists)
  - Timestamp on each note
  - Edit/delete notes
  - Search within notes

- **Use Cases:**
  - Record phone call details
  - Save negotiation points
  - Store pricing information
  - Personal observations about KOL

---

### 5.4 Module 4: Outreach Assistant

#### FR-4.1: Message Preparation
- **Workflow:**
  1. User navigates to KOL detail page
  2. Clicks "Prepare Message"
  3. Modal opens with:
     - Template selector (dropdown by category)
     - Template preview with variables filled
     - Editable text area
     - Variable reference panel

- **Features:**
  - ✅ Auto-fill variables from KOL data
  - ✅ Live preview as user edits
  - ✅ Character counter (Twitter DM limit: 10,000)
  - ✅ "Copy to Clipboard" button
  - ✅ "Save as Draft" button

#### FR-4.2: Message Variables
- **Auto-filled from KOL profile:**
  - {{username}}
  - {{display_name}}
  - {{follower_count}}
  - {{bio}}

- **User-provided (prompt when preparing):**
  - {{custom_note}} - specific point to mention
  - {{my_name}} - saved in user settings

- **System-generated:**
  - {{today_date}}
  - {{exchange_name}}

#### FR-4.3: Copy to Clipboard
- **Description:** Copy prepared message to clipboard for manual pasting on Twitter
- **Acceptance Criteria:**
  - ✅ One-click copy
  - ✅ Success notification
  - ✅ Works across all browsers
  - ✅ Preserves formatting (if applicable)

#### FR-4.4: Interaction Logging
- **Description:** After sending message manually, user logs the interaction
- **Process:**
  1. User copies message and sends on Twitter
  2. User returns to tool
  3. Clicks "Log Contact"
  4. System records:
     - Date/time
     - Message content
     - Template used
     - Platform (DM/Reply)
  5. Automatically updates status to "Contacted"

- **Acceptance Criteria:**
  - ✅ Quick logging (no excessive fields)
  - ✅ Optional notes field
  - ✅ Timestamp accurate
  - ✅ Appears in contact history immediately

#### FR-4.5: Response Logging
- **Description:** Log when KOL responds
- **Fields:**
  - Response date/time
  - Response content (paste from Twitter)
  - Sentiment (dropdown: Positive/Neutral/Negative)
  - Next action needed (text field)

- **Automatic Actions:**
  - Update status to "Replied"
  - Calculate response time
  - Update template effectiveness metrics

---

### 5.5 Module 5: Analytics Dashboard

#### FR-5.1: Overview Statistics
- **Metrics Displayed:**
  - Total KOLs in database
  - New KOLs this week
  - Contacted this week
  - Response rate (overall and this week)
  - Active partnerships
  - Pending follow-ups

- **Display:** Stat cards with icons and trend indicators

#### FR-5.2: KOL Distribution Charts
1. **Follower Count Distribution**
   - Bar chart: 1k-5k, 5k-10k, 10k-30k, 30k-50k

2. **Quality Score Distribution**
   - Pie chart: Excellent, Good, Fair, Poor

3. **Content Category Distribution**
   - Bar chart: Contract Trading, Crypto Trading, Web3

4. **Status Distribution**
   - Donut chart: New, Contacted, Replied, etc.

#### FR-5.3: Template Effectiveness
- **Table showing:**
  - Template name
  - Times used
  - Response count
  - Response rate (%)
  - Average response time (hours)

- **Sort by:** Response rate (default)

#### FR-5.4: Contact Timeline
- **Line chart:** Contacts sent per day (last 30 days)
- **Overlay:** Responses received per day
- **Goal line:** 100 contacts/week

#### FR-5.5: Export Functionality
- **Export options:**
  1. Current filtered KOL list → CSV
  2. Full database → CSV
  3. Analytics summary → PDF (future)

- **CSV columns:**
  - Username, Display Name, Follower Count, Status, Quality Score, Last Contact, Tags, Notes

---

### 5.6 Module 6: Browser Extension

#### FR-6.1: Extension UI
- **Popup (when clicking extension icon):**
  - Logo and title
  - Current KOL info (if on Twitter profile page)
  - "Quick Add" button
  - "View in Dashboard" button (opens web app)
  - Settings link

- **Badge:**
  - Show count of KOLs captured today

#### FR-6.2: Content Script (Twitter Page)
- **Injected elements:**
  - Small badge next to KOL username showing quality score (if in database)
  - Quick action buttons:
    - "Add to Database"
    - "Mark as Contacted"
    - "View Details" (opens web app in new tab)

#### FR-6.3: Background Service
- **Functions:**
  - Listen for messages from content script
  - Send API requests to backend
  - Manage authentication token
  - Handle notifications

#### FR-6.4: Batch Import from Following List
- **Process:**
  1. User navigates to twitter.com/following
  2. Opens extension popup
  3. Clicks "Import Following List"
  4. Extension:
     - Scrolls page to load all accounts
     - Extracts usernames, names, follower counts
     - Sends batch to backend API
     - Backend filters and scores
     - Shows summary: "Added 50/120 accounts (70 filtered out)"

---

## 6. Non-Functional Requirements

### 6.1 Performance
- **Page Load Time:** <2 seconds for all pages
- **API Response Time:** <500ms for CRUD operations
- **Search/Filter:** <1 second for results
- **Batch Import:** <10 seconds for 100 KOLs
- **AI Template Generation:** <10 seconds

### 6.2 Scalability
- **Database:** Support 10,000+ KOLs without performance degradation
- **Concurrent Users:** 5-10 BD team members simultaneously
- **Data Retention:** Unlimited contact history

### 6.3 Usability
- **Learning Curve:** New user productive within 30 minutes
- **Mobile Responsive:** Core features accessible on tablet (optional for MVP)
- **Accessibility:** WCAG 2.1 Level AA compliance (future)

### 6.4 Reliability
- **Uptime:** 99% (excluding planned maintenance)
- **Data Backup:** Daily automated backups
- **Error Handling:** Graceful degradation, clear error messages

### 6.5 Maintainability
- **Code Quality:** Linted, formatted, type-safe (TypeScript)
- **Documentation:** Inline comments, API docs, README
- **Testing:** Unit tests for critical functions (future)

---

## 7. User Interface Requirements

### 7.1 Layout
- **Navigation:** Sidebar with icons and labels
  - Dashboard
  - KOLs (with count badge)
  - Templates
  - Analytics
  - Settings

- **Header:**
  - Logo
  - Search bar (global)
  - User menu (profile, logout)

### 7.2 Color Scheme
- **Primary:** Blue (#1890ff) - professional, trustworthy
- **Success:** Green (#52c41a)
- **Warning:** Orange (#faad14)
- **Danger:** Red (#f5222d)
- **Neutral:** Grays (#f0f0f0, #d9d9d9, #8c8c8c)

### 7.3 Typography
- **Font Family:** Inter, system-ui, sans-serif
- **Headings:** 24px, 20px, 16px (bold)
- **Body:** 14px (regular)
- **Small:** 12px

### 7.4 Responsive Design
- **Desktop:** Optimized for 1920x1080 and 1366x768
- **Tablet:** Functional on iPad (optional MVP)
- **Mobile:** Not required for MVP

### 7.5 Components (Ant Design)
- Tables with pagination
- Modals for forms
- Dropdowns for filters
- Tags for labels
- Cards for statistics
- Tooltips for explanations
- Notifications for feedback

---

## 8. Integration Requirements

### 8.1 Twitter/X Data
- **Method:** Browser extension scraping (no official API required for MVP)
- **Data Points:**
  - Profile: username, name, bio, follower count, verified status, avatar
  - Tweets: content, date, likes, retweets, replies

- **Future:** Consider third-party APIs (Apify, ScrapFly) for advanced features

### 8.2 AI APIs
- **Providers:**
  1. **OpenAI GPT-4** (primary)
     - Endpoint: chat/completions
     - Use: Template generation, content analysis

  2. **Anthropic Claude** (backup)
     - Endpoint: messages
     - Use: Same as OpenAI

- **Configuration:**
  - API keys stored in environment variables
  - User can switch providers in settings
  - Fallback to no AI if both fail

### 8.3 Authentication
- **Method:** JWT (JSON Web Tokens)
- **Flow:**
  1. User logs in with email/password
  2. Backend validates and returns JWT
  3. Frontend stores in localStorage
  4. Include in Authorization header for all API requests

- **Token Expiry:** 7 days (refreshable)

---

## 9. Security Requirements

### 9.1 Account Safety
- **Critical Rule:** NO automated DM sending
- **Rationale:** Twitter aggressively bans accounts that automate DMs
- **Implementation:**
  - Copy-to-clipboard only
  - Manual sending required
  - Logging done after manual action

### 9.2 Data Protection
- **Sensitive Data:**
  - User passwords (hashed with bcrypt)
  - API keys (encrypted in database)
  - Contact notes (may contain negotiation details)

- **Access Control:**
  - Users can only see their own KOLs and templates
  - Admin role for team managers (future)

### 9.3 Input Validation
- **Backend:** Pydantic schemas validate all inputs
- **Frontend:** Client-side validation with error messages
- **Protection Against:**
  - SQL injection (using ORM)
  - XSS (sanitize user-generated content)
  - CSRF (CORS configuration)

### 9.4 Rate Limiting
- **API endpoints:**
  - Authentication: 5 requests/minute
  - CRUD operations: 100 requests/minute
  - AI generation: 10 requests/minute

- **Purpose:** Prevent abuse and manage costs

---

## 10. Future Enhancements

### 10.1 Advanced KOL Discovery
- **Seed expansion** with Twitter API or scraping service
- **Competitor analysis** (find KOLs working with other exchanges)
- **Trend detection** (identify rising KOLs early)

### 10.2 Collaboration Features
- **Team workspace:** Multiple users sharing KOL database
- **Assignment system:** Assign KOLs to specific team members
- **Activity feed:** See what teammates are working on

### 10.3 Advanced Analytics
- **Predictive scoring:** ML model to predict partnership success
- **A/B testing:** Compare template variants
- **ROI tracking:** Cost per partnership vs. value generated

### 10.4 Communication Integration
- **Email integration:** Send outreach via email (not just Twitter DM)
- **CRM sync:** Export to Salesforce, HubSpot, etc.
- **Notifications:** Slack/Discord alerts for responses

### 10.5 Automation (with caution)
- **Scheduled follow-ups:** Reminder to follow up after X days
- **Auto-tagging:** AI suggests tags based on profile analysis
- **Smart recommendations:** "You should contact these 5 KOLs today"

---

## Appendix A: User Stories

### Epic 1: Template Management
- **US-1.1:** As a BD intern, I want to create message templates so I can quickly compose outreach messages.
- **US-1.2:** As a BD intern, I want to use variables in templates so each message is personalized.
- **US-1.3:** As a BD intern, I want AI to generate template variations so I avoid repetitive messages.

### Epic 2: KOL Discovery
- **US-2.1:** As a BD intern, I want to import KOLs by username so I can quickly add prospects.
- **US-2.2:** As a BD intern, I want the system to filter out irrelevant KOLs so I focus on quality leads.
- **US-2.3:** As a BD intern, I want to see quality scores so I prioritize high-value KOLs.

### Epic 3: CRM
- **US-3.1:** As a BD intern, I want to view all KOLs in a list so I can manage my pipeline.
- **US-3.2:** As a BD intern, I want to filter by status so I see who needs follow-up.
- **US-3.3:** As a BD intern, I want to log contact history so I remember past conversations.
- **US-3.4:** As a BD intern, I want to tag KOLs so I can organize by priority or category.

### Epic 4: Outreach
- **US-4.1:** As a BD intern, I want to select a template and preview the message so I ensure it's correct.
- **US-4.2:** As a BD intern, I want to copy messages to clipboard so I can manually send on Twitter.
- **US-4.3:** As a BD intern, I want to log sent messages so I track my outreach activity.

### Epic 5: Analytics
- **US-5.1:** As a BD manager, I want to see weekly statistics so I monitor team performance.
- **US-5.2:** As a BD manager, I want to export KOL data so I can report to leadership.
- **US-5.3:** As a BD intern, I want to see which templates work best so I improve my approach.

---

## Appendix B: Glossary

- **KOL:** Key Opinion Leader - Influencer with significant social media following
- **BD:** Business Development - Team responsible for partnerships and growth
- **CRM:** Customer Relationship Management - System for managing interactions
- **DM:** Direct Message - Private message on Twitter
- **MVP:** Minimum Viable Product - First version with core features
- **CRUD:** Create, Read, Update, Delete - Basic database operations
- **JWT:** JSON Web Token - Authentication standard
- **API:** Application Programming Interface
- **UI/UX:** User Interface / User Experience

---

**End of Requirements Document**

*This document will be updated as requirements evolve. All changes will be tracked in version history.*
