import { Component, inject, signal, effect, computed } from '@angular/core';
import { CalendarService } from '../services/calendar.service';
import { CalendarEvent } from '../models/calendar.model';
import { CalendarHeaderComponent } from '../components/calendar-header.component';
import { CalendarGridComponent } from '../components/calendar-grid.component';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CalendarHeaderComponent, CalendarGridComponent],
  template: `
    <div class="flex flex-col h-[calc(100vh-80px)] max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-6">

      <app-calendar-header
        [currentDate]="currentDate()"
        (previous)="onPreviousWeek()"
        (next)="onNextWeek()"
        (today)="onToday()"
        (refresh)="onRefresh()"
      />

      <div class="relative flex-1 min-h-0">
        @if (isLoading()) {
          <div class="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-xs rounded-xl transition-all">
            <div class="animate-spin inline-block size-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading">
              <span class="sr-only">Loading...</span>
            </div>
          </div>
        }

        <app-calendar-grid
          [currentDate]="currentDate()"
          [events]="events()"
        />
      </div>
    </div>
  `
})
export class CalendarViewComponent {
  private calendarService = inject(CalendarService);

  currentDate = signal(new Date());
  events = signal<CalendarEvent[]>([]);
  isLoading = signal(false);

  constructor() {
    effect(() => {
      this.loadEventsForWeek(this.currentDate());
    });
  }

  private loadEventsForWeek(date: Date): void {
    const curr = new Date(date);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // Montag

    const startOfWeek = new Date(curr);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    this.isLoading.set(true);

    this.calendarService.getEvents(startOfWeek, endOfWeek).subscribe({
      next: (data) => {
        this.events.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load events', err);
        this.isLoading.set(false);
      }
    });
  }

  onPreviousWeek(): void {
    const newDate = new Date(this.currentDate());
    newDate.setDate(newDate.getDate() - 7);
    this.currentDate.set(newDate);
  }

  onNextWeek(): void {
    const newDate = new Date(this.currentDate());
    newDate.setDate(newDate.getDate() + 7);
    this.currentDate.set(newDate);
  }

  onToday(): void {
    this.currentDate.set(new Date());
  }

  onRefresh(): void {
    this.isLoading.set(true);
    this.calendarService.sync().subscribe({
      next: () => {
        this.loadEventsForWeek(this.currentDate());
      },
      error: (err) => {
        console.error('Sync failed', err);
        this.isLoading.set(false);
      }
    });
  }
}
