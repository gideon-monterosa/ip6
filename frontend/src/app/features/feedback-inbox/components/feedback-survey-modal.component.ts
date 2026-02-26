import { Component, input, output, computed, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Meeting, MeetingType, MEETING_TYPES } from '../../../shared/models/meeting.model';
import { MeetingFeedback, MoodType, IssueTag, ISSUE_TAG_LABELS, PositiveTag, POSITIVE_TAG_LABELS } from '../models/feedback.model';

@Component({
  selector: 'app-feedback-survey-modal',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './feedback-survey-modal.component.html',
  styles: `
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-fade-in {
      animation: fadeIn 0.15s ease-out;
    }
  `,
})
export class FeedbackSurveyModalComponent implements OnInit {
  meeting = input.required<Meeting>();
  submitFeedback = output<MeetingFeedback>();
  close = output<void>();

  feedbackForm!: FormGroup;

  scaleScores = [1, 2, 3, 4, 5];
  meetingTypes = MEETING_TYPES;

  moodOptions = [
    { value: MoodType.NEGATIVE, label: 'Negative', icon: '\u{1F61E}', checkedClass: '' },
    { value: MoodType.NEUTRAL, label: 'Neutral', icon: '\u{1F610}', checkedClass: '' },
    { value: MoodType.POSITIVE, label: 'Positive', icon: '\u{1F60A}', checkedClass: '' },
  ];

  issueTags = Object.entries(ISSUE_TAG_LABELS).map(([value, label]) => ({
    value: value as IssueTag,
    label,
  }));

  positiveTags = Object.entries(POSITIVE_TAG_LABELS).map(([value, label]) => ({
    value: value as PositiveTag,
    label,
  }));

  private selectedIssueTags = signal<Set<IssueTag>>(new Set());
  private selectedPositiveTags = signal<Set<PositiveTag>>(new Set());

  shouldShowIssues = signal(false);
  shouldShowPositive = signal(false);
  commentLength = signal(0);

  private fb: FormBuilder;
  private startedAt!: string;

  constructor(fb: FormBuilder) {
    this.fb = fb;
  }

  ngOnInit(): void {
    this.startedAt = new Date().toISOString();
    this.feedbackForm = this.fb.group({
      focus_disruption: [null, Validators.required],
      mood: [null, Validators.required],
      energy_after: [null, Validators.required],
      roti_score: [null, Validators.required],
      comment: [''],
    });

    this.feedbackForm.get('meeting_type_override')?.valueChanges.subscribe((val: MeetingType) => {
      // Assuming you have an event emitter for this if needed (e.g., categoryChange.emit)
    });

    // Determine which set of tags to show based on ROTI score
    this.feedbackForm.get('roti_score')?.valueChanges.subscribe(() => this.updateShowTags());

    this.feedbackForm.get('comment')?.valueChanges.subscribe((val: string) => {
      this.commentLength.set(val?.length ?? 0);
    });
  }

  private updateShowTags(): void {
    const roti = this.feedbackForm.get('roti_score')?.value;

    // Negative reasons for < 3 (1 or 2)
    this.shouldShowIssues.set(roti != null && roti <= 2);
    // Positive reasons for > 3 (4 or 5)
    this.shouldShowPositive.set(roti != null && roti >= 4);

    // Clear selections if conditionally hidden
    if (roti == null || roti > 2) this.selectedIssueTags.set(new Set());
    if (roti == null || roti < 4) this.selectedPositiveTags.set(new Set());
  }

  onIssueTagChange(tag: IssueTag, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedIssueTags.update((tags) => {
      const next = new Set(tags);
      if (checked) next.add(tag);
      else next.delete(tag);
      return next;
    });
  }

  isIssueSelected(tag: IssueTag): boolean {
    return this.selectedIssueTags().has(tag);
  }

  onPositiveTagChange(tag: PositiveTag, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedPositiveTags.update((tags) => {
      const next = new Set(tags);
      if (checked) next.add(tag);
      else next.delete(tag);
      return next;
    });
  }

  isPositiveSelected(tag: PositiveTag): boolean {
    return this.selectedPositiveTags().has(tag);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onSubmit(): void {
    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      return;
    }

    const formValue = this.feedbackForm.value;
    const feedback: MeetingFeedback = {
      meeting_id: this.meeting().id,
      focus_disruption: formValue.focus_disruption,
      roti_score: formValue.roti_score,
      mood: formValue.mood,
      energy_after: formValue.energy_after,
      issue_tags: Array.from(this.selectedIssueTags()),
      positive_tags: Array.from(this.selectedPositiveTags()),
      comment: formValue.comment || undefined,
      started_at: this.startedAt,
      submitted_at: new Date().toISOString(),
    };

    this.submitFeedback.emit(feedback);
  }
}
