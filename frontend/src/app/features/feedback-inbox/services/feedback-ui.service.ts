import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { MeetingService } from '../../../shared/services/meeting.service';
import { FeedbackStatus } from '../../../shared/models/meeting.model';
import { MeetingFeedback } from '../models/feedback.model';

@Injectable({
  providedIn: 'root'
})
export class FeedbackUIService {
  private meetingService = inject(MeetingService);

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

  toggleShowDismissed(): void {
    this.showDismissedSignal.update(v => !v);
  }

  loadRecentMeetingsForInbox(): void {
    const start = new Date();
    start.setDate(start.getDate() - 14);
    const end = new Date();
    end.setDate(end.getDate() + 7);

    this.meetingService.loadMeetingsForDateRange(start, end).subscribe();
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
}
