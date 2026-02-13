# Meeting Analytics System – Angular Frontend Implementation Plan

This document outlines the detailed frontend implementation plan for the two dashboards using the existing Angular application structure with signals, services returning mock data, Tailwind CSS, and Preline UI components.

---

## Project Overview

We are building two complementary dashboards that **replace** the current dashboard:

1. **Meeting Structure Dashboard** - Analyzes objective meeting metadata (calendar-based data)
2. **Meeting Impact Dashboard** - Analyzes subjective post-meeting feedback

Both dashboards will use the existing Angular stack:
- **Framework**: Angular 20+ with standalone components
- **State Management**: Signals & Computed Signals
- **Styling**: Tailwind CSS + Preline UI
- **Charts**: ApexCharts via ng-apexcharts
- **Data**: Mock data served via services (HTTP GET from JSON files)

**Note**: Team view / privacy features will be implemented in a later phase. This plan covers **personal view only**.

---

## Architecture Overview

### Directory Structure

```
frontend/src/app/features/
├── dashboard/                           # Replaces current dashboard
│   ├── models/
│   │   ├── structure.model.ts           # Structure dashboard types
│   │   ├── impact.model.ts              # Impact dashboard types
│   │   └── common.model.ts              # Shared types (filters, aggregations)
│   ├── services/
│   │   ├── structure.service.ts         # Structure dashboard service
│   │   ├── impact.service.ts            # Impact dashboard service
│   │   ├── filter.service.ts            # Shared filter logic
│   │   ├── data-processor.service.ts    # Data aggregation & calculations
│   │   └── export.service.ts            # CSV/JSON export
│   ├── components/
│   │   ├── shared/                      # Shared dashboard components
│   │   │   ├── filter-panel.component.ts
│   │   │   ├── date-range-selector.component.ts
│   │   │   ├── export-button.component.ts
│   │   │   ├── dashboard-tabs.component.ts
│   │   │   └── chart-card.component.ts
│   │   ├── structure/                   # Structure dashboard widgets
│   │   │   ├── structure-kpi-summary.component.ts
│   │   │   ├── meeting-type-distribution.component.ts
│   │   │   ├── meeting-timing-analysis.component.ts
│   │   │   ├── focus-time-analysis.component.ts
│   │   │   ├── fragmentation-score.component.ts
│   │   │   └── recurring-adhoc-ratio.component.ts
│   │   └── impact/                      # Impact dashboard widgets
│   │       ├── impact-kpi-summary.component.ts
│   │       ├── sentiment-distribution.component.ts
│   │       ├── efficiency-distribution.component.ts
│   │       ├── impact-by-meeting-type.component.ts
│   │       ├── impact-by-time-of-day.component.ts
│   │       ├── focus-disruption-perception.component.ts
│   │       └── qualitative-themes.component.ts
│   ├── structure-dashboard.component.ts # Structure dashboard container
│   ├── impact-dashboard.component.ts    # Impact dashboard container
│   └── dashboard.component.ts           # Root router container
└── (other features remain unchanged)
```

### Mock Data Structure

```
frontend/public/mock-data/
├── structure/
│   ├── meetings.json                    # Raw meeting data (100+ records)
│   ├── structure-summary.json           # Pre-calculated KPIs
│   ├── meeting-type-distribution.json
│   ├── timing-analysis.json
│   ├── focus-blocks.json
│   ├── fragmentation-scores.json
│   └── recurring-ratio.json
├── impact/
│   ├── feedback.json                    # Raw feedback data
│   ├── impact-summary.json              # Pre-calculated KPIs
│   ├── sentiment-distribution.json
│   ├── efficiency-distribution.json
│   ├── impact-by-type.json
│   ├── impact-by-time.json
│   ├── focus-disruption.json
│   └── qualitative-themes.json
└── (existing files remain)
```

---

## Phase 1: Type Definitions & Models

### 1.1 Create Common Models
- [ ] Create `common.model.ts`
  - [ ] Define `DateRange` interface (startDate, endDate)
  - [ ] Define `FilterState` interface (dateRange, meetingTypes, timeOfDay)
  - [ ] Define `TimeOfDayBucket` enum (Morning, Midday, Afternoon)
  - [ ] Define `MeetingType` enum (Stand-up, Planning, Retrospective, 1:1, Ad-hoc, Other)
  - [ ] Define `EmotionalState` enum (Stressed, Neutral, Motivated)
  - [ ] Define `ExportFormat` enum (CSV, JSON)

### 1.2 Create Structure Dashboard Models
- [ ] Create `structure.model.ts`
  - [ ] Define `Meeting` interface (meeting_id, start_time, end_time, duration_minutes, recurring, meeting_type, organizer, number_of_participants, day_of_week, time_of_day_bucket)
  - [ ] Define `StructureSummary` interface (totalMeetings, totalHours, avgDuration, avgMeetingsPerDay)
  - [ ] Define `MeetingTypeCount` interface (type, count, percentage)
  - [ ] Define `TimingData` interface (timeOfDay, count, percentage)
  - [ ] Define `FocusBlock` interface (date, blocks60min, blocks90min, blocks120min)
  - [ ] Define `FragmentationScore` interface (date, score, metricsBreakdown)
  - [ ] Define `RecurringRatio` interface (recurringCount, adHocCount, recurringPercentage)
  - [ ] Define response wrappers for each widget

### 1.3 Create Impact Dashboard Models
- [ ] Create `impact.model.ts`
  - [ ] Define `MeetingFeedback` interface (meeting_id, perceived_efficiency, emotional_impact, energy_after_meeting, perceived_value, perceived_focus_disruption, free_text_comment, time_of_day_bucket, meeting_type)
  - [ ] Define `ImpactSummary` interface (avgEfficiency, avgEmotionalScore, avgEnergyAfter, percentageValuable)
  - [ ] Define `SentimentCount` interface (sentiment, count, percentage)
  - [ ] Define `EfficiencyDistribution` interface (scale, count, percentage)
  - [ ] Define `MeetingTypeImpact` interface (type, avgEfficiency, avgEmotional, avgEnergy, avgDisruption)
  - [ ] Define `TimeOfDayImpact` interface (timeOfDay, avgEfficiency, avgEmotional, avgDisruption)
  - [ ] Define `QualitativeTheme` interface (theme, frequency)

---

## Phase 2: Mock Data Creation

### 2.1 Mock Data Files
- [ ] Create `structure/meetings.json`
  - [ ] Generate 100+ realistic meeting records
  - [ ] Ensure realistic time distributions (peak hours 9 AM - 5 PM)
  - [ ] Include recurring meeting patterns (recurring: true/false)
  - [ ] Include diverse meeting types distribution
  - [ ] Include realistic participant counts (2-15 per meeting)
  - [ ] Span date range of 8 weeks for trending data
  
- [ ] Create `structure/structure-summary.json`
  - [ ] Total meetings count
  - [ ] Total hours aggregated
  - [ ] Average meeting duration
  - [ ] Average meetings per day
  - [ ] Current week vs last week comparisons
  
- [ ] Create `structure/meeting-type-distribution.json`
  - [ ] Count per meeting type (Stand-up, Planning, Retrospective, 1:1, Ad-hoc, Other)
  - [ ] Percentage per type
  
- [ ] Create `structure/timing-analysis.json`
  - [ ] Distribution by time bucket (Morning 8-12, Midday 12-15, Afternoon 15-18)
  - [ ] Count and percentage per bucket
  
- [ ] Create `structure/focus-blocks.json`
  - [ ] Per day: count of blocks >= 60, >= 90, >= 120 minutes
  - [ ] Date range spanning week view
  
- [ ] Create `structure/fragmentation-scores.json`
  - [ ] Daily fragmentation scores (0-100)
  - [ ] Components breakdown (meetings contribution, gaps contribution, etc.)
  - [ ] Date range for trend analysis
  
- [ ] Create `structure/recurring-ratio.json`
  - [ ] Recurring meetings count
  - [ ] Ad-hoc meetings count
  - [ ] Percentage breakdown

- [ ] Create `impact/feedback.json`
  - [ ] Generate 80+ feedback entries
  - [ ] 80%+ response rate (feedback for ~80% of meetings)
  - [ ] Match feedback to meetings by meeting_id
  - [ ] Realistic efficiency ratings (1-5 scale, normal distribution around 3.5)
  - [ ] Realistic emotional states distribution (40% motivated, 35% neutral, 25% stressed)
  - [ ] Include varied energy levels
  - [ ] Include meaningful free-text comments
  - [ ] Span same date range as meetings
  
- [ ] Create `impact/impact-summary.json`
  - [ ] Average efficiency (1-5 scale)
  - [ ] Average emotional impact (-2 to +2 or average sentiment)
  - [ ] Average energy-after (1-5 scale)
  - [ ] Percentage valuable meetings
  
- [ ] Create `impact/sentiment-distribution.json`
  - [ ] Count and percentage for Stressed, Neutral, Motivated
  
- [ ] Create `impact/efficiency-distribution.json`
  - [ ] Distribution across 1-5 scale
  - [ ] Count per score
  - [ ] Percentage in ranges: Low (1-2), Medium (3), High (4-5)
  
- [ ] Create `impact/impact-by-type.json`
  - [ ] Per meeting type: avg efficiency, avg emotion, avg energy, avg disruption
  
- [ ] Create `impact/impact-by-time.json`
  - [ ] Per time bucket (Morning, Midday, Afternoon): avg efficiency, avg emotion, avg disruption
  
- [ ] Create `impact/focus-disruption.json`
  - [ ] Daily average focus disruption scores (1-5)
  - [ ] Distribution of scores
  - [ ] Optional: correlation with duration
  
- [ ] Create `impact/qualitative-themes.json`
  - [ ] Top 5-10 recurring themes
  - [ ] Frequency count per theme
  - [ ] Example: "Too long", "No clear agenda", "Too many participants", "Could have been async"

---

## Phase 3: Services Setup

### 3.1 Create Filter Service
- [ ] Create `filter.service.ts`
  - [ ] Inject HttpClient for mock data loading
  - [ ] Create `filterState` signal initialized with default filters
  - [ ] Create computed signals:
    - [ ] `activeFilters()` - current filter state
    - [ ] `dateRange()` - current date range
    - [ ] `meetingTypeFilters()` - selected meeting types
    - [ ] `timeOfDayFilters()` - selected time buckets
  - [ ] Implement methods:
    - [ ] `setDateRange(startDate, endDate)` - updates date range signal
    - [ ] `setMeetingTypeFilter(types: MeetingType[])` - updates meeting type filter
    - [ ] `setTimeOfDayFilter(buckets: TimeOfDayBucket[])` - updates time of day filter
    - [ ] `resetFilters()` - resets to default state
  - [ ] Persist filter state to localStorage
  - [ ] Emit filter changes via signal (components subscribe via signals)

### 3.2 Create Data Processor Service
- [ ] Create `data-processor.service.ts`
  - [ ] Implement aggregation functions:
    - [ ] `aggregateByMeetingType(meetings)` - count per type with percentages
    - [ ] `aggregateByTimeOfDay(meetings)` - count per bucket with percentages
    - [ ] `aggregateByDay(meetings)` - meetings per day
    - [ ] `aggregateByDateRange(data, dateRange)` - filter data by date
  - [ ] Implement calculation functions:
    - [ ] `calculateFragmentationScore(meetings)` - formula: (meetings_per_day * 0.4) + (short_gaps_count * 0.4) + (fragmentation_percentage * 0.2), result 0-100
    - [ ] `calculateFocusBlocks(meetings)` - find uninterrupted blocks between meetings >= 60/90/120 minutes
    - [ ] `calculateRecurringRatio(meetings)` - percentage of recurring vs ad-hoc
    - [ ] `calculatePercentages(data)` - convert counts to percentages
    - [ ] `calculateAverages(data)` - calculate mean values
    - [ ] `calculateDistributions(data)` - create distribution histograms
  - [ ] Implement formatting functions for charts (convert data to chart-ready format)

### 3.3 Create Export Service
- [ ] Create `export.service.ts`
  - [ ] Implement `exportToCSV(data, filename)` method
    - [ ] Convert object array to CSV format
    - [ ] Handle headers and data rows
    - [ ] Trigger browser download
  - [ ] Implement `exportToJSON(data, filename)` method
    - [ ] Stringify data with formatting
    - [ ] Include metadata (export date, filters applied)
    - [ ] Trigger browser download
  - [ ] Handle special characters and escaping

### 3.4 Create Structure Dashboard Service
- [ ] Create `structure.service.ts`
  - [ ] Inject HttpClient, FilterService, DataProcessorService
  - [ ] Create signal for raw meetings data
  - [ ] Create computed signals:
    - [ ] `filteredMeetings()` - applies filter service filters to raw meetings
    - [ ] `summary()` - StructureSummary computed from filtered meetings
    - [ ] `meetingTypeDistribution()` - MeetingTypeCount[] computed
    - [ ] `timingAnalysis()` - TimingData[] computed
    - [ ] `focusBlocks()` - FocusBlock[] computed
    - [ ] `fragmentation()` - FragmentationScore[] computed
    - [ ] `recurringRatio()` - RecurringRatio computed
  - [ ] Implement observable methods (load mock data):
    - [ ] `getSummary()` → Observable<StructureSummary>
    - [ ] `getMeetingTypeDistribution()` → Observable<MeetingTypeCount[]>
    - [ ] `getTimingAnalysis()` → Observable<TimingData[]>
    - [ ] `getFocusBlocks()` → Observable<FocusBlock[]>
    - [ ] `getFragmentationScores()` → Observable<FragmentationScore[]>
    - [ ] `getRecurringRatio()` → Observable<RecurringRatio>
  - [ ] Load from `mock-data/structure/*.json` files
  - [ ] Apply DataProcessor functions to format response data

### 3.5 Create Impact Dashboard Service
- [ ] Create `impact.service.ts`
  - [ ] Inject HttpClient, FilterService, DataProcessorService
  - [ ] Create signal for raw feedback data
  - [ ] Create computed signals:
    - [ ] `filteredFeedback()` - applies filter service filters to raw feedback
    - [ ] `summary()` - ImpactSummary computed
    - [ ] `sentimentDistribution()` - SentimentCount[] computed
    - [ ] `efficiencyDistribution()` - EfficiencyDistribution[] computed
    - [ ] `impactByType()` - MeetingTypeImpact[] computed
    - [ ] `impactByTime()` - TimeOfDayImpact[] computed
    - [ ] `focusDisruption()` - DisruptionData[] computed
    - [ ] `qualitativeThemes()` - QualitativeTheme[] computed
  - [ ] Implement observable methods (load mock data):
    - [ ] `getSummary()` → Observable<ImpactSummary>
    - [ ] `getSentimentDistribution()` → Observable<SentimentCount[]>
    - [ ] `getEfficiencyDistribution()` → Observable<EfficiencyDistribution[]>
    - [ ] `getImpactByMeetingType()` → Observable<MeetingTypeImpact[]>
    - [ ] `getImpactByTimeOfDay()` → Observable<TimeOfDayImpact[]>
    - [ ] `getFocusDisruption()` → Observable<DisruptionData[]>
    - [ ] `getQualitativeThemes()` → Observable<QualitativeTheme[]>
  - [ ] Load from `mock-data/impact/*.json` files
  - [ ] Apply DataProcessor functions to format response data

---

## Phase 4: Shared Components

### 4.1 Create Filter Components
- [ ] Create `filter-panel.component.ts`
  - [ ] Inject FilterService
  - [ ] Display all filter controls below
  - [ ] Add "Apply Filters" button
  - [ ] Add "Reset Filters" button
  - [ ] Responsive layout (stack on mobile)
  - [ ] Use Preline UI button styles
  - [ ] Display active filter count badge
  - [ ] Emit filter state changes to FilterService

- [ ] Create `date-range-selector.component.ts`
  - [ ] Input: currentDateRange signal
  - [ ] Output: dateRange changes to FilterService
  - [ ] Implement preset buttons:
    - [ ] Last 7 days
    - [ ] Last 30 days
    - [ ] Last 90 days
    - [ ] Custom range
  - [ ] Use HTML date input fields for custom range
  - [ ] Validate date range (start <= end)
  - [ ] Use Tailwind form styling

### 4.2 Create Dashboard Layout Components
- [ ] Create `chart-card.component.ts`
  - [ ] Reusable wrapper for chart widgets
  - [ ] Inputs: title, subtitle, data state, loading state
  - [ ] Display card with border and shadow
  - [ ] Show loading skeleton while data loads
  - [ ] Show empty state if no data
  - [ ] Consistent Preline card styling
  - [ ] Optional refresh button

- [ ] Create `dashboard-tabs.component.ts`
  - [ ] Input: activeTab signal ("structure" | "impact")
  - [ ] Output: tab selection change
  - [ ] Render as button tabs (not browser tabs)
  - [ ] Highlight active tab
  - [ ] Style using Preline UI tab patterns
  - [ ] Smooth transition between tabs
  - [ ] Optional: badge showing widget count per tab

- [ ] Create `export-button.component.ts`
  - [ ] Input: data to export
  - [ ] Implement dropdown menu:
    - [ ] Export as CSV
    - [ ] Export as JSON
  - [ ] Use Preline UI dropdown styling
  - [ ] Inject ExportService
  - [ ] Show loading state during export
  - [ ] Show success notification after export

---

## Phase 5: Structure Dashboard Widgets

### 5.1 Widget 1 – KPI Summary Row
- [ ] Create `structure-kpi-summary.component.ts`
  - [ ] Inject StructureService
  - [ ] Input: summary signal from service
  - [ ] Display 4 KPI cards (reuse stat-card component):
    - [ ] Total meetings (count)
    - [ ] Total meeting time (hours)
    - [ ] Average meeting duration (minutes)
    - [ ] Average meetings per day (decimal)
  - [ ] Show percentage change from last week
  - [ ] Grid layout: 1 col mobile, 2 cols tablet, 4 cols desktop
  - [ ] Color code indicators (green up, red down)

### 5.2 Widget 2 – Meeting Type Distribution
- [ ] Create `meeting-type-distribution.component.ts`
  - [ ] Inject StructureService
  - [ ] Input: meetingTypeDistribution signal
  - [ ] Create toggle: Bar chart / Donut chart
  - [ ] Implement bar chart using ApexCharts:
    - [ ] X-axis: Meeting types (Stand-up, Planning, Retrospective, 1:1, Ad-hoc, Other)
    - [ ] Y-axis: Count
    - [ ] Color: Use CHART_COLORS palette
    - [ ] Show count labels on bars
    - [ ] Show percentage in tooltip
  - [ ] Implement donut chart alternative:
    - [ ] Each segment = meeting type
    - [ ] Show count + percentage in legend
    - [ ] Colors match bar chart
  - [ ] Use chart-card wrapper component
  - [ ] Title: "Meeting Type Distribution"

### 5.3 Widget 3 – Meeting Timing Analysis
- [ ] Create `meeting-timing-analysis.component.ts`
  - [ ] Inject StructureService
  - [ ] Input: timingAnalysis signal
  - [ ] Create toggle: Bar chart / Heatmap view
  - [ ] Implement bar chart:
    - [ ] X-axis: Time buckets (Morning 8-12, Midday 12-15, Afternoon 15-18)
    - [ ] Y-axis: Count
    - [ ] Show percentage labels
    - [ ] Color gradient: blue → yellow → orange (by intensity)
  - [ ] Implement optional heatmap:
    - [ ] Rows: Days of week (Mon-Sun)
    - [ ] Columns: Time buckets
    - [ ] Cell values: meeting count
    - [ ] Heat color gradient (cool to hot)
  - [ ] Hover tooltips with exact values
  - [ ] Title: "When Do Meetings Occur?"

### 5.4 Widget 4 – Focus Time Analysis
- [ ] Create `focus-time-analysis.component.ts`
  - [ ] Inject StructureService
  - [ ] Input: focusBlocks signal
  - [ ] Create selector for block size:
    - [ ] Toggle: >= 60 min, >= 90 min, >= 120 min
  - [ ] Implement bar chart:
    - [ ] X-axis: Days of week
    - [ ] Y-axis: Number of focus blocks
    - [ ] Show multiple series for each day (if multi-day data)
    - [ ] Color: Blue (primary)
  - [ ] Include summary metric:
    - [ ] "X blocks of Y+ minutes available this week"
    - [ ] Green highlight if > 10 blocks
  - [ ] Title: "Uninterrupted Focus Time Blocks"

### 5.5 Widget 5 – Fragmentation Score
- [ ] Create `fragmentation-score.component.ts`
  - [ ] Inject StructureService
  - [ ] Input: fragmentation signal (array of daily scores)
  - [ ] Create gauge/radial chart for current score:
    - [ ] Center value: current fragmentation score (0-100)
    - [ ] Color zones: Green (0-40), Yellow (40-70), Red (70-100)
    - [ ] Display interpretation: "Good" / "Fair" / "Poor"
  - [ ] Include trend line chart below gauge:
    - [ ] X-axis: Dates
    - [ ] Y-axis: Fragmentation score (0-100)
    - [ ] Show moving average line
  - [ ] Optional metric breakdown section:
    - [ ] Show how score is calculated (40% + 40% + 20%)
  - [ ] Title: "Calendar Fragmentation Score"

### 5.6 Widget 6 – Recurring vs Ad-hoc Ratio
- [ ] Create `recurring-adhoc-ratio.component.ts`
  - [ ] Inject StructureService
  - [ ] Input: recurringRatio signal
  - [ ] Implement donut/pie chart:
    - [ ] Segment 1: Recurring (blue)
    - [ ] Segment 2: Ad-hoc (orange)
  - [ ] Display in legend:
    - [ ] Count + percentage for each
  - [ ] Add summary text below: "X% of meetings are recurring"
  - [ ] Title: "Meeting Predictability"

---

## Phase 6: Impact Dashboard Widgets

### 6.1 Widget 1 – KPI Summary Row
- [ ] Create `impact-kpi-summary.component.ts`
  - [ ] Inject ImpactService
  - [ ] Input: summary signal from service
  - [ ] Display 4 KPI cards:
    - [ ] Average efficiency score (1-5 scale, center ~3.5)
    - [ ] Average emotional impact (sentiment-based average or sentiment score)
    - [ ] Average energy-after score (1-5 scale)
    - [ ] % meetings rated valuable (percentage 0-100)
  - [ ] Use stat-card component
  - [ ] Grid layout: 1 col mobile, 2 cols tablet, 4 cols desktop
  - [ ] Color code by satisfaction level (red/orange/green)

### 6.2 Widget 2 – Sentiment Distribution
- [ ] Create `sentiment-distribution.component.ts`
  - [ ] Inject ImpactService
  - [ ] Input: sentimentDistribution signal
  - [ ] Create toggle: Bar chart / Horizontal stacked bar
  - [ ] Implement bar chart:
    - [ ] X-axis: Sentiment (Stressed, Neutral, Motivated)
    - [ ] Y-axis: Count
    - [ ] Color code: Red (Stressed), Gray (Neutral), Green (Motivated)
    - [ ] Show percentage labels
    - [ ] Show count in tooltip
  - [ ] Implement stacked bar alternative:
    - [ ] Show proportions across sentiments
    - [ ] Same color scheme
  - [ ] Add interpretation text: "X% reported motivated feeling"
  - [ ] Title: "Emotional Impact of Meetings"

### 6.3 Widget 3 – Efficiency Distribution
- [ ] Create `efficiency-distribution.component.ts`
  - [ ] Inject ImpactService
  - [ ] Input: efficiencyDistribution signal
  - [ ] Implement histogram/bar chart:
    - [ ] X-axis: Efficiency score (1, 2, 3, 4, 5)
    - [ ] Y-axis: Count/frequency
    - [ ] Color gradient: Red (1) → Orange (2-3) → Green (4-5)
    - [ ] Show frequency labels on bars
  - [ ] Add percentage breakdown as badges:
    - [ ] Low (1-2): X%
    - [ ] Medium (3): X%
    - [ ] High (4-5): X%
  - [ ] Show average efficiency as vertical line on chart
  - [ ] Title: "Perceived Meeting Efficiency"

### 6.4 Widget 4 – Impact by Meeting Type
- [ ] Create `impact-by-meeting-type.component.ts`
  - [ ] Inject ImpactService
  - [ ] Input: impactByType signal
  - [ ] Create toggle: Table / Grouped bar chart
  - [ ] Implement table:
    - [ ] Columns: Meeting Type, Avg Efficiency, Avg Emotion, Avg Energy, Avg Disruption
    - [ ] Make columns sortable (click header)
    - [ ] Color-code values: Red (bad) → Yellow (medium) → Green (good)
    - [ ] Hover row for emphasis
  - [ ] Implement grouped bar chart alternative:
    - [ ] Groups: Meeting types (X-axis)
    - [ ] Series: Efficiency, Emotion, Energy, Disruption (scaled 0-5)
    - [ ] Side-by-side bars per type
    - [ ] Different colors per metric
  - [ ] Highlight best and worst performing type
  - [ ] Title: "Impact by Meeting Type"

### 6.5 Widget 5 – Impact by Time of Day
- [ ] Create `impact-by-time-of-day.component.ts`
  - [ ] Inject ImpactService
  - [ ] Input: impactByTime signal
  - [ ] Create toggle: Grouped bar / Heatmap
  - [ ] Implement grouped bar chart:
    - [ ] X-axis: Time buckets (Morning, Midday, Afternoon)
    - [ ] Multiple bars per bucket: Efficiency, Emotion, Disruption (scaled 0-5)
    - [ ] Different colors per metric
    - [ ] Show value labels
  - [ ] Implement heatmap alternative:
    - [ ] Rows: Metrics (Efficiency, Emotion, Disruption)
    - [ ] Columns: Time buckets
    - [ ] Cell color intensity: metric value
    - [ ] Show values in cells
  - [ ] Highlight best/worst time period
  - [ ] Add interpretation: e.g., "Afternoon meetings perceived as most disruptive"
  - [ ] Title: "Impact by Time of Day"

### 6.6 Widget 6 – Focus Disruption Perception
- [ ] Create `focus-disruption-perception.component.ts`
  - [ ] Inject ImpactService
  - [ ] Input: focusDisruption signal
  - [ ] Display current average disruption score (1-5):
    - [ ] Large metric card with color (green if low, red if high)
  - [ ] Implement trend line chart:
    - [ ] X-axis: Dates
    - [ ] Y-axis: Average disruption score (1-5)
    - [ ] Show moving average trend line
    - [ ] Area fill under curve
  - [ ] Optional: Correlation scatter plot
    - [ ] X-axis: Meeting duration (minutes)
    - [ ] Y-axis: Perceived disruption (1-5)
    - [ ] Plot data points
    - [ ] Add trend line through points
    - [ ] Show correlation coefficient
  - [ ] Distribution histogram below:
    - [ ] X-axis: Disruption score (1-5)
    - [ ] Y-axis: Frequency
    - [ ] Color gradient: Green (1-2) → Yellow (3) → Red (4-5)
  - [ ] Title: "Focus Disruption Perception"

### 6.7 Widget 7 – Top Qualitative Themes (Optional)
- [ ] Create `qualitative-themes.component.ts`
  - [ ] Inject ImpactService
  - [ ] Input: qualitativeThemes signal (array of themes with frequency)
  - [ ] Implement horizontal bar chart:
    - [ ] X-axis: Frequency count
    - [ ] Y-axis: Theme text
    - [ ] Bars colored orange (warning/attention)
    - [ ] Show count label on each bar
  - [ ] Alternative: Tag cloud view
    - [ ] Size proportional to frequency
    - [ ] Color gradient
    - [ ] Clickable tags
  - [ ] Optional: Show example quotes on hover
  - [ ] Title: "Common Feedback Themes"
  - [ ] Subtitle: "Extracted from meeting feedback comments"

---

## Phase 7: Dashboard Containers

### 7.1 Create Structure Dashboard Container
- [ ] Create `structure-dashboard.component.ts`
  - [ ] Use standalone component
  - [ ] Inject: StructureService, FilterService, AuthService
  - [ ] Create signals:
    - [ ] `currentUser` from AuthService
    - [ ] `filters` from FilterService (readonly)
    - [ ] `isLoading` signal for initial data load
  - [ ] Use toSignal to convert service observables:
    - [ ] `summary` ← StructureService.getSummary()
    - [ ] `meetingTypes` ← StructureService.getMeetingTypeDistribution()
    - [ ] `timing` ← StructureService.getTimingAnalysis()
    - [ ] `focusBlocks` ← StructureService.getFocusBlocks()
    - [ ] `fragmentation` ← StructureService.getFragmentationScores()
    - [ ] `recurring` ← StructureService.getRecurringRatio()
  - [ ] Create effects to manage loading state
  - [ ] Implement template with:
    - [ ] Header: "Meeting Structure Dashboard"
    - [ ] Breadcrumb navigation
    - [ ] FilterPanel component
    - [ ] Dashboard layout grid with 6 widgets
    - [ ] ExportButton component (exports structure data)
    - [ ] @if blocks for loading states
    - [ ] Empty state UI if no data
  - [ ] Grid layout:
    - [ ] Row 1: KPI Summary (full width)
    - [ ] Row 2: Meeting Types (50%), Timing Analysis (50%)
    - [ ] Row 3: Focus Time (33%), Fragmentation (33%), Recurring Ratio (33%)
    - [ ] Responsive: stack on mobile (1 col), 2 col on tablet, 3 col on desktop

- [ ] Create `structure-dashboard.component.html`
  - [ ] Container: max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8
  - [ ] Header section:
    - [ ] Page title
    - [ ] User greeting
    - [ ] Date range display
  - [ ] FilterPanel integrated at top
  - [ ] Responsive grid layout for widgets
  - [ ] Loading skeletons for each widget
  - [ ] ExportButton in header
  - [ ] Empty state if no data

### 7.2 Create Impact Dashboard Container
- [ ] Create `impact-dashboard.component.ts`
  - [ ] Use standalone component (similar to Structure)
  - [ ] Inject: ImpactService, FilterService, AuthService
  - [ ] Create signals (similar structure)
  - [ ] Use toSignal for all service observables:
    - [ ] `summary` ← ImpactService.getSummary()
    - [ ] `sentiment` ← ImpactService.getSentimentDistribution()
    - [ ] `efficiency` ← ImpactService.getEfficiencyDistribution()
    - [ ] `impactByType` ← ImpactService.getImpactByMeetingType()
    - [ ] `impactByTime` ← ImpactService.getImpactByTimeOfDay()
    - [ ] `focusDisruption` ← ImpactService.getFocusDisruption()
    - [ ] `themes` ← ImpactService.getQualitativeThemes()
  - [ ] Implement template
  - [ ] Grid layout:
    - [ ] Row 1: KPI Summary (full width)
    - [ ] Row 2: Sentiment (33%), Efficiency (67%)
    - [ ] Row 3: Impact by Type (full width)
    - [ ] Row 4: Impact by Time (66%), Disruption Perception (34%)
    - [ ] Row 5: Qualitative Themes (full width) [optional]
    - [ ] Responsive stacking

- [ ] Create `impact-dashboard.component.html`
  - [ ] Similar structure to structure dashboard
  - [ ] Header: "Meeting Impact Dashboard"
  - [ ] FilterPanel and widgets
  - [ ] ExportButton (exports impact data)

### 7.3 Update Root Dashboard Component
- [ ] Modify `dashboard.component.ts`
  - [ ] Create `activeTab` signal ("structure" | "impact")
  - [ ] Inject FilterService to share state between tabs
  - [ ] Use DashboardTabsComponent for tab switching
  - [ ] Route between Structure and Impact dashboards
  - [ ] Preserve filter state when switching tabs
  - [ ] Add navigation/breadcrumbs

- [ ] Modify `dashboard.component.html`
  - [ ] DashboardTabs component at top
  - [ ] Tab 1: Structure Dashboard
  - [ ] Tab 2: Impact Dashboard
  - [ ] Maintain existing layout container style

---

## Phase 8: Integration & Data Flow

### 8.1 Filter Application
- [ ] Ensure FilterService changes trigger:
  - [ ] StructureService computed signals recalculate
  - [ ] ImpactService computed signals recalculate
  - [ ] All widget components re-render with new data
- [ ] Test filter persistence across tab switches
- [ ] Verify date range filtering works correctly
- [ ] Verify meeting type filtering works correctly
- [ ] Verify time-of-day filtering works correctly

### 8.2 Data Mocking Implementation
- [ ] Verify all mock JSON files load correctly
- [ ] Ensure data shapes match type definitions
- [ ] Test with different filter combinations
- [ ] Verify no data loss in aggregation
- [ ] Check date range spanning works correctly

### 8.3 Export Functionality
- [ ] Test CSV export for both dashboards
- [ ] Test JSON export for both dashboards
- [ ] Verify file names include dashboard name
- [ ] Verify exported data includes current filters
- [ ] Test download triggering in different browsers

---

## Phase 9: Styling & Responsive Design

### 9.1 Theme Integration
- [ ] Use existing Preline UI theme (CSS variables)
- [ ] Use CHART_COLORS constants from theme.constants.ts
- [ ] Apply consistent card styling (bg-card, border-card-line)
- [ ] Use text color classes (text-foreground, text-muted-foreground-1)
- [ ] Maintain shadow and rounded corner consistency

### 9.2 Responsive Breakpoints
- [ ] Mobile (< 640px): 1-column widget layout
- [ ] Tablet (640px - 1024px): 2-column widget layout
- [ ] Desktop (> 1024px): 3-4 column widget layout
- [ ] Test on actual devices or DevTools
- [ ] Ensure charts scale appropriately

### 9.3 Dark Mode (Optional)
- [ ] Test with Preline dark mode (if enabled)
- [ ] Ensure chart colors remain visible in dark mode
- [ ] Verify text contrast in dark mode

### 9.4 Accessibility
- [ ] Semantic HTML: section, header, nav, main, article
- [ ] ARIA labels on charts and interactive elements
- [ ] Color contrast: WCAG AA minimum (4.5:1 for text)
- [ ] Keyboard navigation: Tab through filters and buttons
- [ ] Focus indicators visible on all interactive elements
- [ ] Alt text for chart exports

---

## Phase 10: Testing & Quality Assurance

### 10.1 Data Validation Tests
- [ ] KPI calculations correct (sum, average, count)
- [ ] Percentages sum to 100% or close (within rounding)
- [ ] Date range filtering excludes out-of-range data
- [ ] Meeting type filtering works for each type
- [ ] Time bucket filtering works for each bucket
- [ ] Mock data has realistic distributions

### 10.2 Component Rendering Tests
- [ ] All widgets render without errors
- [ ] Charts display correctly
- [ ] Loading states show and clear properly
- [ ] Empty states display when appropriate
- [ ] Filter changes update all widgets
- [ ] Tab switching preserves filters

### 10.3 Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome / Safari

### 10.4 Performance Testing
- [ ] Initial dashboard load < 2 seconds
- [ ] Filter changes update < 500ms
- [ ] Tab switch smooth (no jank)
- [ ] Chart rendering smooth (60 FPS)
- [ ] No console errors or warnings

---

## Phase 11: Documentation & Knowledge Transfer

### 11.1 Code Documentation
- [ ] JSDoc comments on all public methods
- [ ] Type definitions well-documented
- [ ] Component @Input/@Output descriptions
- [ ] Service method signatures documented
- [ ] Complex calculations explained in comments

### 11.2 Implementation Notes
- [ ] README for dashboard feature
- [ ] Service layer architecture diagram
- [ ] Signal flow diagram
- [ ] Data processing pipeline explanation
- [ ] Future API integration guide

---

## Implementation Checklist

### Models & Types
- [ ] common.model.ts created
- [ ] structure.model.ts created
- [ ] impact.model.ts created

### Services
- [ ] filter.service.ts created
- [ ] data-processor.service.ts created
- [ ] export.service.ts created
- [ ] structure.service.ts created
- [ ] impact.service.ts created

### Mock Data Files
- [ ] structure/meetings.json
- [ ] structure/structure-summary.json
- [ ] structure/meeting-type-distribution.json
- [ ] structure/timing-analysis.json
- [ ] structure/focus-blocks.json
- [ ] structure/fragmentation-scores.json
- [ ] structure/recurring-ratio.json
- [ ] impact/feedback.json
- [ ] impact/impact-summary.json
- [ ] impact/sentiment-distribution.json
- [ ] impact/efficiency-distribution.json
- [ ] impact/impact-by-type.json
- [ ] impact/impact-by-time.json
- [ ] impact/focus-disruption.json
- [ ] impact/qualitative-themes.json

### Shared Components
- [ ] filter-panel.component.ts
- [ ] date-range-selector.component.ts
- [ ] chart-card.component.ts
- [ ] dashboard-tabs.component.ts
- [ ] export-button.component.ts

### Structure Dashboard Widgets
- [ ] structure-kpi-summary.component.ts
- [ ] meeting-type-distribution.component.ts
- [ ] meeting-timing-analysis.component.ts
- [ ] focus-time-analysis.component.ts
- [ ] fragmentation-score.component.ts
- [ ] recurring-adhoc-ratio.component.ts
- [ ] structure-dashboard.component.ts

### Impact Dashboard Widgets
- [ ] impact-kpi-summary.component.ts
- [ ] sentiment-distribution.component.ts
- [ ] efficiency-distribution.component.ts
- [ ] impact-by-meeting-type.component.ts
- [ ] impact-by-time-of-day.component.ts
- [ ] focus-disruption-perception.component.ts
- [ ] qualitative-themes.component.ts
- [ ] impact-dashboard.component.ts

### Integration
- [ ] dashboard.component.ts updated
- [ ] dashboard.component.html updated
- [ ] All filters working across widgets
- [ ] Export functionality working
- [ ] Tab switching working

### Testing & Polish
- [ ] Data validation tests pass
- [ ] Component rendering tests pass
- [ ] Responsive design tested
- [ ] Accessibility tested
- [ ] Performance acceptable
- [ ] Documentation complete

---

## Mock Data Specifications

### Structure Data: Meeting Record

```typescript
{
  meeting_id: "uuid-v4",
  start_time: "2024-01-15T09:00:00Z",
  end_time: "2024-01-15T09:30:00Z",
  duration_minutes: 30,
  recurring: true,
  meeting_type: "Stand-up", // Stand-up | Planning | Retrospective | 1:1 | Ad-hoc | Other
  organizer: "John Doe",
  number_of_participants: 5,
  day_of_week: "Monday",
  time_of_day_bucket: "Morning" // Morning | Midday | Afternoon
}
```

### Impact Data: Feedback Record

```typescript
{
  meeting_id: "uuid-v4",
  perceived_efficiency: 4,        // 1-5 scale (normal distribution ~3.5)
  emotional_impact: "motivated",  // stressed | neutral | motivated
  energy_after_meeting: 3,        // 1-5 scale
  perceived_value: true,          // boolean
  perceived_focus_disruption: 2,  // 1-5 scale
  free_text_comment: "Good discussion, could be shorter",
  time_of_day_bucket: "Morning",
  meeting_type: "Planning",
  feedback_timestamp: "2024-01-15T09:35:00Z"
}
```

---

## Technology Stack

- **Framework**: Angular 20+ with standalone components
- **State Management**: Signals + Computed Signals + toSignal
- **HTTP**: HttpClient for loading JSON files
- **Styling**: Tailwind CSS 4+
- **UI Library**: Preline UI (CSS components on Tailwind)
- **Charts**: ApexCharts + ng-apexcharts
- **RxJS**: Observable-based services
- **TypeScript**: Strict type checking
- **Testing**: Jasmine + Karma (Angular default)

---

## Development Patterns

### Signal-Based Component

```typescript
@Component({
  selector: 'app-my-dashboard',
  standalone: true,
  imports: [CommonModule, ...],
  template: `...`
})
export class MyDashboardComponent {
  private service = inject(MyService);
  private filterService = inject(FilterService);
  
  // Load data as observable and convert to signal
  data = toSignal(this.service.getData(), { initialValue: null });
  
  // Computed signal for reactive derived values
  filtered = computed(() => {
    const d = this.data();
    const f = this.filterService.activeFilters();
    return d ? this.processData(d, f) : null;
  });
}
```

### Service Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class MyService {
  constructor(private http: HttpClient) {}
  
  private rawData = signal<Data[] | null>(null);
  
  getData(): Observable<Data[]> {
    return this.http.get<Data[]>('mock-data/file.json')
      .pipe(tap(data => this.rawData.set(data)));
  }
}
```

### Filter Application

```
User interacts with FilterPanel
↓
FilterService.setFilter() updates signal
↓
Services' computed signals automatically recalculate based on filter
↓
Components' computed signals depend on service signals
↓
Template re-renders due to signal change
```

---

## Success Criteria

✅ Both dashboards fully functional with mock data
✅ All 6 structure widgets working and calculating correctly
✅ All 7 impact widgets working and calculating correctly
✅ Filters (date range, meeting type, time of day) work across all widgets
✅ Performance: no noticeable lag, smooth interactions
✅ Code follows Angular 20+ best practices and patterns
✅ Components reusable and maintainable
✅ Responsive design: mobile, tablet, desktop all tested (optional)
✅ Accessibility: WCAG 2.1 AA standard met (optional but verified if fulfilled)
✅ Ready for backend API integration (minimal changes needed)

### Excluded from MVP (can be added in future iterations):

- Export to CSV and JSON working for both dashboards (postponed and now yet important)

---

## Estimated Timeline

| Phase | Task | Days |
|-------|------|------|
| 1 | Type Definitions & Models | 0.5 |
| 2 | Mock Data Files Creation | 1.5 |
| 3 | Services Setup | 2 |
| 4 | Shared Components | 1.5 |
| 5 | Structure Dashboard (6 widgets) | 2.5 |
| 6 | Impact Dashboard (7 widgets) | 3 |
| 7 | Dashboard Containers | 1.5 |
| 8 | Integration & Data Flow | 1 |
| 9 | Styling & Responsive | 1.5 |
| 10 | Testing & QA | 1.5 |
| 11 | Documentation | 0.5 |
| | **TOTAL** | **17-18 days** |

---

## Future Backend Integration

When moving from mock data to real API:

1. **Zero Component Changes**: Service injection and signal-based approach remains identical
2. **Service Modification Only**:
   ```typescript
   // Before
   return this.http.get<StructureSummary>('mock-data/structure-summary.json');
   
   // After
   return this.http.get<StructureSummary>('/api/v1/structure/summary');
   ```

3. **Data Contracts**:
   - Same TypeScript interfaces used
   - Same response structure expected
   - Same filtering logic applicable
   - Same signal patterns work

4. **Optional Enhancements**:
   - Add loading/error states from API
   - Implement request caching
   - Add real-time data updates via WebSocket
   - Implement server-side filtering for performance

---
