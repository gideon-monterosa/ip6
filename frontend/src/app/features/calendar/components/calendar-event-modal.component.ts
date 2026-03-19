import { Component, input, output, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Meeting, MeetingType, MEETING_TYPES } from '../../../shared/models/meeting.model';
import { parseLocal } from '../../../core/utils/date.utils';

@Component({
  selector: 'app-calendar-event-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-[60] overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-card border shadow-lg rounded-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="text-lg font-bold text-foreground">
            {{ meeting() ? 'Edit Event' : 'Add Event' }}
          </h3>
          <button (click)="close.emit()" class="text-muted-foreground-1 hover:text-foreground transition-colors">
            <svg class="size-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <form [formGroup]="eventForm" (ngSubmit)="onSubmit()" class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1 text-foreground">Title</label>
              <input type="text" formControlName="title"
                     class="w-full px-3 py-2 border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
            </div>

            <div>
              <label class="block text-sm font-medium mb-1 text-foreground">Description (Optional)</label>
              <textarea formControlName="description" rows="2"
                        class="w-full px-3 py-2 border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1 text-foreground">Date</label>
                <input type="date" formControlName="date"
                       class="w-full px-3 py-2 border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1 text-foreground">Type</label>
                <select formControlName="meetingType"
                        class="w-full px-3 py-2 border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
                  @for (type of MEETING_TYPES; track type) {
                    <option [value]="type">{{ type }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1 text-foreground">Start Time</label>
                <input type="time" formControlName="startTime"
                       class="w-full px-3 py-2 border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1 text-foreground">End Time</label>
                <input type="time" formControlName="endTime"
                       class="w-full px-3 py-2 border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1 text-foreground">Location (Optional)</label>
              <input type="text" formControlName="location"
                     class="w-full px-3 py-2 border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
            </div>
          </div>

          <div class="mt-8 flex justify-end gap-3">
            <button type="button" (click)="close.emit()"
                    class="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" [disabled]="eventForm.invalid"
                    class="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors">
              {{ meeting() ? 'Save Changes' : 'Create Event' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CalendarEventModalComponent implements OnInit {
  meeting = input<Meeting | null>(null);
  close = output<void>();
  save = output<any>();

  private fb = inject(FormBuilder);
  MEETING_TYPES = MEETING_TYPES;

  eventForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    date: ['', [Validators.required]],
    startTime: ['', [Validators.required]],
    endTime: ['', [Validators.required]],
    meetingType: ['Other' as MeetingType, [Validators.required]],
    location: ['']
  });

  ngOnInit(): void {
    const meeting = this.meeting();
    if (meeting) {
      const start = parseLocal(meeting.start);
      const end = parseLocal(meeting.end);

      this.eventForm.patchValue({
        title: meeting.title,
        description: meeting.description,
        date: this.formatDate(start),
        startTime: this.formatTime(start),
        endTime: this.formatTime(end),
        meetingType: meeting.meetingType,
        location: meeting.location || ''
      });
    } else {
      // Default date to today
      const today = new Date();
      this.eventForm.patchValue({
        date: this.formatDate(today)
      });
    }
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private formatTime(date: Date): string {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      const val = this.eventForm.value;
      const start = `${val.date}T${val.startTime}:00`;
      const end = `${val.date}T${val.endTime}:00`;

      this.save.emit({
        title: val.title,
        description: val.description,
        start,
        end,
        meetingType: val.meetingType,
        location: val.location
      });
    }
  }
}
