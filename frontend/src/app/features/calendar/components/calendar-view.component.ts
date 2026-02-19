import { Component, inject, signal, effect } from '@angular/core';
import { CalendarService } from '../services/calendar.service';
import { CalendarHeaderComponent } from '../components/calendar-header.component';
import { CalendarGridComponent } from '../components/calendar-grid.component';
import { CalendarEventPopoverComponent } from './calendar-event-popover.component';
import { FeedbackSurveyModalComponent } from '../../feedback-inbox/components/feedback-survey-modal.component';
import { Meeting, FeedbackStatus, MeetingType } from '../../../shared/models/meeting.model';
import { MeetingFeedback} from '../../feedback-inbox/models/feedback.model';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [
    CalendarHeaderComponent,
    CalendarGridComponent,
    CalendarEventPopoverComponent,
    FeedbackSurveyModalComponent
  ],
  template: `
    <div class="flex flex-col h-[calc(100vh-80px)] max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-6">

      <app-calendar-header
        [currentDate]="currentDate()"
        (previous)="onPreviousWeek()"
        (next)="onNextWeek()"
        (today)="onToday()"
        (refresh)="onRefresh()"
      />

      <div class="relative flex-1 min-h-0">
        @if (isLoading()) {
          <div class="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-xs rounded-xl">
            <div class="animate-spin inline-block size-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"></div>
          </div>
        }

        <app-calendar-grid
          [currentDate]="currentDate()"
          [events]="events()"
          (eventClick)="onEventSelected($event)"
        />
      </div>
    </div>

    @if (selectedEvent(); as event) {
      <app-calendar-event-popover
        [event]="event"
        (close)="selectedEvent.set(null)"
        (dismiss)="onDismissEvent(event)"
        (giveFeedback)="onOpenFeedback(event)"
      />
    }

    @if (feedbackMeeting(); as meeting) {
      <app-feedback-survey-modal
        [meeting]="meeting"
        (submitFeedback)="onSubmitFeedback($event)"
        (close)="feedbackMeeting.set(null)"
      />
    }
  `
})
export class CalendarViewComponent {
  private calendarService = inject(CalendarService);

  currentDate = signal(new Date());
  events = signal<Meeting[]>([]);
  isLoading = signal(false);

  selectedEvent = signal<Meeting | null>(null);

  feedbackMeeting = signal<Meeting | null>(null);

  constructor() {
    effect(() => {
      this.loadEventsForWeek(this.currentDate());
    });
  }

  private loadEventsForWeek(date: Date): void {
    const curr = new Date(date);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // Montag

    const startOfWeek = new Date(curr);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    this.isLoading.set(true);

    this.calendarService.getEvents(startOfWeek, endOfWeek).subscribe({
      next: (data) => {
        this.events.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load events', err);
        this.isLoading.set(false);
      }
    });
  }

  onPreviousWeek(): void {
    const newDate = new Date(this.currentDate());
    newDate.setDate(newDate.getDate() - 7);
    this.currentDate.set(newDate);
  }

  onNextWeek(): void {
    const newDate = new Date(this.currentDate());
    newDate.setDate(newDate.getDate() + 7);
    this.currentDate.set(newDate);
  }

  onToday(): void {
    this.currentDate.set(new Date());
  }

  onRefresh(): void {
    this.isLoading.set(true);
    this.calendarService.sync().subscribe({
      next: () => {
        this.loadEventsForWeek(this.currentDate());
      },
      error: (err) => {
        console.error('Sync failed', err);
        this.isLoading.set(false);
      }
    });
  }

  onEventSelected(event: Meeting): void {
    this.selectedEvent.set(event);
  }

  onDismissEvent(event: Meeting): void {
    this.calendarService.dismissEvent(event.id).subscribe(() => {
      this.events.update(currentEvents =>
        currentEvents.map(e =>
          e.id === event.id ? { ...e, feedbackStatus: FeedbackStatus.DISMISSED } : e
        )
      );
      this.selectedEvent.set(null);
    });
  }

  onOpenFeedback(event: Meeting): void {
    this.selectedEvent.set(null);
    this.feedbackMeeting.set(event);
  }

  onSubmitFeedback(feedback: MeetingFeedback): void {
    console.log('Feedback submitted from calendar:', feedback);

    this.events.update(currentEvents =>
      currentEvents.map(e =>
        e.id === feedback.meeting_id ? { ...e, feedbackStatus: FeedbackStatus.SUBMITTED } : e
      )
    );

    this.feedbackMeeting.set(null);
  }
}
