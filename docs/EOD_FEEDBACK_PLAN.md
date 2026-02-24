# End of Day (EoD) Feedback — Implementation Plan

## 1. Current Architecture Summary

The current system is built exclusively around **meeting feedback**. Here's how it works:

- **Backend**: A `Feedback` entity has a `@OneToOne` to `Event` (calendar event). Feedback details are stored as JSONB using Jackson polymorphism (`FeedbackDetails` interface → `MeetingFeedbackDetails`). The `FeedbackController` operates on events via their `externalId`.
- **Frontend**: `MeetingService` loads events from `/api/calendar/events`. The `FeedbackSurveyModalComponent` renders the 5-question meeting survey. `FeedbackUIService` filters events by `feedbackStatus` for the inbox. The calendar view reuses the same modal.
- **Key coupling**: Everything is tied to `Event` entities — feedback status lives on the event, the feedback record FK references `event_id`, and all API paths use the event's `externalId`.

**The EoD feedback is fundamentally different**: it's tied to a **date + user**, not a calendar event. This requires a separate entity, table, controller, and frontend components.

---

## 2. Database Layer

### Migration: `V7__Create_daily_feedbacks_table.sql`

```sql
CREATE TABLE daily_feedbacks (
    id              BIGSERIAL    PRIMARY KEY,
    user_id         BIGINT       NOT NULL,
    feedback_date   DATE         NOT NULL,
    feedback_status VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    details         JSONB,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_daily_feedback_user  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_daily_feedback_user_date UNIQUE (user_id, feedback_date)
);

CREATE INDEX idx_daily_feedbacks_user_date ON daily_feedbacks (user_id, feedback_date);
```

**Design rationale**:
- No FK to `events` — this is date-based, not event-based.
- `UNIQUE(user_id, feedback_date)` ensures one feedback per user per day.
- `details` is JSONB (same pattern as meeting feedback) for storing the 5 EoD answers.
- `feedback_status` is on the record itself (not on an event like meeting feedback).
- Records are created **lazily** — only when the user submits or dismisses. Eligible pending dates are computed dynamically by the API.

---

## 3. Backend Model Layer

### 3.1 `DailyFeedback.java` — New JPA entity

Location: `model/feedback/DailyFeedback.java`

```java
@Entity
@Table(name = "daily_feedbacks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyFeedback {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "feedback_date", nullable = false)
    private LocalDate feedbackDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "feedback_status", nullable = false)
    private FeedbackStatus feedbackStatus;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "details", columnDefinition = "jsonb")
    private FeedbackDetails details;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

### 3.2 `DailyFeedbackDetails.java` — New details class

Location: `model/feedback/DailyFeedbackDetails.java`

Implements `FeedbackDetails` with the 4 EoD questions:

| Field                    | Question                                                          | Scale |
| ------------------------ | ----------------------------------------------------------------- | ----- |
| `productivityScore`      | Q1: How productive were you today?                                | 1–5   |
| `deepWorkScore`          | Q2: How much deep, focused work did you do today?                 | 1–5   |
| `energyScore`            | Q3: How energized do you feel right now?                          | 1–5   |
| `meetingLoadScore`       | Q4: How did today's meeting load feel?                            | 1–5   |

```java
@Data
public class DailyFeedbackDetails implements FeedbackDetails {
    private Integer productivityScore;
    private Integer deepWorkScore;
    private Integer energyScore;
    private Integer meetingLoadScore;
}
```

### 3.3 Update `FeedbackDetails.java` — Register new subtype

```java
@JsonSubTypes({
    @JsonSubTypes.Type(value = MeetingFeedbackDetails.class, name = "MEETING"),
    @JsonSubTypes.Type(value = DailyFeedbackDetails.class, name = "DAILY")  // NEW
})
public interface FeedbackDetails {}
```

### 3.4 Note on `IssueTag.java`

The current `IssueTag` enum doesn't match the CONSTRUCTS.md. The constructs define both **negative** and **positive** tags, and the current implementation only has negative ones with different values. This should be updated as part of a separate effort. The EoD feedback does not use issue tags.

---

## 4. Backend Repository Layer

### `DailyFeedbackRepository.java`

Location: `repository/DailyFeedbackRepository.java`

```java
@Repository
public interface DailyFeedbackRepository extends JpaRepository<DailyFeedback, Long> {

    Optional<DailyFeedback> findByUserIdAndFeedbackDate(Long userId, LocalDate date);

    List<DailyFeedback> findByUserIdAndFeedbackDateBetween(
        Long userId, LocalDate start, LocalDate end
    );

    List<DailyFeedback> findByUserIdAndFeedbackDateBetweenOrderByFeedbackDateDesc(
        Long userId, LocalDate start, LocalDate end
    );
}
```

---

## 5. Backend DTO Layer

### 5.1 `DailyFeedbackSubmitRequest.java`

Location: `dto/feedback/DailyFeedbackSubmitRequest.java`

```java
@Data
public class DailyFeedbackSubmitRequest {
    private FeedbackDetails details;  // Will be DailyFeedbackDetails via Jackson polymorphism
}
```

### 5.2 `DailyFeedbackDto.java`

Location: `dto/feedback/DailyFeedbackDto.java`

Returned to the frontend for each day:

```java
@Data
@Builder
public class DailyFeedbackDto {
    private LocalDate date;
    private FeedbackStatus feedbackStatus;
    private DailyFeedbackDetails details;  // null for PENDING
    private boolean eligible;              // whether the 2h-before-end trigger has passed
    private LocalDateTime createdAt;
}
```

---

## 6. Backend Service Layer

### `DailyFeedbackService.java`

Location: `service/DailyFeedbackService.java`

**Key methods:**

| Method                                                                                  | Description                                                                                                          |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `submitDailyFeedback(LocalDate date, DailyFeedbackSubmitRequest req, String username)`  | Creates or updates a `DailyFeedback` record with status=SUBMITTED and stores the details JSONB.                      |
| `dismissDailyFeedback(LocalDate date, String username)`                                 | Creates or updates with status=DISMISSED.                                                                            |
| `undoDismissDailyFeedback(LocalDate date, String username)`                             | Sets status back to PENDING (or deletes the record).                                                                 |
| `getDailyFeedbacksForRange(String username, LocalDate start, LocalDate end)`            | Returns `List<DailyFeedbackDto>` for the date range — merges existing DB records with computed "virtual pending" days.|
| `getPendingDailyFeedbacks(String username)`                                             | Returns all eligible pending dates from `user.createdAt` to today. Used by the inbox.                                |

**Eligibility logic for inbox** (in `getPendingDailyFeedbacks`):

1. Get the user's `createdAt` date and `workEndTime` (default 18:00).
2. For each date from `createdAt.toLocalDate()` to `LocalDate.now()`:
   - Compute trigger time = `date @ (workEndTime - 2 hours)` (e.g., 16:00 for 18:00 end).
   - If `LocalDateTime.now()` >= trigger time → this day is eligible.
3. Load all existing `DailyFeedback` records for the user in that range.
4. For each eligible date:
   - If a record exists → return its actual status (SUBMITTED/DISMISSED/PENDING).
   - If no record exists → return a virtual DTO with status=PENDING.
5. Filter: return only PENDING (and optionally DISMISSED, controlled by query param).

**For the calendar range** (in `getDailyFeedbacksForRange`):

- Same merge logic but scoped to the requested date range.
- Don't filter by trigger time here — the calendar should show status for all days (but only allow submission for past/current days).

---

## 7. Backend Controller Layer

### `DailyFeedbackController.java`

Location: `controller/DailyFeedbackController.java`

```java
@RestController
@RequestMapping("/api/daily-feedback")
@RequiredArgsConstructor
public class DailyFeedbackController {

    private final DailyFeedbackService dailyFeedbackService;

    @PostMapping("/{date}/submit")
    public ResponseEntity<Void> submitFeedback(
        @PathVariable LocalDate date,
        @RequestBody DailyFeedbackSubmitRequest request,
        @AuthenticationPrincipal UserDetails userDetails) { ... }

    @PostMapping("/{date}/dismiss")
    public ResponseEntity<Void> dismiss(
        @PathVariable LocalDate date,
        @AuthenticationPrincipal UserDetails userDetails) { ... }

    @PostMapping("/{date}/undo-dismiss")
    public ResponseEntity<Void> undoDismiss(
        @PathVariable LocalDate date,
        @AuthenticationPrincipal UserDetails userDetails) { ... }

    @GetMapping("/range")
    public ResponseEntity<List<DailyFeedbackDto>> getRange(
        @RequestParam LocalDate start,
        @RequestParam LocalDate end,
        @AuthenticationPrincipal UserDetails userDetails) { ... }

    @GetMapping("/pending")
    public ResponseEntity<List<DailyFeedbackDto>> getPending(
        @AuthenticationPrincipal UserDetails userDetails) { ... }
}
```

---

## 8. Frontend Model Layer

### Update `feedback.model.ts`

Add new types for EoD feedback:

```typescript
export interface DailyFeedback {
  date: string;           // ISO date string "2025-01-15"
  feedbackStatus: FeedbackStatus;
  details?: DailyFeedbackDetails;
  eligible: boolean;
}

export interface DailyFeedbackDetails {
  productivityScore: number;      // Q1: 1-5
  deepWorkScore: number;          // Q2: 1-5
  energyScore: number;            // Q3: 1-5
  meetingLoadScore: number;       // Q4: 1-5
}

export interface DailyFeedbackSubmission {
  date: string;
  details: DailyFeedbackDetails & { type: 'DAILY' };
}
```

---

## 9. Frontend Service Layer

### 9.1 New `DailyFeedbackService` (shared)

Location: `shared/services/daily-feedback.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class DailyFeedbackService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/daily-feedback`;

  private dailyFeedbacksSignal = signal<DailyFeedback[]>([]);
  public readonly dailyFeedbacks = this.dailyFeedbacksSignal.asReadonly();

  private isLoadingSignal = signal<boolean>(false);
  public readonly isLoading = this.isLoadingSignal.asReadonly();

  loadForDateRange(start: string, end: string): Observable<DailyFeedback[]> {
    // GET /api/daily-feedback/range?start=...&end=...
    // Updates signal
  }

  loadPending(): Observable<DailyFeedback[]> {
    // GET /api/daily-feedback/pending
    // Updates signal
  }

  submitFeedback(date: string, details: DailyFeedbackDetails): Observable<void> {
    // POST /api/daily-feedback/{date}/submit
    // Locally updates signal status to SUBMITTED
  }

  dismissFeedback(date: string): Observable<void> {
    // POST /api/daily-feedback/{date}/dismiss
  }

  undoDismiss(date: string): Observable<void> {
    // POST /api/daily-feedback/{date}/undo-dismiss
  }
}
```

### 9.2 Update `FeedbackUIService`

The inbox service needs to merge **meeting feedbacks** and **daily feedbacks** into a unified view. **Recommended approach**: Two separate sections in the inbox — "Meeting Feedback" and "End of Day Feedback" — with separate counters and a combined total.

```typescript
// Add to FeedbackUIService:
private dailyFeedbackService = inject(DailyFeedbackService);

public readonly pendingDailyFeedbacks = computed(() =>
  this.dailyFeedbackService.dailyFeedbacks()
    .filter(d => d.feedbackStatus === FeedbackStatus.PENDING)
);

public readonly dismissedDailyFeedbacks = computed(() =>
  this.dailyFeedbackService.dailyFeedbacks()
    .filter(d => d.feedbackStatus === FeedbackStatus.DISMISSED)
);

public readonly filteredDailyFeedbacks = computed(() => {
  const pending = this.pendingDailyFeedbacks();
  const dismissed = this.dismissedDailyFeedbacks();
  const list = this.showDismissedSignal() ? [...pending, ...dismissed] : [...pending];
  return list.sort((a, b) => b.date.localeCompare(a.date));
});

public readonly totalPendingCount = computed(() =>
  this.pendingMeetings().length + this.pendingDailyFeedbacks().length
);

loadRecentMeetingsForInbox(): void {
  // Existing meeting loading...
  this.dailyFeedbackService.loadPending().subscribe();  // NEW
}
```

### 9.3 Update `CalendarUIService`

Load daily feedback statuses alongside events when loading a week:

```typescript
// Add to CalendarUIService:
private dailyFeedbackService = inject(DailyFeedbackService);
public readonly dailyFeedbacks = this.dailyFeedbackService.dailyFeedbacks;

loadEventsForCurrentWeek(): void {
  // ... existing event loading ...
  const startStr = startOfWeek.toISOString().split('T')[0];
  const endStr = endOfWeek.toISOString().split('T')[0];
  this.dailyFeedbackService.loadForDateRange(startStr, endStr).subscribe();
}
```

---

## 10. Frontend Components

### 10.1 New `EodSurveyModalComponent`

Location: `features/feedback-inbox/components/eod-survey-modal.component.ts` + `.html`

A new modal specifically for the 4 EoD questions. Structure mirrors `FeedbackSurveyModalComponent` but with different questions:

| Form Control           | Label                                                               | Scale Anchors                      |
| ---------------------- | ------------------------------------------------------------------- | ---------------------------------- |
| `productivityScore`    | "How productive were you today?"                                    | 1=unproductive → 5=productive      |
| `deepWorkScore`        | "How much deep, focused work did you do today?"                     | 1=none → 5=a lot                   |
| `energyScore`          | "How energized do you feel right now?"                              | 1=drained → 5=energized            |
| `meetingLoadScore`     | "How did today's meeting load feel?"                                | 1=too few → 5=too many             |

**Inputs/Outputs:**

```typescript
date = input.required<string>();          // ISO date string
submitFeedback = output<DailyFeedbackSubmission>();
close = output<void>();
```

The header should show the date (formatted nicely) instead of a meeting title. No meeting category dropdown, no issue tags, no mood picker, no comments — just the 4 Likert scales.

### 10.2 New `EodFeedbackCardComponent`

Location: `features/feedback-inbox/components/eod-feedback-card.component.ts`

Similar to `FeedbackCardComponent` but styled differently:

- Shows a 📋 or 🌅 icon instead of meeting details.
- Title: "End of Day — January 15, 2025"
- Subtitle: "Reflect on your workday"
- Same "Give Feedback" / "Dismiss" actions.
- Different badge color (e.g., amber/orange instead of blue).

**Inputs/Outputs:**

```typescript
dailyFeedback = input.required<DailyFeedback>();
giveFeedback = output<string>();     // emits the date string
dismissFeedback = output<string>();  // emits the date string
```

### 10.3 Update `CalendarGridComponent`

Add an EoD button in each day column. The best placement is in the **day header area**, below the date number:

**New inputs/outputs:**

```typescript
dailyFeedbacks = input<DailyFeedback[]>([]);
eodFeedbackClick = output<{ date: Date; status: FeedbackStatus }>();
```

**New helper method:**

```typescript
getDailyFeedbackForDay(date: Date): DailyFeedback | undefined {
  const dateStr = this.formatDateToISO(date);
  return this.dailyFeedbacks().find(df => df.date === dateStr);
}
```

**Template addition** (in the day header column, after the date number):

```html
@if (getDailyFeedbackForDay(day); as df) {
  <button
    (click)="eodFeedbackClick.emit({ date: day, status: df.feedbackStatus }); $event.stopPropagation()"
    class="mt-1 text-xs px-2 py-0.5 rounded-full transition-colors ..."
    [class]="getEodButtonClasses(df.feedbackStatus)"
    [disabled]="isFutureDate(day)">
    @if (df.feedbackStatus === 'SUBMITTED') {
      ✓ Day Reviewed
    } @else if (df.feedbackStatus === 'DISMISSED') {
      — Skipped
    } @else {
      📋 Review Day
    }
  </button>
} @else if (!isFutureDate(day)) {
  <button
    (click)="eodFeedbackClick.emit({ date: day, status: 'PENDING' }); $event.stopPropagation()"
    class="mt-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors">
    📋 Review Day
  </button>
}
```

### 10.4 Update `CalendarViewComponent`

- Add `EodSurveyModalComponent` to imports.
- Pass `dailyFeedbacks` to the grid.
- Add `selectedEodDate` signal.
- Handle `eodFeedbackClick` event to open the `EodSurveyModalComponent`.
- Handle `onSubmitEodFeedback` and `onDismissEod` actions.

```typescript
// New signal:
selectedEodDate = signal<string | null>(null);

// New in template:
<app-calendar-grid
  ...
  [dailyFeedbacks]="calendarService.dailyFeedbacks()"
  (eodFeedbackClick)="onEodFeedbackClick($event)">
</app-calendar-grid>

@if (selectedEodDate(); as date) {
  <app-eod-survey-modal
    [date]="date"
    (submitFeedback)="onSubmitEodFeedback($event)"
    (close)="selectedEodDate.set(null)"
  />
}
```

### 10.5 Update `FeedbackInboxComponent` + Template

Add a section for EoD feedback items:

```html
<!-- Header: update pending count to include daily -->
<span class="...">
  {{ feedbackService.totalPendingCount() }}
</span>

<!-- Meeting Feedback Section -->
<h2 class="text-lg font-semibold text-foreground mt-6 mb-3">Meeting Feedback</h2>
@for (meeting of feedbackService.filteredMeetings(); track meeting.id) {
  <app-feedback-card ... />
}

<!-- End of Day Feedback Section -->
<h2 class="text-lg font-semibold text-foreground mt-8 mb-3">End of Day Feedback</h2>
@for (df of feedbackService.filteredDailyFeedbacks(); track df.date) {
  <app-eod-feedback-card
    [dailyFeedback]="df"
    (giveFeedback)="onGiveEodFeedback($event)"
    (dismissFeedback)="onDismissEodFeedback($event)"
  />
}

<!-- EoD Survey Modal -->
@if (selectedEodDate()) {
  <app-eod-survey-modal
    [date]="selectedEodDate()!"
    (submitFeedback)="onSubmitEodFeedback($event)"
    (close)="selectedEodDate.set(null)"
  />
}
```

---

## 11. Implementation Order (Step-by-Step)

Implement in this order to keep each step testable:

### Phase 1: Backend Foundation
1. **Flyway migration** `V7__Create_daily_feedbacks_table.sql`
2. **Model**: `DailyFeedback.java`, `DailyFeedbackDetails.java`
3. **Update** `FeedbackDetails.java` to register `DAILY` subtype
4. **Repository**: `DailyFeedbackRepository.java`
5. **DTOs**: `DailyFeedbackDto.java`, `DailyFeedbackSubmitRequest.java`
6. **Service**: `DailyFeedbackService.java` (with eligibility logic)
7. **Controller**: `DailyFeedbackController.java`

### Phase 2: Frontend Service & Model
8. **Model**: Add `DailyFeedback`, `DailyFeedbackDetails`, `DailyFeedbackSubmission` to `feedback.model.ts`
9. **Service**: Create `DailyFeedbackService` in `shared/services/`
10. **Update** `FeedbackUIService` with daily feedback integration
11. **Update** `CalendarUIService` to load daily feedback statuses

### Phase 3: Frontend Components — EoD Survey Modal
12. **Component**: `EodSurveyModalComponent` (standalone modal with the 5 Likert questions)

### Phase 4: Frontend Integration — Inbox
13. **Component**: `EodFeedbackCardComponent`
14. **Update** `FeedbackInboxComponent` — add EoD section, counter, and modal wiring

### Phase 5: Frontend Integration — Calendar
15. **Update** `CalendarGridComponent` — add EoD button per day
16. **Update** `CalendarViewComponent` — wire up EoD modal + daily feedback data

---

## 12. File Change Summary

| Layer          | File                                                                                    | Action |
| -------------- | --------------------------------------------------------------------------------------- | ------ |
| **DB**         | `backend/.../db/migration/V7__Create_daily_feedbacks_table.sql`                         | CREATE |
| **Model**      | `backend/.../model/feedback/DailyFeedback.java`                                         | CREATE |
| **Model**      | `backend/.../model/feedback/DailyFeedbackDetails.java`                                  | CREATE |
| **Model**      | `backend/.../model/feedback/FeedbackDetails.java`                                       | MODIFY |
| **Repo**       | `backend/.../repository/DailyFeedbackRepository.java`                                   | CREATE |
| **DTO**        | `backend/.../dto/feedback/DailyFeedbackDto.java`                                        | CREATE |
| **DTO**        | `backend/.../dto/feedback/DailyFeedbackSubmitRequest.java`                               | CREATE |
| **Service**    | `backend/.../service/DailyFeedbackService.java`                                         | CREATE |
| **Controller** | `backend/.../controller/DailyFeedbackController.java`                                   | CREATE |
| **FE Model**   | `frontend/.../features/feedback-inbox/models/feedback.model.ts`                         | MODIFY |
| **FE Service** | `frontend/.../shared/services/daily-feedback.service.ts`                                | CREATE |
| **FE Service** | `frontend/.../features/feedback-inbox/services/feedback-ui.service.ts`                  | MODIFY |
| **FE Service** | `frontend/.../features/calendar/services/calendar-ui.service.ts`                        | MODIFY |
| **FE Component** | `frontend/.../features/feedback-inbox/components/eod-survey-modal.component.ts`       | CREATE |
| **FE Component** | `frontend/.../features/feedback-inbox/components/eod-survey-modal.component.html`     | CREATE |
| **FE Component** | `frontend/.../features/feedback-inbox/components/eod-feedback-card.component.ts`      | CREATE |
| **FE Component** | `frontend/.../features/feedback-inbox/feedback-inbox.component.ts`                    | MODIFY |
| **FE Component** | `frontend/.../features/feedback-inbox/feedback-inbox.component.html`                  | MODIFY |
| **FE Component** | `frontend/.../features/calendar/components/calendar-grid.component.ts`                | MODIFY |
| **FE Component** | `frontend/.../features/calendar/components/calendar-view.component.ts`                | MODIFY |

---

## 13. Edge Cases & Design Notes

1. **Timezone handling**: The backend uses `Europe/Zurich`. The trigger time (`workEndTime - 2h`) should be computed in that timezone. `DailyFeedback.feedbackDate` is `LocalDate` — no timezone ambiguity.

2. **User with no `workEndTime` set**: Default to 18:00, which means the trigger time is 16:00. This matches the existing fallback in `CalendarGridComponent` (`workEndHour` defaults to 18).

3. **Weekends/non-working days**: The EoD feedback should still be available for any day (the user might have had meetings on a non-working day). However, in the **inbox**, we could optionally filter out non-working days to reduce noise. Recommendation: include all days initially and let the user dismiss unwanted ones.

4. **Future dates**: The EoD button on the calendar should be disabled for future dates (can't review a day that hasn't happened yet).

5. **Same-day feedback**: A user can submit EoD feedback for today once the trigger time has passed (2h before `workEndTime`). In the calendar view, the button should always be visible for today and past days — the trigger time only controls when it appears in the **inbox**.

6. **Existing `Feedback` table relationship**: The new `daily_feedbacks` table is completely separate. The existing `feedbacks` table continues to serve meeting-level feedback only. No FK relationship between them.

7. **IssueTag alignment**: The current `IssueTag` enum doesn't match the CONSTRUCTS.md (which has positive tags too, and different names). The EoD survey doesn't use issue tags, so this can be addressed separately.

8. **Badge count in navbar**: If there's a notification badge in the navbar, it should reflect `totalPendingCount` (meetings + daily). Check the navbar component for existing badge logic and update accordingly.

---

## 14. EoD Survey Question Reference (from CONSTRUCTS.md)

| #  | Question                                                        | Scale Anchors                          | Construct      |
| -- | --------------------------------------------------------------- | -------------------------------------- | -------------- |
| Q1 | How productive were you today?                                  | 1=unproductive → 5=productive          | Productivity   |
| Q2 | How much deep, focused work did you do today?                   | 1=none → 5=a lot                       | Flow           |
| Q3 | How energized do you feel right now?                            | 1=drained → 5=energized                | Well-Being     |
| Q4 | How did today's meeting load feel?                              | 1=too few → 5=too many                 | Meeting Load   |