import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import {
  FeedbackableMeeting,
  FeedbackStatus,
  MeetingFeedback,
  MeetingType,
  DismissReason,
} from '../models/feedback.model';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private http = inject(HttpClient);

  private pendingMeetingsSignal = signal<FeedbackableMeeting[]>([]);
  private dismissedMeetingsSignal = signal<FeedbackableMeeting[]>([]);
  private showDismissedSignal = signal(false);
  private loadingSignal = signal(false);

  /** Read-only signals */
  readonly pendingMeetings = this.pendingMeetingsSignal.asReadonly();
  readonly dismissedMeetings = this.dismissedMeetingsSignal.asReadonly();
  readonly showDismissed = this.showDismissedSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  /** Computed: number of pending items for the badge */
  readonly pendingCount = computed(() => this.pendingMeetingsSignal().length);

  /** Computed: filtered + sorted list for display */
  readonly filteredMeetings = computed(() => {
    const pending = this.pendingMeetingsSignal();
    const dismissed = this.dismissedMeetingsSignal();
    const show = this.showDismissedSignal();

    const list = show ? [...pending, ...dismissed] : [...pending];

    return list.sort(
      (a, b) =>
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
    );
  });

  /** Load pending meetings from mock data */
  loadPendingMeetings(): Observable<FeedbackableMeeting[]> {
    this.loadingSignal.set(true);
    return this.http
      .get<FeedbackableMeeting[]>('mock-data/feedback/feedbackable-meetings.json')
      .pipe(
        tap((meetings) => {
          this.pendingMeetingsSignal.set(meetings);
          this.loadingSignal.set(false);
        }),
      );
  }

  /** Load dismissed meetings from mock data */
  loadDismissedMeetings(): Observable<FeedbackableMeeting[]> {
    return this.http
      .get<FeedbackableMeeting[]>('mock-data/feedback/dismissed-meetings.json')
      .pipe(
        tap((meetings) => {
          this.dismissedMeetingsSignal.set(meetings);
        }),
      );
  }

  /** Submit feedback for a meeting */
  submitFeedback(feedback: MeetingFeedback): void {
    console.log('Feedback submitted:', feedback);
    // Remove from pending list
    this.pendingMeetingsSignal.update((meetings) =>
      meetings.filter((m) => m.meeting_id !== feedback.meeting_id),
    );
  }

  /** Dismiss a meeting */
  dismissMeeting(meetingId: string, reason?: DismissReason): FeedbackableMeeting | undefined {
    const meeting = this.pendingMeetingsSignal().find(
      (m) => m.meeting_id === meetingId,
    );
    if (!meeting) return undefined;

    const dismissed: FeedbackableMeeting = {
      ...meeting,
      feedback_status: FeedbackStatus.DISMISSED,
    };

    this.pendingMeetingsSignal.update((meetings) =>
      meetings.filter((m) => m.meeting_id !== meetingId),
    );
    this.dismissedMeetingsSignal.update((meetings) => [dismissed, ...meetings]);

    return dismissed;
  }

  /** Undo a dismiss action */
  undoDismiss(meetingId: string): void {
    const meeting = this.dismissedMeetingsSignal().find(
      (m) => m.meeting_id === meetingId,
    );
    if (!meeting) return;

    const restored: FeedbackableMeeting = {
      ...meeting,
      feedback_status: FeedbackStatus.PENDING,
    };

    this.dismissedMeetingsSignal.update((meetings) =>
      meetings.filter((m) => m.meeting_id !== meetingId),
    );
    this.pendingMeetingsSignal.update((meetings) => [restored, ...meetings]);
  }

  /** Update the meeting type for a given meeting */
  updateMeetingType(meetingId: string, meetingType: MeetingType): void {
    const updater = (meetings: FeedbackableMeeting[]) =>
      meetings.map((m) =>
        m.meeting_id === meetingId ? { ...m, meeting_type: meetingType } : m,
      );
    this.pendingMeetingsSignal.update(updater);
    this.dismissedMeetingsSignal.update(updater);
  }

  /** Toggle show dismissed */
  toggleShowDismissed(): void {
    this.showDismissedSignal.update((v) => !v);
  }

  /** Set show dismissed */
  setShowDismissed(value: boolean): void {
    this.showDismissedSignal.set(value);
  }
}
