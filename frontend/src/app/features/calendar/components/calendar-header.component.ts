import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-calendar-header',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">
          {{ currentDate() | date:'MMMM yyyy' }}
        </h1>
        <p class="text-sm text-muted-foreground-1">Weekly Overview</p>
      </div>

      <div class="flex items-center gap-x-3">
        <button
          (click)="add.emit()"
          type="button"
          class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover transition-colors"
        >
          <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
          Add Event
        </button>

        <button
          (click)="refresh.emit()"
          type="button"
          class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/>
          </svg>
          Sync
        </button>

        <div class="flex items-center gap-x-2 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
          <button
            (click)="previous.emit()"
            type="button"
            class="p-2 inline-flex justify-center items-center gap-x-2 rounded-md hover:bg-gray-100 text-gray-800 disabled:opacity-50 transition-colors"
            aria-label="Previous week">
            <svg class="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>

          <button
            (click)="today.emit()"
            type="button"
            class="py-1.5 px-4 inline-flex justify-center items-center rounded-md text-sm font-medium text-gray-800 hover:bg-gray-100 transition-colors">
            Today
          </button>

          <button
            (click)="next.emit()"
            type="button"
            class="p-2 inline-flex justify-center items-center gap-x-2 rounded-md hover:bg-gray-100 text-gray-800 disabled:opacity-50 transition-colors"
            aria-label="Next week">
            <svg class="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class CalendarHeaderComponent {
  currentDate = input.required<Date>();

  previous = output<void>();
  next = output<void>();
  today = output<void>();
  refresh = output<void>();
  add = output<void>();
}
