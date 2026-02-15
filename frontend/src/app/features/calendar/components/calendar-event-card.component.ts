import { Component, input, computed } from '@angular/core';
import { DatePipe, NgStyle } from '@angular/common';
import { CalendarEvent, AuthProvider } from '../models/calendar.model';

@Component({
  selector: 'app-calendar-event-card',
  standalone: true,
  imports: [DatePipe, NgStyle],
  template: `
    <div
      class="absolute inset-x-1 rounded px-2 py-1 text-xs overflow-hidden cursor-pointer transition-all shadow-sm group border-l-[3px]"
      [ngStyle]="style()"
      [title]="tooltip()"
    >
      <div class="font-semibold truncate">{{ event().title }}</div>
      <div class="truncate opacity-75">
        {{ event().start | date:'shortTime' }} - {{ event().end | date:'shortTime' }}
      </div>

      @if (event().link) {
        <a [href]="event().link"
           target="_blank"
           (click)="$event.stopPropagation()"
           class="hidden group-hover:block mt-1 underline font-medium">
          Join
        </a>
      }
    </div>
  `
})
export class CalendarEventCardComponent {
  event = input.required<CalendarEvent>();

  // Design Constants
  private readonly cellHeight = 60; // 60px pro Stunde

  style = computed(() => {
    const e = this.event();
    const start = new Date(e.start);
    const end = new Date(e.end);

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    const top = startMinutes * (this.cellHeight / 60);
    const height = durationMinutes * (this.cellHeight / 60);

    const isGoogle = !e.provider || e.provider === AuthProvider.GOOGLE;

    return {
      top: `${top}px`,
      height: `${Math.max(height, 20)}px`, // Mindesthöhe für Lesbarkeit
      backgroundColor: isGoogle ? '#dbeafe' : '#ffedd5', // blue-100 : orange-100
      borderColor: isGoogle ? '#2563eb' : '#ea580c',     // blue-600 : orange-600
      color: isGoogle ? '#1e40af' : '#9a3412',           // blue-800 : orange-800
      zIndex: 10
    };
  });

  tooltip = computed(() => {
    const e = this.event();
    return `${e.title} (${new Date(e.start).toLocaleTimeString()} - ${new Date(e.end).toLocaleTimeString()})`;
  });
}
