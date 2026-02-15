# Implementation Plan: Feedback Inbox Feature

## Overview
This document outlines the frontend implementation plan for the Feedback Inbox feature, which allows users to provide feedback on completed meetings through a modal survey system.

---

## Project Structure

```
frontend/src/app/features/feedback-inbox/
├── feedback-inbox.component.ts
├── feedback-inbox.component.html
├── feedback-inbox.component.css
├── models/
│   └── feedback.model.ts
├── services/
│   └── feedback.service.ts
└── components/
    ├── feedback-card.component.ts
    ├── feedback-survey-modal.component.ts
    └── feedback-survey-modal.component.html
```

---

## Implementation Phases

### Phase 1: Data Models & Types
**Location:** `frontend/src/app/features/feedback-inbox/models/feedback.model.ts`

- [x] Define `FeedbackStatus` enum (`PENDING`, `SUBMITTED`, `DISMISSED`)
- [x] Define `DismissReason` enum (optional reasons)
- [x] Define `MoodType` enum (`NEGATIVE`, `NEUTRAL`, `POSITIVE`)
- [x] Define `IssueTag` enum (all issue options from spec)
- [x] Define `FeedbackableMeeting` interface
  - Properties: `meeting_id`, `title`, `start_time`, `end_time`, `duration_minutes`, `meeting_type`, `feedback_status`
- [x] Define `FeedbackRecord` interface
  - Properties: `meeting_id`, `user_id`, `status`, `created_at`, `submitted_at`, `dismissed_at`, `dismiss_reason`
- [x] Define `MeetingFeedback` interface (survey response)
  - Properties: `meeting_id`, `roti_score`, `mood`, `energy_after`, `could_be_async`, `issue_tags`, `comment`
- [x] Define response interfaces for API calls

---

### Phase 2: Mock Data Creation
**Location:** `frontend/public/mock-data/feedback/`

- [x] Create `feedbackable-meetings.json`
  - Generate 5-10 completed meetings with `PENDING` status
  - Include variety of meeting types (Stand-up, Planning, 1:1, etc.)
  - Use past dates (ended meetings)
  - Mix of different durations and participant counts
- [x] Create `submitted-feedback.json` (for reference/future use)
  - Sample submitted feedback records
- [x] Create `dismissed-meetings.json`
  - Sample dismissed meetings for "Show dismissed" toggle

---

### Phase 3: Feedback Service
**Location:** `frontend/src/app/features/feedback-inbox/services/feedback.service.ts`

- [x] Create `FeedbackService` with `@Injectable({ providedIn: 'root' })`
- [x] Add `HttpClient` injection
- [x] Implement `getPendingMeetings()` method
  - Returns `Observable<FeedbackableMeeting[]>`
  - Fetches from `mock-data/feedback/feedbackable-meetings.json`
- [x] Implement `getDismissedMeetings()` method
  - Returns `Observable<FeedbackableMeeting[]>`
  - Fetches from `mock-data/feedback/dismissed-meetings.json`
- [x] Add signal for `pendingCount` (computed from pending meetings)
- [x] Implement `submitFeedback(meetingId: string, feedback: MeetingFeedback)` method
  - Returns `Observable<void>`
  - For now, just logs to console and resolves
- [x] Implement `dismissMeeting(meetingId: string, reason?: DismissReason)` method
  - Returns `Observable<void>`
  - Updates local state
- [x] Implement `undoDismiss(meetingId: string)` method
  - Returns `Observable<void>`
  - Reverts dismiss action
- [x] Add signals for reactive state management
  - `pendingMeetings` signal
  - `dismissedMeetings` signal
  - `showDismissed` signal
  - `filteredMeetings` computed signal

---

### Phase 4: Feedback Card Component
**Location:** `frontend/src/app/features/feedback-inbox/components/feedback-card.component.ts`

- [x] Create standalone component with `@Component` decorator
- [x] Add input signal for `meeting: FeedbackableMeeting`
- [x] Add output events:
  - `giveFeedback` - emits meeting_id
  - `dismissMeeting` - emits meeting_id
- [x] Implement template with Tailwind + Preline styles
  - Card layout with border and shadow
  - Display meeting title (bold, prominent)
  - Display date & time (formatted: "Dec 16, 2024 • 9:00 AM - 10:00 AM")
  - Display duration (e.g., "60 min")
  - Display meeting type as colored chip/badge
  - Action buttons:
    - Primary button: "Give Feedback" (bg-primary)
    - Secondary button: "Dismiss" (bg-secondary with icon)
- [x] Add date formatting using Angular DatePipe
- [x] Add meeting type badge color mapping
  - Stand-up: blue
  - Planning: purple
  - Retrospective: green
  - 1:1: yellow
  - Ad-hoc: orange
  - Other: gray

---

### Phase 5: Feedback Survey Modal Component
**Location:** `frontend/src/app/features/feedback-inbox/components/feedback-survey-modal.component.ts`

- [x] Create standalone component
- [x] Add input signal for `meeting: FeedbackableMeeting | null`
- [x] Add output events:
  - `submitFeedback` - emits `MeetingFeedback`
  - `close` - emits when modal closes
- [x] Implement reactive form with FormBuilder
  - `roti_score` (required, 1-5)
  - `mood` (required, enum)
  - `energy_after` (required, 1-5)
  - `could_be_async` (boolean, default false)
  - `issue_tags` (array, conditional)
  - `comment` (string, optional)
- [x] Add computed signal `shouldShowIssues`
  - Show when `roti_score <= 2` OR `mood === 'NEGATIVE'` OR `energy_after <= 2`
- [x] Implement modal template using Preline overlay
  - Modal header with meeting title & time
  - Form sections:
    - Q1: ROTI Score (5-point Likert scale with radio buttons)
    - Q2: Mood (3 options with icons/emojis)
    - Q3: Energy (5-point Likert scale)
    - Q4: Async toggle (switch/checkbox)
    - Q5: Issues (conditional, multi-select checkboxes)
    - Q6: Comment (conditional, textarea)
  - Modal footer with Cancel & Submit buttons
- [x] Add form validation
- [x] Handle submit action
- [x] Handle cancel/close action
- [x] Add modal backdrop and ESC key handling

---

### Phase 6: Main Inbox Component
**Location:** `frontend/src/app/features/feedback-inbox/feedback-inbox.component.ts`

- [x] Create main component as standalone
- [x] Inject `FeedbackService`
- [x] Add signals for:
  - `isLoading` (loading state)
  - `selectedMeeting` (for modal)
  - `showDismissed` (toggle state)
  - `showUndoToast` (undo notification)
  - `lastDismissedId` (for undo functionality)
- [x] Implement `ngOnInit()` lifecycle hook
  - Load pending meetings
  - Subscribe to service signals
- [x] Implement `onGiveFeedback(meetingId: string)` method
  - Find meeting by ID
  - Set `selectedMeeting` to open modal
- [x] Implement `onDismissMeeting(meetingId: string)` method
  - Call service dismiss method
  - Show undo toast
  - Set timeout for undo (10 seconds)
- [x] Implement `onUndoDismiss()` method
  - Call service undo method
  - Hide toast
  - Clear timeout
- [x] Implement `onSubmitFeedback(feedback: MeetingFeedback)` method
  - Call service submit method
  - Close modal
  - Show success message (optional)
- [x] Implement `onCloseModal()` method
  - Clear `selectedMeeting`
- [x] Implement `toggleShowDismissed()` method
  - Toggle visibility of dismissed items

---

### Phase 7: Main Inbox Template
**Location:** `frontend/src/app/features/feedback-inbox/feedback-inbox.component.html`

- [x] Create page container with consistent padding
- [x] Add page header
  - Title: "Feedback Inbox"
  - Subtitle: "Provide feedback on your recent meetings"
  - Badge showing pending count
- [x] Add controls section
  - Toggle switch: "Show dismissed" (right-aligned)
  - Sort indicator: "Most recent first"
- [x] Add meetings list section
  - Use `@for` to iterate over filtered meetings
  - Display `app-feedback-card` for each meeting
  - Handle empty state: "No pending feedback"
  - Handle loading state: Skeleton loaders
- [x] Add survey modal
  - Use `@if` to conditionally render based on `selectedMeeting`
  - Pass meeting data to modal
  - Bind event handlers
- [x] Add undo toast notification
  - Position: bottom-right
  - Show when `showUndoToast` is true
  - Auto-dismiss after 10 seconds
  - Include "Undo" button
  - Use Preline toast styles

---

### Phase 8: Routing & Navigation
**Location:** `frontend/src/app/app.routes.ts`

- [x] Add new route for feedback inbox
  ```typescript
  {
    path: 'feedback',
    loadComponent: () =>
      import('./features/feedback-inbox/feedback-inbox.component').then(
        (m) => m.FeedbackInboxComponent,
      ),
    canActivate: [authGuard],
  }
  ```

---

### Phase 9: Navbar Integration
**Location:** `frontend/src/app/layout/navbar/navbar.component.html`

- [x] Add "Feedback" navigation link
- [x] Add badge with pending count
  - Inject `FeedbackService` in navbar component
  - Display count from service signal
  - Only show badge if count > 0
  - Style: small circular badge with primary background
- [x] Position after "Dashboard" link, before "Settings"
- [x] Use same routing and active state patterns

**Location:** `frontend/src/app/layout/navbar/navbar.component.ts`

- [x] Inject `FeedbackService`
- [x] Expose `pendingCount` signal from service
- [x] Load pending count on init (if not lazy-loaded)

---

### Phase 10: Styling & UI Polish
**Locations:** Various component files

- [x] Ensure consistent spacing using Tailwind utilities
- [x] Apply Preline design tokens for colors
- [x] Add hover states for interactive elements
- [x] Add focus states for accessibility
- [x] Implement responsive design (mobile-first)
  - Stack cards vertically on mobile
  - Adjust modal sizing for mobile
  - Make form inputs touch-friendly
- [x] Add transitions for smooth interactions
  - Modal fade-in/fade-out
  - Card hover effects
  - Toast slide-in
- [x] Add loading skeletons for better UX
- [x] Ensure proper color contrast for accessibility

---

### Phase 11: Form UX Enhancements

- [x] Add Likert scale visualization
  - Radio buttons styled as clickable scale
  - Visual labels (1 = "Strongly disagree", 5 = "Strongly agree")
  - Hover effects on scale items
- [x] Add mood selector with emojis/icons
  - Negative: sad emoji
  - Neutral: neutral emoji
  - Positive: happy emoji
- [x] Style energy scale similarly to ROTI
  - 1 = "Drained", 5 = "Energized"
- [x] Add checkbox group styling for issues
  - Grid layout (2 columns on desktop, 1 on mobile)
  - Clear visual states (checked/unchecked)
- [x] Add character count for comment field
  - Optional max length (e.g., 500 chars)
  - Display remaining characters
- [x] Add form validation error messages
  - Display below each field
  - Use destructive color for errors

---

### Phase 12: Toast Notification System
**Location:** Inline in feedback-inbox component

- [x] Create toast notification inline
  - Support undo action
  - Auto-dismiss functionality
  - Manual dismiss button
  - Action button support (for "Undo")
- [x] Implement toast positioning
  - Bottom-right corner
  - Z-index to appear above other content
- [x] Add animations
  - Slide-in from bottom
  - Fade-out on dismiss

---

### Phase 13: Empty States & Error Handling

- [x] Design empty state for no pending feedback
  - Friendly icon (e.g., inbox with checkmark)
  - Message: "You're all caught up!"
  - Subtext: "No meetings need your feedback right now"
- [x] Design empty state for no dismissed meetings
  - Icon and message when "Show dismissed" is on but none exist
- [x] Add error handling for failed API calls
  - Display error toast
  - Retry mechanism (optional)
- [x] Add loading states
  - Skeleton cards while loading
  - Disable buttons during submission

---

### Phase 14: Accessibility (A11y)

- [x] Add proper ARIA labels to all interactive elements
- [x] Ensure keyboard navigation works
  - Tab through form fields
  - Enter to submit
  - Escape to close modal
- [x] Add screen reader announcements
  - Modal open/close
  - Form submission success
  - Dismiss/undo actions
- [x] Ensure proper heading hierarchy
- [x] Add focus trap in modal
- [x] Test with screen reader
- [x] Ensure color contrast meets WCAG AA standards

---

### Phase 15: Testing & Refinement

- [x] Manual testing
  - Test all user flows
  - Test responsive behavior
  - Test form validation
  - Test undo functionality (timing)
  - Test show/hide dismissed toggle
- [x] Cross-browser testing (if applicable)
- [x] Performance check
  - Ensure no memory leaks
  - Optimize re-renders with signals
- [x] Code review
  - Follow Angular best practices
  - Use standalone components
  - Use signals for reactive state
  - Proper TypeScript types
- [x] Documentation
  - Add JSDoc comments to service methods
  - Document component inputs/outputs
  - Update README if needed

---

## Technical Stack & Patterns

### Angular 20+ Best Practices
- ✅ Use standalone components (no modules)
- ✅ Use `inject()` function for dependency injection
- ✅ Use signals for reactive state management
- ✅ Use computed signals for derived state
- ✅ Use input/output signals for component communication
- ✅ Use `@for` and `@if` control flow syntax
- ✅ Lazy load routes with dynamic imports

### State Management
- Use signals at service level for shared state
- Use computed signals for derived data (filtering, sorting)
- Avoid unnecessary subscriptions (prefer async pipe or signal reads)

### Styling
- Tailwind CSS for utility classes
- Preline UI components for complex patterns (modals, overlays, toasts)
- Follow existing color token patterns from theme.constants.ts
- Maintain consistent spacing and typography

### Mock Data Pattern
- JSON files in `public/mock-data/feedback/`
- HttpClient to fetch from public directory
- Service methods return Observables
- Easy to swap with real API later

---

## Key Design Decisions

1. **Modal vs. Separate Page**: Using modal for quick feedback without navigation away
2. **Undo Pattern**: 10-second window to undo dismiss (non-destructive)
3. **Conditional Form Fields**: Show issue tags only when needed (reduces friction)
4. **Badge in Navbar**: Passive notification without being intrusive
5. **Mock Data First**: Fully functional UI without backend dependency
6. **Signal-Based**: Modern Angular reactive patterns for better performance
7. **Accessibility First**: Ensure all users can use the feature

---

## File Checklist Summary

### New Files to Create
- [x] `feedback.model.ts` - All TypeScript interfaces and enums
- [x] `feedback.service.ts` - Service with mock data calls
- [x] `feedback-card.component.ts` - Meeting card component
- [x] `feedback-survey-modal.component.ts` - Modal with form
- [x] `feedback-survey-modal.component.html` - Modal template
- [x] `feedback-inbox.component.ts` - Main page component
- [x] `feedback-inbox.component.html` - Main page template
- [x] `feedback-inbox.component.css` - Custom styles (if needed)
- [x] `feedbackable-meetings.json` - Mock pending meetings
- [x] `dismissed-meetings.json` - Mock dismissed meetings
- [x] `submitted-feedback.json` - Mock submitted feedback (optional)

### Files to Modify
- [x] `app.routes.ts` - Add feedback route
- [x] `navbar.component.ts` - Add feedback service injection
- [x] `navbar.component.html` - Add feedback link with badge

---



## Success Criteria

- [x] User can view list of pending meetings requiring feedback
- [x] User can open survey modal for any meeting
- [x] User can complete and submit survey (all validation passes)
- [x] User can dismiss meetings they don't want to provide feedback on
- [x] User can undo dismiss within 10 seconds
- [x] User can toggle visibility of dismissed meetings
- [x] Badge count updates correctly in navbar
- [x] UI is responsive and works on mobile devices
- [x] All interactions are keyboard accessible
- [x] Modal properly traps focus and closes on ESC
- [x] Empty states display correctly
- [x] Loading states are smooth
- [x] Code follows Angular 20+ best practices

---

## Future Enhancements (Out of Scope for Initial Implementation)

- Analytics/insights from feedback data
- Filtering by meeting type or date range
- Search functionality
- Bulk actions (dismiss all, etc.)
- Feedback history view (past submissions)
- Integration with real backend API
- Email notifications for pending feedback
- Scheduled reminders
- Export feedback data

---

## Notes

- This plan focuses exclusively on frontend implementation
- Backend API endpoints mentioned in spec are mocked for now
- All state is local/ephemeral (no persistence beyond session)
- Real API integration will be straightforward: swap service methods to call HTTP endpoints
- Consider adding unit tests in future iterations

---

**Last Updated**: 2026-02-15
**Status**: Implementation Complete
