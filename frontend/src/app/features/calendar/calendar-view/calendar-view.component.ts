import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CalendarService } from '../services/calendar.service';
import { CalendarEvent, AuthProvider } from '../models/calendar.model';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './calendar-view.component.html',
  styles: [`
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class CalendarViewComponent implements OnInit {
  // State
  currentDate = signal(new Date());
  events = signal<CalendarEvent[]>([]);
  isLoading = signal(false);

  // Constants
  readonly hours = Array.from({ length: 24 }, (_, i) => i); // 0..23
  readonly cellHeight = 60;

  weekDays = computed(() => {
    const curr = new Date(this.currentDate());
    const day = curr.getDay();

    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);

    const monday = new Date(curr.setDate(diff));
    const days = [];

    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      days.push(nextDay);
    }
    return days;
  });

  currentMonthLabel = computed(() => {
    return this.currentDate().toLocaleString('default', { month: 'long', year: 'numeric' });
  });

  constructor(private calendarService: CalendarService) {
    effect(() => {
      this.loadEvents();
    });
  }

  ngOnInit(): void {

  }

  loadEvents(): void {
    const days = this.weekDays();
    const startOfWeek = days[0];
    const endOfWeek = new Date(days[6]);
    endOfWeek.setHours(23, 59, 59, 999);
    startOfWeek.setHours(0, 0, 0, 0);

    this.isLoading.set(true);
    this.calendarService.getEvents(startOfWeek, endOfWeek).subscribe({
      next: (data) => {
        console.log('Events loaded:', data);
        this.events.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load events', err);
        this.isLoading.set(false);
      }
    });
  }

  // Navigation
  previousWeek(): void {
    const newDate = new Date(this.currentDate());
    newDate.setDate(newDate.getDate() - 7);
    this.currentDate.set(newDate);
  }

  nextWeek(): void {
    const newDate = new Date(this.currentDate());
    newDate.setDate(newDate.getDate() + 7);
    this.currentDate.set(newDate);
  }

  today(): void {
    this.currentDate.set(new Date());
  }

  // Helper
  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  // Filter events for specific day
  getEventsForDay(date: Date): CalendarEvent[] {
    return this.events().filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear();
    });
  }

  // Style calculation
  getEventStyle(event: CalendarEvent): any {
    const start = new Date(event.start);
    const end = new Date(event.end);

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    const top = startMinutes * (this.cellHeight / 60);
    const height = durationMinutes * (this.cellHeight / 60);

    const isGoogle = !event.provider || event.provider === AuthProvider.GOOGLE;

    return {
      top: `${top}px`,
      height: `${height}px`,
      backgroundColor: isGoogle ? '#dbeafe' : '#ffedd5',
      borderLeft: `3px solid ${isGoogle ? '#2563eb' : '#ea580c'}`,
      color: isGoogle ? '#1e40af' : '#9a3412'
    };
  }
}
