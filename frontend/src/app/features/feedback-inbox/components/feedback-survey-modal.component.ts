import { Component, input, output, computed, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  FeedbackableMeeting,
  MeetingFeedback,
  MeetingType,
  MoodType,
  IssueTag,
  ISSUE_TAG_LABELS,
  MEETING_TYPES,
} from '../models/feedback.model';

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
  meeting = input.required<FeedbackableMeeting>();
  submitFeedback = output<MeetingFeedback>();
  categoryChange = output<{ meetingId: string; meetingType: MeetingType }>();
  close = output<void>();

  feedbackForm!: FormGroup;

  rotiScores = [1, 2, 3, 4, 5];
  energyScores = [1, 2, 3, 4, 5];
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

  private selectedIssueTags = signal<Set<IssueTag>>(new Set());

  /** Computed signal to determine if issues section should be shown */
  shouldShowIssues = signal(false);

  commentLength = signal(0);

  private fb: FormBuilder;

  constructor(fb: FormBuilder) {
    this.fb = fb;
  }

  ngOnInit(): void {
    this.feedbackForm = this.fb.group({
      meeting_type_override: [this.meeting().meeting_type],
      roti_score: [null, Validators.required],
      mood: [null, Validators.required],
      energy_after: [null, Validators.required],
      comment: [''],
    });

    // Emit category change when user selects a different type
    this.feedbackForm.get('meeting_type_override')?.valueChanges.subscribe((val: MeetingType) => {
      this.categoryChange.emit({
        meetingId: this.meeting().meeting_id,
        meetingType: val,
      });
    });

    // Watch for changes that trigger issue display
    this.feedbackForm.get('roti_score')?.valueChanges.subscribe(() => this.updateShowIssues());
    this.feedbackForm.get('mood')?.valueChanges.subscribe(() => this.updateShowIssues());
    this.feedbackForm.get('energy_after')?.valueChanges.subscribe(() => this.updateShowIssues());
    this.feedbackForm.get('comment')?.valueChanges.subscribe((val: string) => {
      this.commentLength.set(val?.length ?? 0);
    });
  }

  private updateShowIssues(): void {
    const roti = this.feedbackForm.get('roti_score')?.value;
    const mood = this.feedbackForm.get('mood')?.value;
    const energy = this.feedbackForm.get('energy_after')?.value;

    this.shouldShowIssues.set(
      (roti != null && roti <= 2) ||
      mood === MoodType.NEGATIVE ||
      (energy != null && energy <= 2),
    );
  }

  onIssueTagChange(tag: IssueTag, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedIssueTags.update((tags) => {
      const next = new Set(tags);
      if (checked) {
        next.add(tag);
      } else {
        next.delete(tag);
      }
      return next;
    });
  }

  isIssueSelected(tag: IssueTag): boolean {
    return this.selectedIssueTags().has(tag);
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
    const overrideType = formValue.meeting_type_override;
    const feedback: MeetingFeedback = {
      meeting_id: this.meeting().meeting_id,
      roti_score: formValue.roti_score,
      mood: formValue.mood,
      energy_after: formValue.energy_after,
      meeting_type_override: overrideType !== this.meeting().meeting_type ? overrideType : undefined,
      issue_tags: Array.from(this.selectedIssueTags()),
      comment: formValue.comment || undefined,
    };

    this.submitFeedback.emit(feedback);
  }
}
