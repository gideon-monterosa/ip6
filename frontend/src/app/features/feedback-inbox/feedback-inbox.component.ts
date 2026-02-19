import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FeedbackService } from './services/feedback.service';
import { FeedbackCardComponent } from './components/feedback-card.component';
import { FeedbackSurveyModalComponent } from './components/feedback-survey-modal.component';
import { Meeting, MeetingType } from '../../shared/models/meeting.model';
import { MeetingFeedback } from './models/feedback.model';

@Component({
  selector: 'app-feedback-inbox',
  imports: [FeedbackCardComponent, FeedbackSurveyModalComponent],
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
  feedbackService = inject(FeedbackService);

  selectedMeeting = signal<Meeting | null>(null);
  showUndoToast = signal(false);

  skeletonItems = [1, 2, 3, 4];

  private lastDismissedId: string | null = null;
  private undoTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.feedbackService.loadPendingMeetings().subscribe();
    this.feedbackService.loadDismissedMeetings().subscribe();
  }

  ngOnDestroy(): void {
    this.clearUndoTimeout();
  }

  onGiveFeedback(meetingId: string): void {
    const meetings = this.feedbackService.filteredMeetings();
    const meeting = meetings.find((m) => m.id === meetingId);
    if (meeting) {
      this.selectedMeeting.set(meeting);
    }
  }

  onDismissMeeting(meetingId: string): void {
    this.clearUndoTimeout();
    const dismissed = this.feedbackService.dismissMeeting(meetingId);
    if (dismissed) {
      this.lastDismissedId = meetingId;
      this.showUndoToast.set(true);
      this.undoTimeout = setTimeout(() => {
        this.showUndoToast.set(false);
        this.lastDismissedId = null;
      }, 10000);
    }
  }

  onUndoDismiss(): void {
    if (this.lastDismissedId) {
      this.feedbackService.undoDismiss(this.lastDismissedId);
    }
    this.clearUndoToast();
  }

  clearUndoToast(): void {
    this.showUndoToast.set(false);
    this.lastDismissedId = null;
    this.clearUndoTimeout();
  }

  onSubmitFeedback(feedback: MeetingFeedback): void {
    this.feedbackService.submitFeedback(feedback);
    this.selectedMeeting.set(null);
  }

  onCategoryChange(event: { meetingId: string; meetingType: MeetingType }): void {
    this.feedbackService.updateMeetingType(event.meetingId, event.meetingType);
  }

  onCloseModal(): void {
    this.selectedMeeting.set(null);
  }

  private clearUndoTimeout(): void {
    if (this.undoTimeout) {
      clearTimeout(this.undoTimeout);
      this.undoTimeout = null;
    }
  }
}
