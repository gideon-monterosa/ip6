import { Component, input, computed } from '@angular/core';
import { DatePipe, NgClass, NgStyle } from '@angular/common';
import { Meeting, FeedbackStatus, MeetingType } from '../../../shared/models/meeting.model';

@Component({
  selector: 'app-calendar-event-card',
  standalone: true,
  imports: [DatePipe, NgStyle, NgClass],
  template: `
    <div
      class="absolute inset-x-1 rounded px-2 py-1 text-xs overflow-hidden cursor-pointer transition-all shadow-sm group border-l-[3px] flex flex-col"
      [ngStyle]="positionStyle()"
      [ngClass]="statusClasses()"
      [title]="tooltip()"
    >
      @if (showActionBadge()) {
        <div class="absolute top-1 right-1 size-2 rounded-full bg-red-500 ring-1 ring-white shadow-xs"></div>
      }

      <div class="font-semibold truncate flex items-center gap-1">
        @if (isSubmitted()) {
          <svg class="size-3 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        }
        <span class="truncate">{{ event().title }}</span>
      </div>

      <div class="mt-1 mb-0.5">
        <span
          class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium whitespace-nowrap leading-none"
          [class]="getBadgeClasses(event().meetingType)"
        >
          {{ event().meetingType }}
        </span>
      </div>

      <div class="truncate text-[10px] opacity-85 font-medium">
        {{ event().start | date:'shortTime' }} - {{ event().end | date:'shortTime' }}
      </div>

    </div>
  `
})
export class CalendarEventCardComponent {
  event = input.required<Meeting>();

  private readonly cellHeight = 60; // 60px pro Stunde

  positionStyle = computed(() => {
    const e = this.event();
    const start = new Date(e.start);
    const end = new Date(e.end);

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    const top = startMinutes * (this.cellHeight / 60);
    const height = durationMinutes * (this.cellHeight / 60);

    return {
      top: `${top}px`,
      height: `${Math.max(height, 24)}px`,
      zIndex: 10
    };
  });

  statusClasses = computed(() => {
    const status = this.event().feedbackStatus;

    switch (status) {
      case FeedbackStatus.SUBMITTED:
        return [
          'bg-green-100',
          'border-green-600',
          'text-green-900',
          'hover:bg-green-200'
        ];

      case FeedbackStatus.DISMISSED:
        return [
          'bg-gray-100',
          'border-gray-400',
          'border-dashed',
          'text-gray-500',
          'opacity-60',
          'line-through',
          'hover:opacity-100'
        ];

      case FeedbackStatus.PENDING:
        return [
          'bg-blue-100',
          'border-blue-600',
          'text-blue-900',
          'hover:bg-blue-200'
        ];

      default:
        return [
          'bg-white',
          'border-gray-300',
          'text-gray-800',
          'border-l-4',
          'hover:bg-gray-50',
          'border-solid'
        ];
    }
  });

  getBadgeClasses(type: MeetingType): string {
    const base = 'border';
    switch (type) {
      case 'Stand-up':
        return `${base} bg-blue-50 text-blue-700 border-blue-200`;
      case 'Planning':
        return `${base} bg-purple-50 text-purple-700 border-purple-200`;
      case 'Retrospective':
        return `${base} bg-green-50 text-green-700 border-green-200`;
      case '1:1':
        return `${base} bg-yellow-50 text-yellow-700 border-yellow-200`;
      case 'Ad-hoc':
        return `${base} bg-orange-50 text-orange-700 border-orange-200`;
      default:
        return `${base} bg-gray-50 text-gray-700 border-gray-200`;
    }
  }

  tooltip = computed(() => {
    const e = this.event();
    return `${e.title} (${new Date(e.start).toLocaleTimeString()} - ${new Date(e.end).toLocaleTimeString()})`;
  });

  isSubmitted = computed(() => this.event().feedbackStatus === FeedbackStatus.SUBMITTED);

  showActionBadge = computed(() => this.event().feedbackStatus === FeedbackStatus.PENDING);
}
