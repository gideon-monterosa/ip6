import { Component, input, output, computed } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { Meeting, FeedbackStatus, MeetingType, MEETING_TYPES } from '../../../shared/models/meeting.model';

@Component({
  selector: 'app-calendar-event-popover',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[1px]"
         (click)="close.emit()">

      <div class="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200"
           (click)="$event.stopPropagation()">

        <div class="px-5 py-4 border-b border-gray-100 flex justify-between items-start gap-4">
          <div>
            <h3 class="font-semibold text-gray-900 text-lg leading-tight">{{ event().title }}</h3>
            <div class="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <span>{{ event().start | date:'shortTime' }} - {{ event().end | date:'shortTime' }}</span>
              <span>•</span>
              <span>{{ duration() }} min</span>
            </div>
            @if (!event().provider) {
              <div class="mt-2">
                <button (click)="edit.emit()"
                        class="inline-flex items-center gap-x-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors">
                  <svg class="size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  Edit Event
                </button>
              </div>
            }
          </div>
          <button (click)="close.emit()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="size-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-5">
          <div class="mb-5 space-y-1.5">
            <label class="text-xs font-medium text-gray-700">Meeting Type</label>
            <div class="relative">
              <select
                [value]="event().meetingType"
                (change)="onTypeChange($event)"
                class="w-full px-3 py-2.5 pe-9 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                @for (type of meetingTypes; track type) {
                  <option [value]="type">{{ type }}</option>
                }
              </select>
              <div class="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none">
                <svg class="size-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          @if (isSubmitted()) {
            <div class="flex flex-col gap-3">
              <div class="p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3 text-green-800 text-sm">
                <svg class="size-5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Feedback submitted!</span>
              </div>
            </div>
          } @else if (isDismissed()) {
            <div class="flex flex-col items-center gap-2 py-3">
              <span class="text-gray-500 italic text-sm">You dismissed feedback for this meeting.</span>
              <button (click)="undoDismiss.emit()"
                      class="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:underline">
                Undo Dismiss
              </button>
            </div>
          } @else {
            <div class="flex flex-col gap-3">
              <button (click)="giveFeedback.emit()"
                      class="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors flex justify-center items-center gap-2">
                <svg class="size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11l5-5h6a2 2 0 002-2v-1" />
                </svg>
                Give Feedback
              </button>

              <button (click)="dismiss.emit()"
                      class="w-full py-2.5 px-4 bg-white border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                Dismiss
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class CalendarEventPopoverComponent {
  event = input.required<Meeting>();
  close = output<void>();
  dismiss = output<void>();
  undoDismiss = output<void>();
  giveFeedback = output<void>();
  edit = output<void>();
  categoryChange = output<{ meetingId: string; meetingType: MeetingType }>();

  meetingTypes = MEETING_TYPES;

  isSubmitted = computed(() => this.event().feedbackStatus === FeedbackStatus.SUBMITTED);
  isDismissed = computed(() => this.event().feedbackStatus === FeedbackStatus.DISMISSED);

  duration = computed(() => {
    const start = new Date(this.event().start).getTime();
    const end = new Date(this.event().end).getTime();
    return Math.round((end - start) / (1000 * 60));
  });

  onTypeChange(e: Event): void {
    const select = e.target as HTMLSelectElement;
    this.categoryChange.emit({
      meetingId: this.event().id,
      meetingType: select.value as MeetingType
    });
  }
}
