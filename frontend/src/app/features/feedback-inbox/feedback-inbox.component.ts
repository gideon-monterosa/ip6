import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FeedbackUIService } from './services/feedback-ui.service';
import { MeetingService } from '../../shared/services/meeting.service';
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
  public feedbackService = inject(FeedbackUIService)

  selectedMeeting = signal<Meeting | null>(null);
  showUndoToast = signal(false);

  skeletonItems = [1, 2, 3, 4];

  private lastDismissedId: string | null = null;
  private undoTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.feedbackService.loadRecentMeetingsForInbox();
  }

  ngOnDestroy(): void {
    this.clearUndoTimeout();
  }

  onGiveFeedback(meetingId: string): void {
    const meetings = this.feedbackService.filteredMeetings();
    const meeting = this.feedbackService.filteredMeetings().find((m: any) => m.id === meetingId)
    if (meeting) {
      this.selectedMeeting.set(meeting);
    }
  }

  onDismissMeeting(meetingId: string): void {
    this.clearUndoTimeout();
    this.feedbackService.dismissMeeting(meetingId);
    this.lastDismissedId = meetingId;
  }

  onUndoDismiss(): void {
    if (this.lastDismissedId) {
      this.feedbackService.undoDismiss(this.lastDismissedId).subscribe();
    }
    this.clearUndoToast();
  }

  clearUndoToast(): void {
    this.showUndoToast.set(false);
    this.lastDismissedId = null;
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
      next: () => console.log('Meeting Typ erfolgreich im Backend aktualisiert!'),
      error: (err) => console.error('Fehler beim Aktualisieren:', err)
    });
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
