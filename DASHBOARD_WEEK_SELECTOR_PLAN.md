# Dashboard Week-Selector Refactoring Plan

## Executive Summary

Replace the current `DashboardTabsComponent` (Structure / Impact tab switcher) with a **week-range selector** that scopes **every** widget on both dashboards to a single Monday–Sunday window. The tabs themselves remain, but the filter bar above them is replaced by `◀ Mon, Feb 2 – Sun, Feb 8, 2026 ▶` navigation arrows.

---

## 1. Current State Analysis

### 1.1 Dashboard Architecture

```
DashboardComponent                       ← holds activeTab signal
├── DashboardTabsComponent (shared)      ← "Structure | Impact" tab bar (not yet created)
├── StructureDashboardComponent          ← not yet created
│   ├── StatCardComponent × 4
│   ├── MeetingsByDayChartComponent
│   ├── MeetingsTrendChartComponent
│   ├── DurationBreakdownChartComponent
│   ├── MeetingTypeDistributionChart     ← planned
│   ├── RecurringRatioWidget             ← planned
│   ├── TimingAnalysisChart              ← planned
│   ├── FocusBlocksChart                 ← planned
│   ├── FragmentationScoresChart         ← planned
│   └── UpcomingMeetingsComponent
└── ImpactDashboardComponent             ← not yet created
    ├── StatCardComponent × 4
    ├── ImpactByTypeChart                ← planned
    ├── ImpactByTimeChart                ← planned
    ├── EfficiencyDistributionChart       ← planned
    ├── SentimentDistributionChart        ← planned
    ├── QualitativeThemesChart            ← planned
    └── FocusDisruptionChart              ← planned
```

### 1.2 Current Data Sources (Mock JSON)

| File | Time Span | Granularity | Has Dates? |
|---|---|---|---|
| `meetings-weekly.json` | 8 weeks (Dec 16 – Feb 3) | per-week aggregates | Week labels only |
| `meetings-by-day.json` | all-time aggregate | per-weekday (Mon–Fri) | No |
| `meetings-duration.json` | all-time aggregate | bucketed | No |
| `upcoming-meetings.json` | 5 meetings (Feb 9–11) | individual events | Yes |
| `structure/meetings.json` | Dec 16 – Feb 12 | 105 individual meetings | Yes (`start_time`) |
| `structure/structure-summary.json` | all-time + "last week" | aggregate | No |
| `structure/meeting-type-distribution.json` | all-time | by type | No |
| `structure/recurring-ratio.json` | all-time | aggregate | No |
| `structure/timing-analysis.json` | all-time | by time-of-day bucket | No |
| `structure/focus-blocks.json` | Feb 2 – Feb 12 (~2 weeks) | daily | Yes |
| `structure/fragmentation-scores.json` | Jan 19 – Feb 12 (~4 weeks) | daily | Yes |
| `impact/feedback.json` | Dec 16 – Feb 12 | 93 individual entries | Yes (`feedback_timestamp`) |
| `impact/impact-summary.json` | all-time + "last week" | aggregate | No |
| `impact/impact-by-type.json` | all-time | by meeting type | No |
| `impact/impact-by-time.json` | all-time | by time-of-day | No |
| `impact/efficiency-distribution.json` | all-time | histogram | No |
| `impact/sentiment-distribution.json` | all-time | by sentiment | No |
| `impact/qualitative-themes.json` | all-time | by theme | No |
| `impact/focus-disruption.json` | Jan 19 – Feb 12 (~4 weeks) | daily | Yes |

### 1.3 Key Problem

- No date-range filtering exists; all widgets show aggregated or hard-coded data.
- `meetings-weekly.json` shows 8 weeks; `fragmentation-scores.json` shows 4 weeks — both exceed a 7-day window.
- Pre-aggregated files (`meetings-by-day.json`, `meeting-type-distribution.json`, etc.) cannot be filtered at all without raw data.

---

## 2. Target State

### 2.1 UI Layout Change

**Before:**
```
┌──────────────────────────────────────────────┐
│  Welcome back, username                      │
│  Here's your meeting analytics overview.     │
│                                              │
│  [ Structure ]  [ Impact ]                   │ ← tabs only
│                                              │
│  ┌──────────┐ ┌──────────┐ ...               │
│  │ Stat Card│ │ Stat Card│                   │
│  └──────────┘ └──────────┘                   │
│  ...                                         │
└──────────────────────────────────────────────┘
```

**After:**
```
┌──────────────────────────────────────────────────────────┐
│  Welcome back, username                                  │
│  Here's your meeting analytics overview.                 │
│                                                          │
│  ◀   Mon, Feb 2 – Sun, Feb 8, 2026   ▶   [Today]       │ ← week selector
│                                                          │
│  [ Structure ]  [ Impact ]                               │ ← tabs stay
│                                                          │
│  ┌──────────┐ ┌──────────┐ ...                           │
│  │ Stat Card│ │ Stat Card│                               │
│  └──────────┘ └──────────┘                               │
│  ...                                                     │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Week Definition

- **Week starts on Monday 00:00:00 and ends on Sunday 23:59:59** (ISO 8601 week).
- Default selection on load: the week containing today.
- The "Today" shortcut button jumps back to the current week.
- Right arrow is disabled / hidden when the selected week is the current week (no future navigation).

### 2.3 Data Flow

```
DashboardComponent
│
│  selectedWeekStart: Signal<Date>          ← always a Monday
│  selectedWeekEnd:   Signal<Date>          ← derived: weekStart + 6 days (Sunday)
│
├── WeekSelectorComponent                   ← NEW: replaces filter area
│     @Input  weekStart
│     @Output weekChange (emits new Monday)
│
├── DashboardTabsComponent                  ← stays, unchanged
│
├── StructureDashboardComponent
│     @Input  weekStart, weekEnd
│     → StructureDashboardService.getData(weekStart, weekEnd)
│     → passes filtered data to child widgets
│
└── ImpactDashboardComponent
      @Input  weekStart, weekEnd
      → ImpactDashboardService.getData(weekStart, weekEnd)
      → passes filtered data to child widgets
```

---

## 3. New Component: `WeekSelectorComponent`

### 3.1 File Location

```
frontend/src/app/features/dashboard/components/shared/week-selector.component.ts
```

### 3.2 Specification

| Property | Detail |
|---|---|
| **Inputs** | `weekStart: Date` (the Monday of the currently selected week) |
| **Outputs** | `weekChange: EventEmitter<Date>` (emits a new Monday when the user clicks an arrow) |
| **Display** | `◀  Mon, Feb 2 – Sun, Feb 8, 2026  ▶` centered label with arrow buttons |
| **Today button** | Small "Today" pill/button to the right of the arrows; jumps to the current week; hidden when already on the current week |
| **Right-arrow disabled** | When `weekStart` falls in the current ISO week |

### 3.3 Template Sketch

```html
<div class="flex items-center justify-center gap-x-3">
  <!-- Previous week -->
  <button (click)="goToPreviousWeek()" class="...">
    <!-- left chevron SVG -->
  </button>

  <!-- Date range label -->
  <span class="text-sm font-medium text-foreground min-w-[260px] text-center">
    {{ weekStart | date:'EEE, MMM d' }} – {{ weekEnd | date:'EEE, MMM d, y' }}
  </span>

  <!-- Next week -->
  <button (click)="goToNextWeek()" [disabled]="isCurrentWeek" class="...">
    <!-- right chevron SVG -->
  </button>

  <!-- Today shortcut -->
  @if (!isCurrentWeek) {
    <button (click)="goToToday()" class="...">Today</button>
  }
</div>
```

### 3.4 Logic

```typescript
goToPreviousWeek(): void {
  const prev = new Date(this.weekStart());
  prev.setDate(prev.getDate() - 7);
  this.weekChange.emit(prev);
}

goToNextWeek(): void {
  if (this.isCurrentWeek) return;
  const next = new Date(this.weekStart());
  next.setDate(next.getDate() + 7);
  this.weekChange.emit(next);
}

goToToday(): void {
  this.weekChange.emit(getMondayOfCurrentWeek());
}
```

### 3.5 Utility Helper (Shared)

Create `frontend/src/app/features/dashboard/utils/week.utils.ts`:

```typescript
/** Returns the Monday 00:00 of the ISO week that contains `date`. */
export function getMonday(date: Date): Date { ... }

/** Returns the Sunday 23:59:59 of the same ISO week. */
export function getSunday(monday: Date): Date { ... }

/** Checks whether two Mondays represent the same week. */
export function isSameWeek(a: Date, b: Date): boolean { ... }

/** Formats a week range for display: "Mon, Feb 2 – Sun, Feb 8, 2026" */
export function formatWeekRange(monday: Date): string { ... }

/** Returns true when a given date falls within [weekStart, weekEnd]. */
export function isDateInWeek(date: Date | string, weekStart: Date, weekEnd: Date): boolean { ... }
```

---

## 4. Changes to `DashboardComponent`

### 4.1 New Signals

```typescript
selectedWeekStart = signal<Date>(getMonday(new Date()));
selectedWeekEnd = computed(() => getSunday(this.selectedWeekStart()));
```

### 4.2 Week Change Handler

```typescript
onWeekChange(newMonday: Date): void {
  this.selectedWeekStart.set(newMonday);
}
```

### 4.3 Updated Template

```html
<!-- Week Selector (replaces old filter position) -->
<div class="mb-6">
  <app-week-selector
    [weekStart]="selectedWeekStart()"
    (weekChange)="onWeekChange($event)"
  />
</div>

<!-- Tabs (kept) -->
<div class="mb-6">
  <app-dashboard-tabs
    [activeTab]="activeTab()"
    (tabChange)="onTabChange($event)"
  />
</div>

<!-- Dashboard content — now receives the week range -->
@if (activeTab() === 'structure') {
  <app-structure-dashboard
    [weekStart]="selectedWeekStart()"
    [weekEnd]="selectedWeekEnd()"
  />
} @else {
  <app-impact-dashboard
    [weekStart]="selectedWeekStart()"
    [weekEnd]="selectedWeekEnd()"
  />
}
```

---

## 5. Widget-by-Widget Modification Plan

### Overview Table

| # | Widget | Current Data Span | Required Change | Filtering Source |
|---|---|---|---|---|
| 5.1 | Stat Cards (Structure) | All-time + "last week" | Compute from selected week vs previous week | `meetings.json` |
| 5.2 | Meetings Trend Chart | 8 weeks (area chart) | **Replace**: show daily meetings + hours for the 7 days of the selected week | `meetings.json` |
| 5.3 | Meetings by Day Chart | Aggregated Mon–Fri | Show actual per-day counts for the selected week | `meetings.json` |
| 5.4 | Duration Breakdown Chart | All-time short/med/long | Recompute buckets from selected week's meetings only | `meetings.json` |
| 5.5 | Upcoming Meetings Table | 5 hard-coded future meetings | Rename to "Meetings This Week"; show all meetings in selected week | `meetings.json` |
| 5.6 | Meeting Type Distribution | All-time by type | Recompute from selected week's meetings | `meetings.json` |
| 5.7 | Recurring Ratio | All-time aggregate | Recompute from selected week's meetings | `meetings.json` |
| 5.8 | Timing Analysis | All-time by time bucket | Recompute from selected week's meetings | `meetings.json` |
| 5.9 | Focus Blocks Chart | ~2 weeks daily | Filter to 5–7 days in selected week | `focus-blocks.json` |
| 5.10 | Fragmentation Scores Chart | ~4 weeks daily | Filter to 5–7 days in selected week | `fragmentation-scores.json` |
| 5.11 | Stat Cards (Impact) | All-time + "last week" | Compute from selected week's feedback vs previous week | `feedback.json` |
| 5.12 | Impact by Type | All-time by type | Filter feedback to selected week, recompute averages | `feedback.json` |
| 5.13 | Impact by Time | All-time by time-of-day | Filter feedback to selected week, recompute averages | `feedback.json` |
| 5.14 | Efficiency Distribution | All-time histogram | Filter feedback to selected week, recount | `feedback.json` |
| 5.15 | Sentiment Distribution | All-time by sentiment | Filter feedback to selected week, recount | `feedback.json` |
| 5.16 | Qualitative Themes | All-time by theme | Filter feedback to selected week, recount (see notes) | `feedback.json` |
| 5.17 | Focus Disruption Chart | ~4 weeks daily | Filter to 5–7 days in selected week | `focus-disruption.json` |

---

### 5.1 Stat Cards (Structure Dashboard)

**Current behavior:** 4 stat cards driven by `MeetingSummary` from `meetings-weekly.json` (`thisWeek`, `lastWeek`, `totalHoursThisWeek`, etc.). Each card shows a value and a `% change from last week` indicator.

**Required changes:**

1. **Data computation moves to `StructureDashboardService`.**
2. The service loads `structure/meetings.json` (all 105 meetings with `start_time`).
3. Filters meetings where `start_time` falls within `[weekStart, weekEnd]` → **selected week meetings**.
4. Filters meetings where `start_time` falls within `[weekStart - 7 days, weekStart - 1 day]` → **previous week meetings**.
5. Computes:

| Stat Card | Value (selected week) | Comparison (previous week) |
|---|---|---|
| Total Meetings | `selectedMeetings.length` | `prevMeetings.length` |
| Total Hours | `sum(duration_minutes) / 60` | same for prev |
| Avg Duration | `mean(duration_minutes)` rounded | same for prev |
| Avg Meetings / Day | `selectedMeetings.length / workingDaysInWeek` | same for prev |

6. **Change % formula:** `((current - previous) / previous) * 100`. Handle `previous = 0` as "N/A" or `+100%`.

**Component changes:**
- `StatCardComponent` itself needs **no** template changes — it already accepts `title`, `value`, `change` inputs.
- The parent (`StructureDashboardComponent`) computes and passes the correct values.

---

### 5.2 Meetings Trend Chart → **"Daily Meetings" Chart**

**Current behavior:** Area chart with 8 x-axis labels (week labels like "Dec 16", "Dec 23"…), two series: Meetings count and Hours.

**Problem:** 8 weeks of data does not make sense for a 1-week view.

**Required changes:**

1. **Rename** the chart title from "Meetings Over Time" → **"Daily Overview"**.
2. **X-axis:** Change from week labels to the 7 day labels of the selected week: `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`.
3. **Series data:** For each day in the selected week, compute:
   - `meetings`: count of meetings on that day
   - `hours`: sum of `duration_minutes / 60` for meetings on that day
4. **Chart type:** Keep as `area` or switch to `bar` — area still works for daily granularity.

**Input change:**
```typescript
// Before
weeks = input.required<WeekData[]>();

// After
dailyData = input.required<DailyOverviewData[]>();
// where DailyOverviewData = { day: string; meetings: number; hours: number; }
```

**Data source:** Computed from filtered `meetings.json` entries grouped by date.

---

### 5.3 Meetings by Day Chart

**Current behavior:** Bar chart with 5 bars: Mon (4), Tue (3), Wed (2), Thu (3), Fri (2) — all-time aggregated counts.

**Required changes:**

1. **Data:** Filter `meetings.json` to the selected week, then count meetings per `day_of_week`.
2. **X-axis labels:** Use actual date labels instead of just weekday names:
   - Example: `Mon 2/2`, `Tue 2/3`, `Wed 2/4`, `Thu 2/5`, `Fri 2/6` (optionally include Sat/Sun if there are weekend meetings).
3. **Y-axis:** Stays as "Meetings" count.

**Input change:**
```typescript
// Before
days = input.required<DayData[]>();
// DayData = { day: string; count: number; }

// After — same interface, but `day` now includes date
// e.g. { day: "Mon 2/2", count: 3 }
```

**Component change:** Minimal — only the data fed in changes. The chart template stays the same.

---

### 5.4 Duration Breakdown Chart

**Current behavior:** Donut chart with 3 slices: "Short (< 30 min)" = 5, "Medium (30–60 min)" = 6, "Long (> 60 min)" = 3.

**Required changes:**

1. **Data:** Filter `meetings.json` to the selected week.
2. **Recompute buckets:**
   - Short: `duration_minutes < 30`
   - Medium: `30 <= duration_minutes <= 60`
   - Long: `duration_minutes > 60`
3. Count meetings in each bucket.
4. **Empty state:** If the selected week has 0 meetings, show "No meetings this week" placeholder instead of an empty donut.

**Input change:** None — same `DurationData[]` interface. The parent just provides recomputed data.

**Component change:** Add an `@if (breakdown().length === 0)` empty state.

---

### 5.5 Upcoming Meetings → **"Meetings This Week"**

**Current behavior:** Table listing 5 hard-coded upcoming meetings with title, date, duration, attendees.

**Required changes:**

1. **Rename** heading from "Upcoming Meetings" → **"Meetings This Week"**.
2. **Data:** Filter `meetings.json` to the selected week. Map each meeting to the table display format.
3. **Mapping** from raw meeting fields:

| Table Column | Source Field |
|---|---|
| Title | Derive from `meeting_type` + `organizer` (e.g. "Stand-up – Alice") since raw meetings don't have a `title` field. Or add a `title` field to the raw data. |
| Date | `start_time` formatted |
| Duration | `duration_minutes` + " min" |
| Attendees | `number_of_participants` (count only, since raw data doesn't have names) |

4. **Sort** by `start_time` ascending.
5. **Empty state:** "No meetings this week" if the filtered list is empty.

**Model change:** Adjust `UpcomingMeeting` interface or create a new `WeekMeeting` interface:
```typescript
export interface WeekMeeting {
  id: string;            // meeting_id
  title: string;         // derived: "{meeting_type} – {organizer}"
  startTime: string;     // ISO date
  endTime: string;       // ISO date
  durationMinutes: number;
  meetingType: string;
  organizer: string;
  participants: number;
  recurring: boolean;
}
```

**Component change:** Update column headers and data bindings. Add recurring badge. Add empty state.

---

### 5.6 Meeting Type Distribution (Structure — planned widget)

**Current data:** `meeting-type-distribution.json` — all-time aggregated counts by type.

**Required changes:**

1. Filter `meetings.json` to selected week.
2. Group by `meeting_type`, count each.
3. Compute `percentage = (typeCount / totalWeekMeetings) * 100`.
4. Feed into a donut/pie chart.
5. **Empty state** if no meetings in the selected week.

---

### 5.7 Recurring Ratio (Structure — planned widget)

**Current data:** `recurring-ratio.json` — all-time: `recurringCount: 72, adHocCount: 33, recurringPercentage: 68.6`.

**Required changes:**

1. Filter `meetings.json` to selected week.
2. Count where `recurring === true` and `recurring === false`.
3. Compute percentage.
4. Display as a gauge, progress bar, or two-value stat card.

---

### 5.8 Timing Analysis (Structure — planned widget)

**Current data:** `timing-analysis.json` — all-time: Morning 72, Midday 16, Afternoon 17.

**Required changes:**

1. Filter `meetings.json` to selected week.
2. Group by `time_of_day_bucket` (Morning / Midday / Afternoon).
3. Count and compute percentages.
4. Feed into a horizontal bar chart or stacked bar.

---

### 5.9 Focus Blocks Chart (Structure — planned widget)

**Current data:** `focus-blocks.json` — 9 daily entries (Feb 2–12) spanning ~2 weeks, with `blocks60min`, `blocks90min`, `blocks120min` per day.

**Required changes:**

1. Filter entries where `date` falls within `[weekStart, weekEnd]`.
2. This will yield **at most 5–7 entries** (one per day).
3. Show as a grouped/stacked bar chart with 3 series (60min, 90min, 120min blocks).
4. X-axis: day labels like `Mon`, `Tue`, etc.
5. **Empty state** if no entries match the week.

**Note:** Since the mock data currently only covers Feb 2–12, selecting weeks outside that range will yield no data. The future backend API must return this data for any requested week.

---

### 5.10 Fragmentation Scores Chart (Structure — planned widget)

**Current data:** `fragmentation-scores.json` — 19 daily entries (Jan 19 – Feb 12) spanning ~4 weeks, with `score`, `meetingsContribution`, `gapsContribution`, `fragmentationContribution`.

**Required changes:**

1. Filter entries where `date` falls within `[weekStart, weekEnd]`.
2. Show as a **stacked area or multi-line chart** with the 3 contribution series + total score.
3. X-axis: 5–7 day labels.
4. Y-axis: score (0–100).
5. **Empty state** if no data for that week.

---

### 5.11 Stat Cards (Impact Dashboard)

**Current data:** `impact-summary.json` — all-time averages with "last week" comparison:
- `avgEfficiency` / `avgEfficiencyLastWeek`
- `avgEmotionalScore` / `avgEmotionalScoreLastWeek`
- `avgEnergyAfter` / `avgEnergyAfterLastWeek`
- `percentageValuable` / `percentageValuableLastWeek`

**Required changes:**

1. Load `impact/feedback.json` (93 entries with `feedback_timestamp`).
2. Filter to selected week → **selected feedback**.
3. Filter to previous week → **previous feedback**.
4. Compute for each set:

| Card | Formula |
|---|---|
| Avg Efficiency | `mean(perceived_efficiency)` |
| Avg Emotional Score | Map `"motivated"→+1, "neutral"→0, "stressed"→-1`, then `mean()` |
| Avg Energy After | `mean(energy_after_meeting)` |
| % Valuable | `(count where perceived_value===true / total) * 100` |

5. Change %: compare selected week value vs previous week value.

---

### 5.12 Impact by Type (Impact — planned widget)

**Current data:** `impact-by-type.json` — all-time averages per meeting type (avgEfficiency, avgEmotional, avgEnergy, avgDisruption).

**Required changes:**

1. Filter `feedback.json` to selected week.
2. Group by `meeting_type`.
3. Compute averages for each metric within each type.
4. Feed into a grouped bar chart or radar chart.
5. **Empty state** if no feedback for that week.

---

### 5.13 Impact by Time of Day (Impact — planned widget)

**Current data:** `impact-by-time.json` — all-time averages by Morning/Midday/Afternoon.

**Required changes:**

1. Filter `feedback.json` to selected week.
2. Group by `time_of_day_bucket`.
3. Compute averages for `avgEfficiency`, `avgEmotional`, `avgDisruption`.
4. Feed into chart.

---

### 5.14 Efficiency Distribution (Impact — planned widget)

**Current data:** `efficiency-distribution.json` — histogram of scale 1–5 with counts.

**Required changes:**

1. Filter `feedback.json` to selected week.
2. Count `perceived_efficiency` values grouped by scale (1, 2, 3, 4, 5).
3. Compute percentages.
4. Feed into bar/histogram chart.

---

### 5.15 Sentiment Distribution (Impact — planned widget)

**Current data:** `sentiment-distribution.json` — stressed/neutral/motivated counts.

**Required changes:**

1. Filter `feedback.json` to selected week.
2. Count `emotional_impact` values by category.
3. Compute percentages.
4. Feed into donut/pie chart.

---

### 5.16 Qualitative Themes (Impact — planned widget)

**Current data:** `qualitative-themes.json` — theme labels with frequency counts.

**Required changes:**

This is the most complex widget because the current mock data has pre-extracted themes that are **not linked to individual feedback entries**.

**Two options:**

**Option A (Recommended for now):** Add a `themes` array to each entry in `feedback.json`:
```json
{
  "meeting_id": "m-005",
  "free_text_comment": "Unplanned meeting disrupted my focus completely",
  "themes": ["Disrupted focus/flow", "Could have been async"],
  ...
}
```
Then filter feedback to the selected week, flatten all `themes` arrays, and count frequencies.

**Option B (Future — with backend NLP):** The backend extracts themes at feedback submission time and stores them. The API returns theme frequencies for the requested date range.

**For the mock-data phase, use Option A** — extend each feedback entry with a `themes` field and recompute on the client.

---

### 5.17 Focus Disruption Chart (Impact — planned widget)

**Current data:** `focus-disruption.json` — 19 daily entries (Jan 19 – Feb 12) with `avgDisruption` per day.

**Required changes:**

1. Filter entries where `date` falls within `[weekStart, weekEnd]`.
2. Show as a line chart with 5–7 data points.
3. X-axis: day labels. Y-axis: disruption score.
4. **Empty state** if no data for that week.

---

## 6. Service Layer Changes

### 6.1 Current Service: `DashboardService`

Currently fetches 4 static JSON files with no parameters. This service will be **split** into two focused services and the old one will be deprecated.

### 6.2 New: `StructureDashboardService`

**File:** `frontend/src/app/features/dashboard/services/structure-dashboard.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class StructureDashboardService {
  
  // Loads raw meetings, focus-blocks, fragmentation once and caches.
  // All public methods accept (weekStart, weekEnd) and filter client-side.

  getStructureSummary(weekStart: Date, weekEnd: Date): Observable<StructureSummary>
  getMeetingsByDay(weekStart: Date, weekEnd: Date): Observable<DayData[]>
  getDailyOverview(weekStart: Date, weekEnd: Date): Observable<DailyOverviewData[]>
  getDurationBreakdown(weekStart: Date, weekEnd: Date): Observable<DurationData[]>
  getWeekMeetings(weekStart: Date, weekEnd: Date): Observable<WeekMeeting[]>
  getMeetingTypeDistribution(weekStart: Date, weekEnd: Date): Observable<TypeDistribution[]>
  getRecurringRatio(weekStart: Date, weekEnd: Date): Observable<RecurringRatio>
  getTimingAnalysis(weekStart: Date, weekEnd: Date): Observable<TimingBucket[]>
  getFocusBlocks(weekStart: Date, weekEnd: Date): Observable<FocusBlockDay[]>
  getFragmentationScores(weekStart: Date, weekEnd: Date): Observable<FragmentationDay[]>
}
```

**Implementation strategy (mock-data phase):**
1. Load `structure/meetings.json` once (cache with `shareReplay(1)`).
2. Each method filters the cached array by date and computes the required aggregation.
3. Focus-blocks and fragmentation-scores similarly loaded + filtered.

**Future backend phase:**
- Each method calls `GET /api/dashboard/structure/{endpoint}?from=YYYY-MM-DD&to=YYYY-MM-DD`.
- The backend computes everything server-side.

### 6.3 New: `ImpactDashboardService`

**File:** `frontend/src/app/features/dashboard/services/impact-dashboard.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class ImpactDashboardService {

  getImpactSummary(weekStart: Date, weekEnd: Date): Observable<ImpactSummary>
  getImpactByType(weekStart: Date, weekEnd: Date): Observable<ImpactByType[]>
  getImpactByTime(weekStart: Date, weekEnd: Date): Observable<ImpactByTime[]>
  getEfficiencyDistribution(weekStart: Date, weekEnd: Date): Observable<EfficiencyBucket[]>
  getSentimentDistribution(weekStart: Date, weekEnd: Date): Observable<SentimentBucket[]>
  getQualitativeThemes(weekStart: Date, weekEnd: Date): Observable<ThemeFrequency[]>
  getFocusDisruption(weekStart: Date, weekEnd: Date): Observable<DisruptionDay[]>
}
```

**Implementation:** Same pattern — load `impact/feedback.json` once, filter + aggregate per method.

### 6.4 Deprecation of `DashboardService`

The existing `DashboardService` can be removed once `StructureDashboardService` and `ImpactDashboardService` are in place. Its four methods (`getWeeklyMeetings`, `getMeetingsByDay`, `getMeetingsDuration`, `getUpcomingMeetings`) are all replaced by the new services.

---

## 7. Model Changes

### 7.1 New/Modified Interfaces

**File:** `frontend/src/app/features/dashboard/models/dashboard.model.ts`

Add or modify the following:

```typescript
/** Week selector state */
export interface WeekRange {
  start: Date;  // Monday 00:00
  end: Date;    // Sunday 23:59:59
}

/** Replaces WeekData for the daily overview chart */
export interface DailyOverviewData {
  day: string;       // "Mon", "Tue", etc. or "Mon 2/2"
  meetings: number;
  hours: number;
}

/** For the "Meetings This Week" table */
export interface WeekMeeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  meetingType: string;
  organizer: string;
  participants: number;
  recurring: boolean;
  dayOfWeek: string;
  timeOfDayBucket: string;
}

/** Raw meeting from meetings.json (for client-side filtering) */
export interface RawMeeting {
  meeting_id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  recurring: boolean;
  meeting_type: string;
  organizer: string;
  number_of_participants: number;
  day_of_week: string;
  time_of_day_bucket: string;
}

/** Raw feedback from feedback.json */
export interface RawFeedback {
  meeting_id: string;
  perceived_efficiency: number;
  emotional_impact: string;      // "motivated" | "neutral" | "stressed"
  energy_after_meeting: number;
  perceived_value: boolean;
  perceived_focus_disruption: number;
  free_text_comment: string;
  time_of_day_bucket: string;
  meeting_type: string;
  feedback_timestamp: string;
  themes?: string[];             // NEW — for qualitative themes extraction
}

/** Structure summary computed for a week */
export interface StructureSummary {
  totalMeetings: number;
  totalHours: number;
  avgDuration: number;
  avgMeetingsPerDay: number;
  // Previous week values for comparison
  prevTotalMeetings: number;
  prevTotalHours: number;
  prevAvgDuration: number;
  prevAvgMeetingsPerDay: number;
}

/** Impact summary computed for a week */
export interface ImpactSummary {
  avgEfficiency: number;
  avgEmotionalScore: number;
  avgEnergyAfter: number;
  percentageValuable: number;
  // Previous week values for comparison
  prevAvgEfficiency: number;
  prevAvgEmotionalScore: number;
  prevAvgEnergyAfter: number;
  prevPercentageValuable: number;
}

export interface TypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface RecurringRatio {
  recurringCount: number;
  adHocCount: number;
  recurringPercentage: number;
}

export interface TimingBucket {
  timeOfDay: string;   // "Morning" | "Midday" | "Afternoon"
  count: number;
  percentage: number;
}

export interface FocusBlockDay {
  date: string;
  blocks60min: number;
  blocks90min: number;
  blocks120min: number;
}

export interface FragmentationDay {
  date: string;
  score: number;
  meetingsContribution: number;
  gapsContribution: number;
  fragmentationContribution: number;
}

export interface ImpactByType {
  type: string;
  avgEfficiency: number;
  avgEmotional: number;
  avgEnergy: number;
  avgDisruption: number;
}

export interface ImpactByTime {
  timeOfDay: string;
  avgEfficiency: number;
  avgEmotional: number;
  avgDisruption: number;
}

export interface EfficiencyBucket {
  scale: number;
  count: number;
  percentage: number;
}

export interface SentimentBucket {
  sentiment: string;
  count: number;
  percentage: number;
}

export interface ThemeFrequency {
  theme: string;
  frequency: number;
}

export interface DisruptionDay {
  date: string;
  avgDisruption: number;
}
```

### 7.2 Interfaces to Remove

- `WeeklyMeetings` — replaced by `DailyOverviewData[]` + `StructureSummary`
- `WeekData` — replaced by `DailyOverviewData`
- `MeetingSummary` — replaced by `StructureSummary`
- `MeetingsByDay` — wrapper no longer needed; use `DayData[]` directly
- `MeetingsDuration` — wrapper no longer needed; use `DurationData[]` directly
- `UpcomingMeetingsResponse` — replaced by `WeekMeeting[]`
- `UpcomingMeeting` — replaced by `WeekMeeting`

---

## 8. Mock Data Changes

### 8.1 Files to Keep (Used as Raw Data Sources)

| File | Usage |
|---|---|
| `structure/meetings.json` | Primary raw data source for all structure widgets |
| `structure/focus-blocks.json` | Filtered by date for focus blocks chart |
| `structure/fragmentation-scores.json` | Filtered by date for fragmentation chart |
| `impact/feedback.json` | Primary raw data source for all impact widgets; **extend with `themes` field** |
| `impact/focus-disruption.json` | Filtered by date for disruption chart |

### 8.2 Files to Remove (Pre-Aggregated, No Longer Needed)

| File | Replaced By |
|---|---|
| `meetings-weekly.json` | Computed from `meetings.json` |
| `meetings-by-day.json` | Computed from `meetings.json` |
| `meetings-duration.json` | Computed from `meetings.json` |
| `upcoming-meetings.json` | Computed from `meetings.json` |
| `structure/structure-summary.json` | Computed from `meetings.json` |
| `structure/meeting-type-distribution.json` | Computed from `meetings.json` |
| `structure/recurring-ratio.json` | Computed from `meetings.json` |
| `structure/timing-analysis.json` | Computed from `meetings.json` |
| `impact/impact-summary.json` | Computed from `feedback.json` |
| `impact/impact-by-type.json` | Computed from `feedback.json` |
| `impact/impact-by-time.json` | Computed from `feedback.json` |
| `impact/efficiency-distribution.json` | Computed from `feedback.json` |
| `impact/sentiment-distribution.json` | Computed from `feedback.json` |
| `impact/qualitative-themes.json` | Computed from `feedback.json` (with `themes` field) |

### 8.3 Extend `feedback.json`

Add a `themes` array to each entry based on `free_text_comment` content. Example:

```json
{
  "meeting_id": "m-005",
  "free_text_comment": "Unplanned meeting disrupted my focus completely",
  "themes": ["Disrupted focus/flow", "Could have been async"],
  ...
}
```

---

## 9. File Creation / Modification Checklist

### New Files

| # | File Path | Description |
|---|---|---|
| 1 | `components/shared/week-selector.component.ts` | Week navigation arrows + date label |
| 2 | `utils/week.utils.ts` | `getMonday()`, `getSunday()`, `isDateInWeek()`, etc. |
| 3 | `services/structure-dashboard.service.ts` | Loads raw meetings, filters + aggregates per week |
| 4 | `services/impact-dashboard.service.ts` | Loads raw feedback, filters + aggregates per week |

All paths relative to `frontend/src/app/features/dashboard/`.

### Modified Files

| # | File Path | Change Summary |
|---|---|---|
| 5 | `dashboard.component.ts` | Add `selectedWeekStart`/`selectedWeekEnd` signals; add `onWeekChange` handler; pass week range to sub-dashboards |
| 6 | `dashboard.component.html` | Add `<app-week-selector>` above tabs; pass `[weekStart]`/`[weekEnd]` to dashboard content |
| 7 | `models/dashboard.model.ts` | Add new interfaces; remove deprecated ones |
| 8 | `components/meetings-trend-chart.component.ts` | Change input from `WeekData[]` to `DailyOverviewData[]`; update title to "Daily Overview"; x-axis to day labels |
| 9 | `components/meetings-by-day-chart.component.ts` | Update to accept date-labeled `DayData[]` |
| 10 | `components/duration-breakdown-chart.component.ts` | Add empty state |
| 11 | `components/upcoming-meetings.component.ts` | Rename to `WeekMeetingsComponent`; change heading; update model to `WeekMeeting[]`; add empty state |
| 12 | `components/stat-card.component.ts` | No changes needed (already generic) |
| 13 | `services/dashboard.service.ts` | Deprecate / remove |

### Files Referenced but Not Yet Created (unchanged by this plan)

These components are part of the planned Structure/Impact sub-dashboards and will be created as part of normal development. They should be built with week-range inputs from the start:

- `components/shared/dashboard-tabs.component.ts`
- `structure-dashboard.component.ts`
- `impact-dashboard.component.ts`
- All planned chart components (type distribution, recurring ratio, timing analysis, etc.)

---

## 10. Implementation Order

### Phase 1: Foundation (no visible change yet)

1. **Create `utils/week.utils.ts`** — pure utility functions, unit-testable.
2. **Create new model interfaces** in `dashboard.model.ts` — add new types, keep old ones for now.
3. **Create `StructureDashboardService`** — load `meetings.json`, implement `getStructureSummary()` + `getMeetingsByDay()` + `getDailyOverview()` + `getDurationBreakdown()` + `getWeekMeetings()`.
4. **Create `ImpactDashboardService`** — load `feedback.json`, implement `getImpactSummary()`.
5. **Unit test** both services with known date ranges against mock data.

### Phase 2: Week Selector Component

6. **Create `WeekSelectorComponent`** with arrows + label + Today button.
7. **Update `DashboardComponent`** to hold `selectedWeekStart` signal and render `<app-week-selector>`.
8. Visually verify the week selector renders and navigates correctly.

### Phase 3: Migrate Existing Widgets

9. **Update `MeetingsTrendChartComponent`** → `DailyOverviewChartComponent` (daily granularity).
10. **Update `MeetingsByDayChartComponent`** to use date-labeled data.
11. **Update `DurationBreakdownChartComponent`** to add empty state.
12. **Rename `UpcomingMeetingsComponent` → `WeekMeetingsComponent`**; update model + heading.
13. **Wire stat cards** in `StructureDashboardComponent` to use `StructureSummary` from the new service.

### Phase 4: Build Remaining Planned Widgets

14. Build the remaining structure widgets (type distribution, recurring ratio, timing, focus blocks, fragmentation).
15. Build the remaining impact widgets (by type, by time, efficiency, sentiment, themes, disruption).
16. Each widget receives filtered data from its parent dashboard component.

### Phase 5: Cleanup

17. Remove deprecated `DashboardService`.
18. Remove old model interfaces (`WeeklyMeetings`, `MeetingSummary`, etc.).
19. Remove pre-aggregated mock JSON files listed in §8.2.
20. **Extend `feedback.json`** with `themes` arrays (§8.3).

### Phase 6: Future Backend Integration

21. Add backend API endpoints: `GET /api/dashboard/structure/summary?from=&to=`, etc.
22. Swap service implementations from client-side filtering to HTTP calls.
23. Keep the same interfaces — only the service internals change.

---

## 11. Edge Cases & UX Considerations

| Scenario | Behavior |
|---|---|
| Selected week has 0 meetings | All widgets show an empty state: "No meetings this week" or "No data available" |
| Selected week has 0 feedback | Impact widgets show empty state; structure widgets may still have data |
| Weekend meetings | Include Sat/Sun in charts if meetings exist on those days |
| User navigates to far-past week | Data may be missing from mock files; show empty state gracefully |
| Right arrow at current week | Disabled (cannot navigate into the future) |
| Page load / refresh | Default to the current week (week containing today) |
| Rapid clicking arrows | Debounce or use signal-based reactivity so only the latest week triggers data loading |
| Loading state | Show skeleton/spinner while service computes/fetches data for the new week |

---

## 12. Backend API Design (Future Reference)

When transitioning from mock data to a real backend, the following API shape is recommended:

```
GET /api/dashboard/structure/summary?from=2026-02-02&to=2026-02-08
GET /api/dashboard/structure/meetings?from=2026-02-02&to=2026-02-08
GET /api/dashboard/structure/daily-overview?from=2026-02-02&to=2026-02-08
GET /api/dashboard/structure/duration-breakdown?from=2026-02-02&to=2026-02-08
GET /api/dashboard/structure/type-distribution?from=2026-02-02&to=2026-02-08
GET /api/dashboard/structure/recurring-ratio?from=2026-02-02&to=2026-02-08
GET /api/dashboard/structure/timing-analysis?from=2026-02-02&to=2026-02-08
GET /api/dashboard/structure/focus-blocks?from=2026-02-02&to=2026-02-08
GET /api/dashboard/structure/fragmentation?from=2026-02-02&to=2026-02-08

GET /api/dashboard/impact/summary?from=2026-02-02&to=2026-02-08
GET /api/dashboard/impact/by-type?from=2026-02-02&to=2026-02-08
GET /api/dashboard/impact/by-time?from=2026-02-02&to=2026-02-08
GET /api/dashboard/impact/efficiency?from=2026-02-02&to=2026-02-08
GET /api/dashboard/impact/sentiment?from=2026-02-02&to=2026-02-08
GET /api/dashboard/impact/themes?from=2026-02-02&to=2026-02-08
GET /api/dashboard/impact/disruption?from=2026-02-02&to=2026-02-08
```

All endpoints accept `from` (Monday) and `to` (Sunday) as `YYYY-MM-DD` query parameters. The backend computes all aggregations server-side and returns the same interface shapes defined in §7.1.