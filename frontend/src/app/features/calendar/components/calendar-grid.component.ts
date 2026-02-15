import { Component, input, computed } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { CalendarEvent } from '../../models/calendar.model';
import { CalendarEventCardComponent } from '../calendar-event-card/calendar-event-card.component';

@Component({
  selector: 'app-calendar-grid',
  standalone: true,
  imports: [CommonModule, DatePipe, CalendarEventCardComponent],
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #e5e7eb;
      border-radius: 20px;
    }
  `],
  template: `
    <div class="flex flex-col h-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

      <div class="flex border-b border-gray-200">
        <div class="w-16 flex-shrink-0 border-r border-gray-100 bg-gray-50/50"></div>

        <div class="grid grid-cols-7 flex-1">
          @for (day of weekDays(); track day) {
            <div class="px-2 py-3 text-center border-r border-gray-100 last:border-r-0"
                 [class.bg-blue-50]="isToday(day)">
              <div class="text-xs uppercase font-medium"
                   [class.text-blue-600]="isToday(day)"
                   [class.text-gray-500]="!isToday(day)">
                {{ day | date:'EEE' }}
              </div>
              <div class="text-lg font-semibold mt-1"
                   [class.text-blue-700]="isToday(day)"
                   [class.text-gray-800]="!isToday(day)">
                {{ day | date:'d' }}
              </div>
            </div>
          }
        </div>
      </div>

      <div class="flex-1 overflow-y-auto relative custom-scrollbar">
        <div class="flex min-h-[1440px]">

          <div class="w-16 flex-shrink-0 border-r border-gray-100 bg-gray-50/50 select-none">
            @for (hour of hours; track hour) {
              <div class="h-[60px] border-b border-gray-100 relative">
                <span class="absolute -top-3 right-2 text-xs text-gray-400 font-medium font-mono">
                  {{ hour }}:00
                </span>
              </div>
            }
          </div>

          <div class="grid grid-cols-7 flex-1 relative">
            <div class="absolute inset-0 grid grid-cols-7 pointer-events-none">
              @for (day of weekDays(); track day) {
                <div class="border-r border-gray-100 h-full last:border-r-0">
                  @for (hour of hours; track hour) {
                    <div class="h-[60px] border-b border-gray-50"></div>
                  }
                </div>
              }
            </div>

            @for (day of weekDays(); track day) {
              <div class="relative h-full">
                @for (event of getEventsForDay(day); track event.id) {
                  <app-calendar-event-card [event]="event" />
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class CalendarGridComponent {
  currentDate = input.required<Date>();
  events = input.required<CalendarEvent[]>();

  readonly hours = Array.from({ length: 24 }, (_, i) => i);

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

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  getEventsForDay(date: Date): CalendarEvent[] {
    return this.events().filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear();
    });
  }
}
