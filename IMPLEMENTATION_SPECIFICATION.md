# Meeting Analytics System – Implementation Specification

This document describes the full implementation requirements for two dashboards:

1. **Meeting Structure Dashboard** (objective calendar-based data)
2. **Meeting Impact Dashboard** (subjective post-meeting feedback data)

This specification is self-contained and provides all necessary details for implementation.

---

# SYSTEM OVERVIEW

The system consists of two logically separated dashboards:

- The **Structure Dashboard** analyzes objective meeting metadata from calendar integrations.
- The **Impact Dashboard** analyzes subjective feedback collected after meetings.

These dashboards must be implemented independently, but may optionally support correlation between structural and feedback data.

---

# GLOBAL REQUIREMENTS (BOTH DASHBOARDS)

## 1. Filters (Required)

Both dashboards must support:

- Date range selector (week, month, custom range)
- Personal view (individual user)
- Team view (aggregated, privacy-safe) will be implemented in a later phase.
- Meeting type filter
- Time-of-day filter

---

## 2. Privacy Rules (Team Mode)

When displaying aggregated team data:

- No individual-level ranking.
- No exposure of individual user names.
- Minimum aggregation threshold (e.g., group size >= 5).
- No raw comments linked to individuals.
- Only averages, percentages, and distributions.

---

## 3. Data Separation

Structural and subjective data must be stored and processed separately.

- Calendar data → Structure Dashboard
- Feedback data → Impact Dashboard

A correlation layer may optionally combine them, but dashboards must function independently.

---

# DASHBOARD 1  
# Meeting Structure Dashboard

## Purpose

This dashboard analyzes objective meeting characteristics derived from calendar metadata.

It answers:

- How often meetings occur
- How long they last
- When they occur
- How much they fragment working time
- How much uninterrupted focus time remains

It must not use any subjective feedback data.

---

## Data Inputs

For each meeting:

- meeting_id
- start_time
- end_time
- duration_minutes
- recurring (boolean)
- meeting_type (classified)
- organizer (optional)
- number_of_participants
- day_of_week
- time_of_day_bucket (Morning 8–12, Midday 12–15, Afternoon 15–18)

Derived metrics:

- meetings_per_day
- meeting_minutes_per_day
- average_meeting_duration
- recurring_ratio
- continuous_free_blocks (>= 60, >= 90, >= 120 minutes)
- short_gap_count (gaps < 30 minutes)
- fragmentation_score

---

## Widget 1 – KPI Summary Row

Display:

- Total meetings (selected period)
- Total meeting time (hours)
- Average meeting duration
- Average meetings per day

Purpose:
Provides transparency about meeting load.

---

## Widget 2 – Meeting Type Distribution

Chart type: Bar or Donut

Display:

- Absolute count per meeting type
- Percentage per meeting type

Types:

- Stand-up
- Planning
- Retrospective
- 1:1
- Ad-hoc
- Other

Purpose:
Shows structural composition of meeting culture.

---

## Widget 3 – Meeting Timing Analysis

Display:

- Distribution of meetings by time-of-day bucket
- Optional: heatmap by weekday and time bucket

Buckets:

- Morning (8–12)
- Midday (12–15)
- Afternoon (15–18)

Purpose:
Analyzes when meetings occur during the workday.

---

## Widget 4 – Focus Time Analysis

Compute uninterrupted blocks between meetings.

For each day:

- Count of uninterrupted time blocks >= 60 minutes
- Count >= 90 minutes
- Count >= 120 minutes

Display:

- Weekly total of focus blocks
- Optional visualization per day

Purpose:
Measures potential deep work opportunities.

---

## Widget 5 – Fragmentation Score

Compute a score between 0–100 indicating how fragmented a workday is.

Example scoring model:

fragmentation_score =
  (meetings_per_day * 0.4)
+ (short_gap_count * 0.4)
+ (percentage_of_day_fragmented * 0.2)

Display:

- Average fragmentation score
- Trend over time

Purpose:
Quantifies structural disruption caused by meetings.

---

## Widget 6 – Recurring vs Ad-hoc Ratio

Display:

- % recurring meetings
- % ad-hoc meetings

Purpose:
Provides insight into predictability of meeting culture.

---

# DASHBOARD 2  
# Meeting Impact Dashboard

## Purpose

This dashboard analyzes subjective evaluations collected immediately after meetings.

It measures:

- Perceived efficiency
- Emotional impact
- Energy after meetings
- Focus disruption
- Perceived value

This dashboard must not depend on structural metrics as primary data.

---

## Data Inputs

For each feedback entry:

- meeting_id
- perceived_efficiency (1–5 scale)
- emotional_impact (-2 to +2 OR categorical: stressed/neutral/motivated)
- energy_after_meeting (1–5 scale)
- perceived_value (boolean OR 1–5)
- perceived_focus_disruption (1–5 scale)
- optional free_text_comment
- time_of_day_bucket
- meeting_type

Derived metrics:

- average_efficiency
- average_emotional_score
- average_energy_after
- percentage_valuable
- distribution of emotional states
- aggregation per meeting_type
- aggregation per time_of_day
- trend over time

---

## Widget 1 – KPI Summary Row

Display:

- Average efficiency score
- Average emotional score
- Average energy-after score
- % meetings rated valuable

Purpose:
Provides overall perception of meeting quality.

---

## Widget 2 – Sentiment Distribution

Display:

- % stressed
- % neutral
- % motivated

Chart type: Bar or stacked bar

Purpose:
Captures emotional impact of meetings.

---

## Widget 3 – Efficiency Distribution

Display:

- Distribution across 1–5 scale
- % low (1–2), medium (3), high (4–5)

Purpose:
Measures perceived meeting effectiveness.

---

## Widget 4 – Impact by Meeting Type

For each meeting type display:

- Average efficiency
- Average emotional impact
- Average energy after
- Average focus disruption

Chart type: Table or grouped bar chart

Purpose:
Compares how different meeting types are experienced.

---

## Widget 5 – Impact by Time of Day

For each time bucket (Morning, Midday, Afternoon):

Display:

- Average efficiency
- Average stress/emotion score
- Average focus disruption

Purpose:
Analyzes whether timing influences perceived impact.

---

## Widget 6 – Focus Disruption Perception

Display:

- Average focus disruption score
- Trend over time
- Optional correlation with meeting duration

Purpose:
Measures how meetings subjectively interrupt concentration.

---

## Widget 7 – Top Qualitative Themes (Optional)

Process free-text comments:

- Cluster recurring themes
- Extract top 5 recurring issues

Display example:

- “Too long”
- “No clear agenda”
- “Too many participants”
- “Could have been async”

Purpose:
Supports structured team reflection.

---

# OPTIONAL – CORRELATION LAYER

The system may optionally provide correlation analysis:

- Meeting duration vs perceived efficiency
- Time of day vs stress
- Fragmentation score vs focus disruption perception

This must not break structural separation of dashboards.

---

# FINAL SYSTEM LOGIC

The system provides two complementary perspectives:

1. Structure Dashboard → What objectively happens in meeting culture.
2. Impact Dashboard → How meetings are experienced by participants.

Together, they enable:

- Analysis of meeting frequency, timing, and duration
- Evaluation of individual meetings
- Identification of structural and emotional improvement areas
- Privacy-safe team reflection

---

# IMPLEMENTATION CONSTRAINTS

- Clean UI separation between dashboards
- Shared filter system
- Privacy-safe aggregation
- No performance evaluation of individuals
- Export capability for research analysis (CSV or JSON)

---
