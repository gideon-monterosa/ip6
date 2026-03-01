import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { MeetingService } from '../../../shared/services/meeting.service';
import { DailyFeedbackService } from '../../../shared/services/daily-feedback.service';
import { FeedbackStatus } from '../../../shared/models/meeting.model';
import { MeetingFeedback, DailyFeedback, DailyFeedbackDetails } from '../models/feedback.model';

@Injectable({
  providedIn: 'root'
})
export class FeedbackUIService {
  private meetingService = inject(MeetingService);
  private dailyFeedbackService = inject(DailyFeedbackService);

  private showDismissedSignal = signal(false);
  public readonly showDismissed = this.showDismissedSignal.asReadonly();

  public readonly isLoading = this.meetingService.isLoading;

  public readonly pendingMeetings = computed(() =>
    this.meetingService.meetings().filter(m => m.feedbackStatus === FeedbackStatus.PENDING)
  );

  public readonly dismissedMeetings = computed(() =>
    this.meetingService.meetings().filter(m => m.feedbackStatus === FeedbackStatus.DISMISSED)
  );

  public readonly pendingCount = computed(() => this.pendingMeetings().length);

  public readonly filteredMeetings = computed(() => {
    const pending = this.pendingMeetings();
    const dismissed = this.dismissedMeetings();
    const list = this.showDismissedSignal() ? [...pending, ...dismissed] : [...pending];

    return list.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
  });

  // Daily feedback computed signals for the inbox view (filtered by current meetings list if needed)
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

  // This one is used by the Navbar and should be globally consistent
  public readonly totalPendingCount = computed(() =>
    this.meetingService.pendingMeetings().length + this.dailyFeedbackService.pendingDailyFeedbacks().length
  );

  toggleShowDismissed(): void {
    this.showDismissedSignal.update(v => !v);
  }

  loadRecentMeetingsForInbox(): void {
    const start = new Date();
    start.setDate(start.getDate() - 14);
    const end = new Date();
    end.setDate(end.getDate() + 7);

    this.meetingService.loadMeetingsForDateRange(start, end).subscribe();
    this.meetingService.loadPendingMeetings().subscribe();
    this.dailyFeedbackService.loadPending().subscribe();
  }

  submitFeedback(meetingId: string, feedbackData: MeetingFeedback): Observable<void> {
    return this.meetingService.submitFeedback(meetingId, feedbackData);
  }

  dismissMeeting(meetingId: string): Observable<void> {
    return this.meetingService.dismissFeedback(meetingId);
  }

  undoDismiss(meetingId: string): Observable<void> {
    return this.meetingService.undoDismiss(meetingId);
  }

  updateMeetingType(meetingId: string, meetingType: any): Observable<any> {
    return this.meetingService.updateMeetingCategory(meetingId, meetingType);
  }

  submitDailyFeedback(date: string, details: DailyFeedbackDetails): Observable<void> {
    return this.dailyFeedbackService.submitFeedback(date, details);
  }

  dismissDailyFeedback(date: string): Observable<void> {
    return this.dailyFeedbackService.dismissFeedback(date);
  }

  undoDismissDaily(date: string): Observable<void> {
    return this.dailyFeedbackService.undoDismiss(date);
  }
}
