# Feature Spec: Feedback Inbox + Post-Meeting Survey Modal

## Goal
Implement a panel that lists all completed meetings that still require user feedback. Users can either:
- **Give feedback** (opens a modal with a very short survey), or
- **Dismiss** (mark as dismissed, meaning the user does not want to provide feedback for that meeting).

This feature enables collecting subjective “meeting impact” data with minimal friction.

---

## UI: Feedback Inbox Panel

### Name (UI Label)
**Feedback Inbox**

### Entry Point
- Accessible from the main navigation (e.g., top bar icon/button).
- Show a badge count = number of pending feedback items.

### Core Behavior
- Show **only meetings that have ended** and are in **PENDING** status (not yet submitted, not dismissed).
- Each meeting appears as a **card/list row** with actions.

### Panel Controls
- Date range filter: `Today`, `This week`, `All`
- Optional toggle: `Show dismissed` (default off)
- Sort order: Most recent meeting first

---

## Meeting Card (Inbox Item)

### Displayed Fields
- Meeting title
- Date + time (start–end)
- Duration
- Meeting type (chip/label; e.g., Stand-up, Planning, Retro, 1:1, Ad-hoc, Other)

### Actions
1. **Give feedback** (primary button)
   - Opens the survey modal for this meeting.
2. **Dismiss** (secondary button/icon)
   - Immediately marks as dismissed.
   - Provide a short “Undo” action via toast/snackbar for ~10 seconds.

---

## Data Model

### Feedback Status (per user per meeting)
Store a record keyed by `(user_id, meeting_id)`:

- `meeting_id`
- `user_id`
- `status`: `PENDING | SUBMITTED | DISMISSED`
- `created_at` (when the meeting first became feedbackable)
- `submitted_at` (if SUBMITTED)
- `dismissed_at` (if DISMISSED)
- `dismiss_reason` (optional enum)

### Eligibility Rule (when an item appears in the inbox)
A meeting is **feedbackable** if:
- user is a participant
- meeting has ended: `meeting.end_time < now`
- status is `PENDING` (or no record yet, treated as PENDING)

Badge count and inbox list are based on this rule.

---

## Dismiss Reasons (Optional Enum)
If you collect a reason, store one of:
- `NOT_RELEVANT`
- `TOO_BUSY`
- `PRIVATE`
- `DONT_REMEMBER`
- `OTHER`

(Reason collection can be skipped; still store DISMISSED.)

---

## Survey Modal (Opened from “Give feedback”)

### Modal Content
- Show meeting title and time at top.
- Single-page form (no stepper).
- Primary actions: `Submit`, `Cancel`

### Submit Behavior
- Persist feedback answers
- Set status to `SUBMITTED`
- Close modal
- Remove item from inbox list
- Update badge count

### Cancel Behavior
- Close modal
- Keep status as `PENDING`
- Item remains in inbox

---

## Survey Questions (Short, High-Value)

### Q1: ROTI / Outcome Score (Required)
**Prompt:** “This meeting was a good use of my time.”
- Likert scale: 1–5
  - 1 = Strongly disagree
  - 5 = Strongly agree

Store: `roti_score` (int 1..5)

---

### Q2: Mood After Meeting (Required)
**Prompt:** “How do you feel after this meeting?”
- 3 options:
  - Negative
  - Neutral
  - Positive

Store: `mood` (enum `NEGATIVE | NEUTRAL | POSITIVE`)
Optional derived numeric mapping: `mood_score` (-1, 0, +1)

---

### Q3: Energy After Meeting (Required)
**Prompt:** “How energized do you feel after this meeting?”
- Likert scale: 1–5
  - 1 = Drained
  - 5 = Energized

Store: `energy_after` (int 1..5)

---

### Q4: Main Reasons (Conditional)
Show this only if any of the following is true:
- `roti_score <= 2` OR
- `mood == NEGATIVE` OR
- `energy_after <= 2`

**Prompt:** “What were the main issues?” (multi-select)

Options (store as list of enums):
- `NO_CLEAR_AGENDA`
- `TOO_LONG`
- `TOO_MANY_PARTICIPANTS`
- `NOT_RELEVANT_FOR_ME`
- `COULD_HAVE_BEEN_ASYNC`
- `NO_DECISIONS_OR_NEXT_STEPS`
- `POOR_PREPARATION`
- `SCOPE_TOO_BROAD`
- `DOMINATED_BY_FEW`
- `TECHNICAL_ISSUES`

Store: `issue_tags` (array of enums)

Optional free text (only shown when Q4 is shown):
- Prompt: “Anything else?”
- Store: `comment` (string, optional)

---

### Optional (Recommended): Async Potential (Always Visible)
Add a single yes/no toggle:

**Prompt:** “Could this have been asynchronous?”
- Yes / No

Store: `could_be_async` (boolean)

---

## API / Persistence Requirements

### Endpoints / Operations (conceptual)
- `GET pending_feedback_meetings(user_id, date_range, filters)`
- `POST submit_meeting_feedback(user_id, meeting_id, payload)`
- `POST dismiss_meeting_feedback(user_id, meeting_id, reason?)`
- `POST undo_dismiss(user_id, meeting_id)` (optional; can also be client-side revert if not persisted immediately)

### Payload for Submit
```json
{
  "meeting_id": "string",
  "roti_score": 4,
  "mood": "NEUTRAL",
  "energy_after": 3,
  "could_be_async": false,
  "issue_tags": ["NO_CLEAR_AGENDA", "TOO_LONG"],
  "comment": "optional string"
}
