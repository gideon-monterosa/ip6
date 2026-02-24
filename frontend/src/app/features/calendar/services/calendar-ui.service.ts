import { Injectable, inject, signal } from '@angular/core';
import { MeetingService } from '../../../shared/services/meeting.service';
import { DailyFeedbackService } from '../../../shared/services/daily-feedback.service';
import { CalendarIntegrationService } from '../../../shared/services/calendar-integration.service';
import { Meeting } from '../../../shared/models/meeting.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarUIService {
  private meetingService = inject(MeetingService);
  private dailyFeedbackService = inject(DailyFeedbackService);
  private integrationService = inject(CalendarIntegrationService);

  private currentDateSignal = signal<Date>(new Date());
  public readonly currentDate = this.currentDateSignal.asReadonly();

  private selectedEventSignal = signal<Meeting | null>(null);
  public readonly selectedEvent = this.selectedEventSignal.asReadonly();

  private feedbackMeetingSignal = signal<Meeting | null>(null);
  public readonly feedbackMeeting = this.feedbackMeetingSignal.asReadonly();

  public readonly isLoading = this.meetingService.isLoading;
  public readonly events = this.meetingService.meetings;
  public readonly dailyFeedbacks = this.dailyFeedbackService.dailyFeedbacks;

  setSelectedEvent(event: Meeting | null): void {
    this.selectedEventSignal.set(event);
  }

  setFeedbackMeeting(meeting: Meeting | null): void {
    this.feedbackMeetingSignal.set(meeting);
  }

  changeDate(newDate: Date): void {
    this.currentDateSignal.set(newDate);
    this.loadEventsForCurrentWeek();
  }

  loadEventsForCurrentWeek(): void {
    const curr = this.currentDateSignal();
    const diff = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1);

    const startOfWeek = new Date(curr);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    this.meetingService.loadMeetingsForDateRange(startOfWeek, endOfWeek).subscribe();

    const startStr = startOfWeek.toISOString().split('T')[0];
    const endStr = endOfWeek.toISOString().split('T')[0];
    this.dailyFeedbackService.loadForDateRange(startStr, endStr).subscribe();
  }

  triggerSync(): void {
    this.integrationService.sync().subscribe({
      next: () => this.loadEventsForCurrentWeek(),
      error: (err) => {
        console.error('Sync fehlgeschlagen', err);
        if (err.error?.error?.includes('KALENDER_GETRENNT') || err.message?.includes('invalid_grant')) {
          alert('Your calendar connection has timed out. Please reconnect via settings');
        } else {
          alert('There was a problem while syncing your calendar.');
        }
      }
    });
  }
}
