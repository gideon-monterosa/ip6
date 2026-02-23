import { Component, inject, signal, OnInit } from '@angular/core';
import { CalendarUIService } from '../services/calendar-ui.service';
import { UserService } from '../../../core/services/user.service';
import { CalendarHeaderComponent } from '../components/calendar-header.component';
import { CalendarGridComponent } from '../components/calendar-grid.component';
import { CalendarEventPopoverComponent } from './calendar-event-popover.component';
import { FeedbackSurveyModalComponent } from '../../feedback-inbox/components/feedback-survey-modal.component';
import { Meeting, FeedbackStatus, MeetingType } from '../../../shared/models/meeting.model';
import { MeetingFeedback} from '../../feedback-inbox/models/feedback.model';
import { MeetingService } from '../../../shared/services/meeting.service';
import { UserSettings } from '../../../core/models/user.model';

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
          [settings]="userSettings()"
          (eventClick)="onEventSelected($event)">
        </app-calendar-grid>
      </div>
    </div>

    @if (selectedEvent(); as event) {
      <app-calendar-event-popover
        [event]="event"
        (close)="selectedEvent.set(null)"
        (dismiss)="onDismissEvent(event)"
        (giveFeedback)="onOpenFeedback(event)"
        (categoryChange)="onCategoryChange($event)"
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
export class CalendarViewComponent implements OnInit {
  private calendarService = inject(CalendarUIService);
  private meetingService = inject(MeetingService);
  private userService = inject(UserService);

  currentDate = this.calendarService.currentDate;
  events = this.calendarService.events;
  isLoading = this.calendarService.isLoading;

  selectedEvent = signal<Meeting | null>(null);
  feedbackMeeting = signal<Meeting | null>(null);

  userSettings = signal<UserSettings | undefined>(undefined);

  ngOnInit(): void {
    this.calendarService.loadEventsForCurrentWeek();

    this.userService.getSettings().subscribe({
      next: (settings: UserSettings) => this.userSettings.set(settings),
      error: (err: any) => console.error('Fehler beim Laden der Einstellungen', err)
    });
  }

  onPreviousWeek(): void {
    const newDate = new Date(this.currentDate());
    newDate.setDate(newDate.getDate() - 7);
    this.calendarService.changeDate(newDate);
  }

  onNextWeek(): void {
    const newDate = new Date(this.currentDate());
    newDate.setDate(newDate.getDate() + 7);
    this.calendarService.changeDate(newDate);
  }

  onToday(): void {
    this.calendarService.changeDate(new Date());
  }

  onRefresh(): void {
    this.calendarService.triggerSync();
  }

  onEventSelected(event: Meeting): void {
    this.selectedEvent.set(event);
  }

  onDismissEvent(event: Meeting): void {
    this.meetingService.dismissFeedback(event.id).subscribe({
      next: () => console.log('Event dismissed'),
      error: (err: Error) => console.error(err)
    });
  }

  onOpenFeedback(event: Meeting): void {
    this.selectedEvent.set(null);
    this.feedbackMeeting.set(event);
  }

  onSubmitFeedback(feedback: MeetingFeedback): void {
    this.meetingService.submitFeedback(feedback.meeting_id, feedback).subscribe({
      next: () => {
        this.feedbackMeeting.set(null);
      },
      error: (err: any) => {
        console.error('Speichern fehlgeschlagen', err);
      }
    });
  }

  onCategoryChange(event: { meetingId: string; meetingType: MeetingType }): void {
    this.meetingService.updateMeetingCategory(event.meetingId, event.meetingType).subscribe({
      next: () => {
        console.log('Meeting Typ erfolgreich im Backend aktualisiert!');

        const currentEvent = this.selectedEvent();
        if (currentEvent && currentEvent.id === event.meetingId) {
          this.selectedEvent.set({ ...currentEvent, meetingType: event.meetingType });
        }
      },
      error: (err: any) => console.error('Fehler beim Aktualisieren:', err)
    });
  }
}
