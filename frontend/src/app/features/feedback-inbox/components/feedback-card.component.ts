import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Meeting, FeedbackStatus, MeetingType } from '../../../shared/models/meeting.model';

@Component({
  selector: 'app-feedback-card',
  imports: [DatePipe],
  template: `
    <div
      class="bg-card border border-border rounded-lg shadow-2xs p-4 sm:p-5 transition hover:shadow-md"
      [class.opacity-60]="meeting().feedbackStatus === dismissed"
      role="article"
      [attr.aria-label]="'Meeting: ' + meeting().title"
    >
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <!-- Meeting info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <h3 class="text-base font-semibold text-foreground truncate">
              {{ meeting().title }}
            </h3>
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
              [class]="getBadgeClasses(meeting().meetingType)"
            >
              {{ meeting().meetingType }}
            </span>
          </div>
          <div class="flex items-center gap-3 text-sm text-muted-foreground-1 flex-wrap">
            <span class="inline-flex items-center gap-1">
              <svg class="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              {{ meeting().start | date:'dd.MM.yyyy' }}
            </span>
            <span class="inline-flex items-center gap-1">
              <svg class="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ meeting().start | date:'HH:mm' }} - {{ meeting().end | date:'HH:mm' }}
            </span>
            <span class="inline-flex items-center gap-1 font-medium">
              {{ meeting().durationMinutes }} min
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 shrink-0">
          @if (meeting().feedbackStatus !== dismissed) {
            <button
              type="button"
              class="py-2 px-3 inline-flex items-center gap-x-1.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 transition"
              (click)="giveFeedback.emit(meeting().id)"
              aria-label="Give feedback for this meeting"
            >
              <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Give Feedback
            </button>
            <button
              type="button"
              class="py-2 px-2.5 inline-flex items-center gap-x-1 text-sm font-medium rounded-lg bg-layer border border-layer-line text-layer-foreground shadow-2xs hover:bg-layer-hover focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 transition"
              (click)="dismissMeeting.emit(meeting().id)"
              aria-label="Dismiss feedback for this meeting"
              title="Dismiss"
            >
              <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              <span class="hidden sm:inline">Dismiss</span>
            </button>
          } @else {
            <span class="text-sm text-muted-foreground-1 italic">Dismissed</span>
          }
        </div>
      </div>
    </div>
  `,
})
export class FeedbackCardComponent {
  meeting = input.required<Meeting>();
  giveFeedback = output<string>();
  dismissMeeting = output<string>();

  dismissed = FeedbackStatus.DISMISSED;

  getBadgeClasses(type: MeetingType): string {
    const base = 'border';
    switch (type) {
      case 'Stand-up':
        return `${base} bg-blue-50 text-blue-700 border-blue-200`;
      case 'Planning':
        return `${base} bg-purple-50 text-purple-700 border-purple-200`;
      case 'Retrospective':
        return `${base} bg-green-50 text-green-700 border-green-200`;
      case '1:1':
        return `${base} bg-yellow-50 text-yellow-700 border-yellow-200`;
      case 'Ad-hoc':
        return `${base} bg-orange-50 text-orange-700 border-orange-200`;
      default:
        return `${base} bg-gray-50 text-gray-700 border-gray-200`;
    }
  }
}
