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

- [ ] Define `FeedbackStatus` enum (`PENDING`, `SUBMITTED`, `DISMISSED`)
- [ ] Define `DismissReason` enum (optional reasons)
- [ ] Define `MoodType` enum (`NEGATIVE`, `NEUTRAL`, `POSITIVE`)
- [ ] Define `IssueTag` enum (all issue options from spec)
- [ ] Define `FeedbackableMeeting` interface
  - Properties: `meeting_id`, `title`, `start_time`, `end_time`, `duration_minutes`, `meeting_type`, `feedback_status`
- [ ] Define `FeedbackRecord` interface
  - Properties: `meeting_id`, `user_id`, `status`, `created_at`, `submitted_at`, `dismissed_at`, `dismiss_reason`
- [ ] Define `MeetingFeedback` interface (survey response)
  - Properties: `meeting_id`, `roti_score`, `mood`, `energy_after`, `could_be_async`, `issue_tags`, `comment`
- [ ] Define response interfaces for API calls

---

### Phase 2: Mock Data Creation
**Location:** `frontend/public/mock-data/feedback/`

- [ ] Create `feedbackable-meetings.json`
  - Generate 5-10 completed meetings with `PENDING` status
  - Include variety of meeting types (Stand-up, Planning, 1:1, etc.)
  - Use past dates (ended meetings)
  - Mix of different durations and participant counts
- [ ] Create `submitted-feedback.json` (for reference/future use)
  - Sample submitted feedback records
- [ ] Create `dismissed-meetings.json`
  - Sample dismissed meetings for "Show dismissed" toggle

---

### Phase 3: Feedback Service
**Location:** `frontend/src/app/features/feedback-inbox/services/feedback.service.ts`

- [ ] Create `FeedbackService` with `@Injectable({ providedIn: 'root' })`
- [ ] Add `HttpClient` injection
- [ ] Implement `getPendingMeetings()` method
  - Returns `Observable<FeedbackableMeeting[]>`
  - Fetches from `mock-data/feedback/feedbackable-meetings.json`
- [ ] Implement `getDismissedMeetings()` method
  - Returns `Observable<FeedbackableMeeting[]>`
  - Fetches from `mock-data/feedback/dismissed-meetings.json`
- [ ] Add signal for `pendingCount` (computed from pending meetings)
- [ ] Implement `submitFeedback(meetingId: string, feedback: MeetingFeedback)` method
  - Returns `Observable<void>`
  - For now, just logs to console and resolves
- [ ] Implement `dismissMeeting(meetingId: string, reason?: DismissReason)` method
  - Returns `Observable<void>`
  - Updates local state
- [ ] Implement `undoDismiss(meetingId: string)` method
  - Returns `Observable<void>`
  - Reverts dismiss action
- [ ] Add signals for reactive state management
  - `pendingMeetings` signal
  - `dismissedMeetings` signal
  - `showDismissed` signal
  - `filteredMeetings` computed signal

---

### Phase 4: Feedback Card Component
**Location:** `frontend/src/app/features/feedback-inbox/components/feedback-card.component.ts`

- [ ] Create standalone component with `@Component` decorator
- [ ] Add input signal for `meeting: FeedbackableMeeting`
- [ ] Add output events:
  - `giveFeedback` - emits meeting_id
  - `dismissMeeting` - emits meeting_id
- [ ] Implement template with Tailwind + Preline styles
  - Card layout with border and shadow
  - Display meeting title (bold, prominent)
  - Display date & time (formatted: "Dec 16, 2024 • 9:00 AM - 10:00 AM")
  - Display duration (e.g., "60 min")
  - Display meeting type as colored chip/badge
  - Action buttons:
    - Primary button: "Give Feedback" (bg-primary)
    - Secondary button: "Dismiss" (bg-secondary with icon)
- [ ] Add date formatting using Angular DatePipe
- [ ] Add meeting type badge color mapping
  - Stand-up: blue
  - Planning: purple
  - Retrospective: green
  - 1:1: yellow
  - Ad-hoc: orange
  - Other: gray

---

### Phase 5: Feedback Survey Modal Component
**Location:** `frontend/src/app/features/feedback-inbox/components/feedback-survey-modal.component.ts`

- [ ] Create standalone component
- [ ] Add input signal for `meeting: FeedbackableMeeting | null`
- [ ] Add output events:
  - `submitFeedback` - emits `MeetingFeedback`
  - `close` - emits when modal closes
- [ ] Implement reactive form with FormBuilder
  - `roti_score` (required, 1-5)
  - `mood` (required, enum)
  - `energy_after` (required, 1-5)
  - `could_be_async` (boolean, default false)
  - `issue_tags` (array, conditional)
  - `comment` (string, optional)
- [ ] Add computed signal `shouldShowIssues`
  - Show when `roti_score <= 2` OR `mood === 'NEGATIVE'` OR `energy_after <= 2`
- [ ] Implement modal template using Preline overlay
  - Modal header with meeting title & time
  - Form sections:
    - Q1: ROTI Score (5-point Likert scale with radio buttons)
    - Q2: Mood (3 options with icons/emojis)
    - Q3: Energy (5-point Likert scale)
    - Q4: Async toggle (switch/checkbox)
    - Q5: Issues (conditional, multi-select checkboxes)
    - Q6: Comment (conditional, textarea)
  - Modal footer with Cancel & Submit buttons
- [ ] Add form validation
- [ ] Handle submit action
- [ ] Handle cancel/close action
- [ ] Add modal backdrop and ESC key handling

---

### Phase 6: Main Inbox Component
**Location:** `frontend/src/app/features/feedback-inbox/feedback-inbox.component.ts`

- [ ] Create main component as standalone
- [ ] Inject `FeedbackService`
- [ ] Add signals for:
  - `isLoading` (loading state)
  - `selectedMeeting` (for modal)
  - `showDismissed` (toggle state)
  - `showUndoToast` (undo notification)
  - `lastDismissedId` (for undo functionality)
- [ ] Implement `ngOnInit()` lifecycle hook
  - Load pending meetings
  - Subscribe to service signals
- [ ] Implement `onGiveFeedback(meetingId: string)` method
  - Find meeting by ID
  - Set `selectedMeeting` to open modal
- [ ] Implement `onDismissMeeting(meetingId: string)` method
  - Call service dismiss method
  - Show undo toast
  - Set timeout for undo (10 seconds)
- [ ] Implement `onUndoDismiss()` method
  - Call service undo method
  - Hide toast
  - Clear timeout
- [ ] Implement `onSubmitFeedback(feedback: MeetingFeedback)` method
  - Call service submit method
  - Close modal
  - Show success message (optional)
- [ ] Implement `onCloseModal()` method
  - Clear `selectedMeeting`
- [ ] Implement `toggleShowDismissed()` method
  - Toggle visibility of dismissed items

---

### Phase 7: Main Inbox Template
**Location:** `frontend/src/app/features/feedback-inbox/feedback-inbox.component.html`

- [ ] Create page container with consistent padding
- [ ] Add page header
  - Title: "Feedback Inbox"
  - Subtitle: "Provide feedback on your recent meetings"
  - Badge showing pending count
- [ ] Add controls section
  - Toggle switch: "Show dismissed" (right-aligned)
  - Sort indicator: "Most recent first"
- [ ] Add meetings list section
  - Use `@for` to iterate over filtered meetings
  - Display `app-feedback-card` for each meeting
  - Handle empty state: "No pending feedback"
  - Handle loading state: Skeleton loaders
- [ ] Add survey modal
  - Use `@if` to conditionally render based on `selectedMeeting`
  - Pass meeting data to modal
  - Bind event handlers
- [ ] Add undo toast notification
  - Position: bottom-right
  - Show when `showUndoToast` is true
  - Auto-dismiss after 10 seconds
  - Include "Undo" button
  - Use Preline toast styles

---

### Phase 8: Routing & Navigation
**Location:** `frontend/src/app/app.routes.ts`

- [ ] Add new route for feedback inbox
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

- [ ] Add "Feedback" navigation link
- [ ] Add badge with pending count
  - Inject `FeedbackService` in navbar component
  - Display count from service signal
  - Only show badge if count > 0
  - Style: small circular badge with primary background
- [ ] Position after "Dashboard" link, before "Settings"
- [ ] Use same routing and active state patterns

**Location:** `frontend/src/app/layout/navbar/navbar.component.ts`

- [ ] Inject `FeedbackService`
- [ ] Expose `pendingCount` signal from service
- [ ] Load pending count on init (if not lazy-loaded)

---

### Phase 10: Styling & UI Polish
**Locations:** Various component files

- [ ] Ensure consistent spacing using Tailwind utilities
- [ ] Apply Preline design tokens for colors
- [ ] Add hover states for interactive elements
- [ ] Add focus states for accessibility
- [ ] Implement responsive design (mobile-first)
  - Stack cards vertically on mobile
  - Adjust modal sizing for mobile
  - Make form inputs touch-friendly
- [ ] Add transitions for smooth interactions
  - Modal fade-in/fade-out
  - Card hover effects
  - Toast slide-in
- [ ] Add loading skeletons for better UX
- [ ] Ensure proper color contrast for accessibility

---

### Phase 11: Form UX Enhancements

- [ ] Add Likert scale visualization
  - Radio buttons styled as clickable scale
  - Visual labels (1 = "Strongly disagree", 5 = "Strongly agree")
  - Hover effects on scale items
- [ ] Add mood selector with emojis/icons
  - Negative: 😞 or red icon
  - Neutral: 😐 or gray icon
  - Positive: 😊 or green icon
- [ ] Style energy scale similarly to ROTI
  - 1 = "Drained", 5 = "Energized"
- [ ] Add checkbox group styling for issues
  - Grid layout (2 columns on desktop, 1 on mobile)
  - Clear visual states (checked/unchecked)
- [ ] Add character count for comment field
  - Optional max length (e.g., 500 chars)
  - Display remaining characters
- [ ] Add form validation error messages
  - Display below each field
  - Use destructive color for errors

---

### Phase 12: Toast Notification System
**Location:** May need shared component or use existing toast solution

- [ ] Create reusable toast component (if not exists)
  - Support different types (success, info, warning)
  - Auto-dismiss functionality
  - Manual dismiss button
  - Action button support (for "Undo")
- [ ] Implement toast positioning
  - Bottom-right corner
  - Stack multiple toasts vertically
  - Z-index to appear above other content
- [ ] Add animations
  - Slide-in from bottom
  - Fade-out on dismiss

---

### Phase 13: Empty States & Error Handling

- [ ] Design empty state for no pending feedback
  - Friendly icon (e.g., inbox with checkmark)
  - Message: "You're all caught up!"
  - Subtext: "No meetings need your feedback right now"
- [ ] Design empty state for no dismissed meetings
  - Icon and message when "Show dismissed" is on but none exist
- [ ] Add error handling for failed API calls
  - Display error toast
  - Retry mechanism (optional)
- [ ] Add loading states
  - Skeleton cards while loading
  - Disable buttons during submission

---

### Phase 14: Accessibility (A11y)

- [ ] Add proper ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works
  - Tab through form fields
  - Enter to submit
  - Escape to close modal
- [ ] Add screen reader announcements
  - Modal open/close
  - Form submission success
  - Dismiss/undo actions
- [ ] Ensure proper heading hierarchy
- [ ] Add focus trap in modal
- [ ] Test with screen reader
- [ ] Ensure color contrast meets WCAG AA standards

---

### Phase 15: Testing & Refinement

- [ ] Manual testing
  - Test all user flows
  - Test responsive behavior
  - Test form validation
  - Test undo functionality (timing)
  - Test show/hide dismissed toggle
- [ ] Cross-browser testing (if applicable)
- [ ] Performance check
  - Ensure no memory leaks
  - Optimize re-renders with signals
- [ ] Code review
  - Follow Angular best practices
  - Use standalone components
  - Use signals for reactive state
  - Proper TypeScript types
- [ ] Documentation
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
- [ ] `feedback.model.ts` - All TypeScript interfaces and enums
- [ ] `feedback.service.ts` - Service with mock data calls
- [ ] `feedback-card.component.ts` - Meeting card component
- [ ] `feedback-survey-modal.component.ts` - Modal with form
- [ ] `feedback-survey-modal.component.html` - Modal template
- [ ] `feedback-inbox.component.ts` - Main page component
- [ ] `feedback-inbox.component.html` - Main page template
- [ ] `feedback-inbox.component.css` - Custom styles (if needed)
- [ ] `feedbackable-meetings.json` - Mock pending meetings
- [ ] `dismissed-meetings.json` - Mock dismissed meetings
- [ ] `submitted-feedback.json` - Mock submitted feedback (optional)

### Files to Modify
- [ ] `app.routes.ts` - Add feedback route
- [ ] `navbar.component.ts` - Add feedback service injection
- [ ] `navbar.component.html` - Add feedback link with badge

---



## Success Criteria

- [ ] User can view list of pending meetings requiring feedback
- [ ] User can open survey modal for any meeting
- [ ] User can complete and submit survey (all validation passes)
- [ ] User can dismiss meetings they don't want to provide feedback on
- [ ] User can undo dismiss within 10 seconds
- [ ] User can toggle visibility of dismissed meetings
- [ ] Badge count updates correctly in navbar
- [ ] UI is responsive and works on mobile devices
- [ ] All interactions are keyboard accessible
- [ ] Modal properly traps focus and closes on ESC
- [ ] Empty states display correctly
- [ ] Loading states are smooth
- [ ] Code follows Angular 20+ best practices

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

**Last Updated**: 2025-01-XX
**Status**: Ready for Implementation