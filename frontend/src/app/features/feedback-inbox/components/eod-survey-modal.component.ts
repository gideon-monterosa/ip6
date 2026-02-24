import { Component, input, output, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DailyFeedbackDetails, DailyFeedbackSubmission } from '../models/feedback.model';

@Component({
  selector: 'app-eod-survey-modal',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './eod-survey-modal.component.html',
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
export class EodSurveyModalComponent implements OnInit {
  date = input.required<string>();
  submitFeedback = output<DailyFeedbackSubmission>();
  close = output<void>();

  eodForm!: FormGroup;

  scores = [1, 2, 3, 4, 5];

  questions = [
    {
      key: 'productivityScore',
      label: 'How productive were you today?',
      leftAnchor: 'Unproductive',
      rightAnchor: 'Productive',
    },
    {
      key: 'deepWorkScore',
      label: 'How much deep, focused work did you do today?',
      leftAnchor: 'None',
      rightAnchor: 'A lot',
    },
    {
      key: 'energyScore',
      label: 'How energized do you feel right now?',
      leftAnchor: 'Drained',
      rightAnchor: 'Energized',
    },
    {
      key: 'meetingLoadScore',
      label: "How did today's meeting load feel?",
      leftAnchor: 'Too few',
      rightAnchor: 'Too many',
    },
  ];

  private fb: FormBuilder;

  constructor(fb: FormBuilder) {
    this.fb = fb;
  }

  get formattedDate(): Date {
    return new Date(this.date() + 'T00:00:00');
  }

  ngOnInit(): void {
    this.eodForm = this.fb.group({
      productivityScore: [null, Validators.required],
      deepWorkScore: [null, Validators.required],
      energyScore: [null, Validators.required],
      meetingLoadScore: [null, Validators.required],
    });
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onSubmit(): void {
    if (this.eodForm.invalid) {
      this.eodForm.markAllAsTouched();
      return;
    }

    const formValue = this.eodForm.value as DailyFeedbackDetails;
    const submission: DailyFeedbackSubmission = {
      date: this.date(),
      details: { ...formValue, type: 'DAILY' },
    };

    this.submitFeedback.emit(submission);
  }
}
