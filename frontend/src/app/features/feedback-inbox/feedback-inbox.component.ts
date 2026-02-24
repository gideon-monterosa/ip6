import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FeedbackUIService } from './services/feedback-ui.service';
import { MeetingService } from '../../shared/services/meeting.service';
import { FeedbackCardComponent } from './components/feedback-card.component';
import { FeedbackSurveyModalComponent } from './components/feedback-survey-modal.component';
import { EodFeedbackCardComponent } from './components/eod-feedback-card.component';
import { EodSurveyModalComponent } from './components/eod-survey-modal.component';
import { Meeting, MeetingType } from '../../shared/models/meeting.model';
import { MeetingFeedback, DailyFeedbackSubmission } from './models/feedback.model';

@Component({
  selector: 'app-feedback-inbox',
  imports: [
    FeedbackCardComponent,
    FeedbackSurveyModalComponent,
    EodFeedbackCardComponent,
    EodSurveyModalComponent,
  ],
  templateUrl: './feedback-inbox.component.html',
  styles: `
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(1rem); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-in {
      animation: slideIn 0.2s ease-out;
    }
  `,
})
export class FeedbackInboxComponent implements OnInit, OnDestroy {
  public feedbackService = inject(FeedbackUIService);

  selectedMeeting = signal<Meeting | null>(null);
  selectedEodDate = signal<string | null>(null);
  showUndoToast = signal(false);

  skeletonItems = [1, 2, 3, 4];

  private lastDismissedId: string | null = null;
  private lastDismissedEodDate: string | null = null;
  private undoTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.feedbackService.loadRecentMeetingsForInbox();
  }

  ngOnDestroy(): void {
    this.clearUndoTimeout();
  }

  onGiveFeedback(meetingId: string): void {
    const meeting = this.feedbackService.filteredMeetings().find((m: any) => m.id === meetingId);
    if (meeting) {
      this.selectedMeeting.set(meeting);
    }
  }

  onDismissMeeting(meetingId: string): void {
    this.clearUndoTimeout();
    this.feedbackService.dismissMeeting(meetingId).subscribe();
    this.lastDismissedId = meetingId;
    this.lastDismissedEodDate = null;
    this.showUndoToast.set(true);
    this.undoTimeout = setTimeout(() => this.clearUndoToast(), 5000);
  }

  onUndoDismiss(): void {
    if (this.lastDismissedId) {
      this.feedbackService.undoDismiss(this.lastDismissedId).subscribe();
    } else if (this.lastDismissedEodDate) {
      this.feedbackService.undoDismissDaily(this.lastDismissedEodDate).subscribe();
    }
    this.clearUndoToast();
  }

  clearUndoToast(): void {
    this.showUndoToast.set(false);
    this.lastDismissedId = null;
    this.lastDismissedEodDate = null;
    this.clearUndoTimeout();
  }

  onSubmitFeedback(feedback: MeetingFeedback): void {
    if (!feedback.meeting_id) return;
    this.feedbackService.submitFeedback(feedback.meeting_id, feedback).subscribe({
      next: () => this.selectedMeeting.set(null)
    });
    this.selectedMeeting.set(null);
  }

  onCategoryChange(event: { meetingId: string; meetingType: MeetingType }): void {
    this.feedbackService.updateMeetingType(event.meetingId, event.meetingType).subscribe({
      next: () => console.log('Meeting type updated successfully'),
      error: (err: any) => console.error('Error updating meeting type:', err)
    });
  }

  onCloseModal(): void {
    this.selectedMeeting.set(null);
  }

  // EoD actions
  onGiveEodFeedback(date: string): void {
    this.selectedEodDate.set(date);
  }

  onDismissEodFeedback(date: string): void {
    this.clearUndoTimeout();
    this.feedbackService.dismissDailyFeedback(date).subscribe();
    this.lastDismissedEodDate = date;
    this.lastDismissedId = null;
    this.showUndoToast.set(true);
    this.undoTimeout = setTimeout(() => this.clearUndoToast(), 5000);
  }

  onSubmitEodFeedback(submission: DailyFeedbackSubmission): void {
    this.feedbackService.submitDailyFeedback(submission.date, submission.details).subscribe({
      next: () => this.selectedEodDate.set(null)
    });
  }

  private clearUndoTimeout(): void {
    if (this.undoTimeout) {
      clearTimeout(this.undoTimeout);
      this.undoTimeout = null;
    }
  }
}
