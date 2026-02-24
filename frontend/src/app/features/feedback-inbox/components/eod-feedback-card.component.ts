import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DailyFeedback } from '../models/feedback.model';
import { FeedbackStatus } from '../../../shared/models/meeting.model';

@Component({
  selector: 'app-eod-feedback-card',
  imports: [DatePipe],
  template: `
    <div
      class="bg-card border border-border rounded-lg shadow-2xs p-4 sm:p-5 transition hover:shadow-md"
      [class.opacity-60]="dailyFeedback().feedbackStatus === dismissed"
      role="article"
      [attr.aria-label]="'End of Day feedback for ' + dailyFeedback().date"
    >
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <div class="flex items-center justify-center size-8 rounded-full bg-amber-50 border border-amber-200 shrink-0">
              <svg class="size-4 text-amber-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
              </svg>
            </div>
            <h3 class="text-base font-semibold text-foreground">
              End of Day &mdash; {{ parseDate(dailyFeedback().date) | date:'MMMM d, y' }}
            </h3>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              Daily
            </span>
          </div>
          <p class="text-sm text-muted-foreground-1">Reflect on your workday</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 shrink-0">
          @if (dailyFeedback().feedbackStatus !== dismissed) {
            <button
              type="button"
              class="py-2 px-3 inline-flex items-center gap-x-1.5 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition"
              (click)="giveFeedback.emit(dailyFeedback().date)"
              aria-label="Give end of day feedback"
            >
              <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Give Feedback
            </button>
            <button
              type="button"
              class="py-2 px-2.5 inline-flex items-center gap-x-1 text-sm font-medium rounded-lg bg-layer border border-layer-line text-layer-foreground shadow-2xs hover:bg-layer-hover focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 transition"
              (click)="dismissFeedback.emit(dailyFeedback().date)"
              aria-label="Dismiss end of day feedback"
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
export class EodFeedbackCardComponent {
  dailyFeedback = input.required<DailyFeedback>();
  giveFeedback = output<string>();
  dismissFeedback = output<string>();

  dismissed = FeedbackStatus.DISMISSED;

  parseDate(dateStr: string): Date {
    return new Date(dateStr + 'T00:00:00');
  }
}
