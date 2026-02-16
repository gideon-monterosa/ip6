import { Component, input, computed } from '@angular/core';
import { DatePipe, NgClass, NgStyle } from '@angular/common';
import { CalendarEvent } from '../models/calendar.model';
import { FeedbackStatus } from '../../feedback-inbox/models/feedback.model';

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

      <div class="truncate text-[10px] opacity-85 mt-0.5 font-medium">
        {{ event().start | date:'shortTime' }} - {{ event().end | date:'shortTime' }}
      </div>

      @if (event().link) {
        <a [href]="event().link"
           target="_blank"
           (click)="$event.stopPropagation()"
           class="hidden group-hover:block mt-auto pt-1 underline font-bold truncate">
          Join
        </a>
      }
    </div>
  `
})
export class CalendarEventCardComponent {
  event = input.required<CalendarEvent>();

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

  tooltip = computed(() => {
    const e = this.event();
    return `${e.title} (${new Date(e.start).toLocaleTimeString()} - ${new Date(e.end).toLocaleTimeString()})`;
  });

  isSubmitted = computed(() => this.event().feedbackStatus === FeedbackStatus.SUBMITTED);

  showActionBadge = computed(() => this.event().feedbackStatus === FeedbackStatus.PENDING);
}
