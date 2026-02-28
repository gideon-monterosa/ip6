import { Component, input, computed, output } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { Meeting, FeedbackStatus } from '../../../shared/models/meeting.model';
import { DailyFeedback } from '../../feedback-inbox/models/feedback.model';
import { CalendarEventCardComponent } from '../components/calendar-event-card.component';
import { UserSettings } from '../../../core/models/user.model';

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
    <div class="flex flex-col h-full bg-gray-50 border border-gray-200 rounded-xl shadow-sm overflow-hidden">

      <div class="flex border-b border-gray-200 bg-white">
        <div class="w-16 flex-shrink-0 border-r border-gray-100 bg-gray-50/50"></div>

        <div class="grid grid-cols-7 flex-1">
          @for (day of weekDays(); track day) {
            <div class="px-2 py-2 text-center border-r border-gray-100 last:border-r-0"
                 [class.bg-blue-50]="isToday(day)">
              <div class="text-xs uppercase font-medium"
                   [class.text-blue-600]="isToday(day)"
                   [class.text-gray-500]="!isToday(day)">
                {{ day | date:'EEE' }}
              </div>
              <div class="text-lg font-semibold mt-0.5"
                   [class.text-blue-700]="isToday(day)"
                   [class.text-gray-800]="!isToday(day)">
                {{ day | date:'d' }}
              </div>
              <!-- EoD feedback button -->
              @if (!isFutureDate(day) && isWorkingDay(day)) {
                @if (getDailyFeedbackForDay(day); as df) {
                  <button
                    type="button"
                    (click)="eodFeedbackClick.emit({ date: day, status: df.feedbackStatus }); $event.stopPropagation()"
                    class="mt-1 text-xs px-1.5 py-0.5 rounded-full transition-colors w-full truncate"
                    [class]="getEodButtonClasses(df.feedbackStatus)"
                    [attr.aria-label]="'End of day feedback for ' + (day | date:'MMM d')"
                  >
                    @if (df.feedbackStatus === 'SUBMITTED') {
                      &#10003; Day Reviewed
                    } @else if (df.feedbackStatus === 'DISMISSED') {
                      &mdash; Skipped
                    } @else {
                      Review Day
                    }
                  </button>
                } @else {
                  <button
                    type="button"
                    (click)="eodFeedbackClick.emit({ date: day, status: 'PENDING' }); $event.stopPropagation()"
                    class="mt-1 text-xs px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors w-full truncate"
                    [attr.aria-label]="'End of day feedback for ' + (day | date:'MMM d')"
                  >
                    Review Day
                  </button>
                }
              }
            </div>
          }
        </div>
      </div>

      <div class="flex-1 overflow-y-auto relative custom-scrollbar bg-white">
        <div class="flex min-h-[1440px]">

          <div class="w-16 flex-shrink-0 border-r border-gray-100 bg-gray-50/50 select-none">
            @for (hour of hours; track hour) {
              <div class="h-[60px] border-b border-gray-100 relative"
                   [class.bg-white]="isWorkingHourAxis(hour)"
                   [class.bg-gray-50]="!isWorkingHourAxis(hour)">
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
                    <div class="h-[60px] border-b border-gray-50 transition-colors"
                         [class.bg-white]="isWorkingTime(day, hour)"
                         [class.bg-gray-100]="!isWorkingTime(day, hour)">
                    </div>
                  }
                </div>
              }
            </div>

            @for (day of weekDays(); track day) {
              <div class="relative h-full">
                @for (eventWithLayout of getEventsForDay(day); track eventWithLayout.event.id) {
                  <app-calendar-event-card
                    [event]="eventWithLayout.event"
                    [eventLayout]="eventWithLayout.layout"
                    (click)="onEventClick(eventWithLayout.event, $event)"
                  />
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
  events = input.required<Meeting[]>();
  settings = input<UserSettings>();
  dailyFeedbacks = input<DailyFeedback[]>([]);

  eventClick = output<Meeting>();
  eodFeedbackClick = output<{ date: Date; status: string }>();

  readonly hours = Array.from({ length: 24 }, (_, i) => i);

  readonly DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  workStartHour = computed(() => {
    const timeString = this.settings()?.workStartTime;
    return timeString ? parseInt(timeString.split(':')[0], 10) : 9;
  });

  workEndHour = computed(() => {
    const timeString = this.settings()?.workEndTime;
    return timeString ? parseInt(timeString.split(':')[0], 10) : 18;
  });

  workingDays = computed(() => {
    return this.settings()?.workingDays || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  });

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

  isFutureDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d > today;
  }

  isWorkingDay(date: Date): boolean {
    const dayName = this.DAY_NAMES[date.getDay()];
    return this.workingDays().includes(dayName);
  }

  isWorkingHourAxis(hour: number): boolean {
    return hour >= this.workStartHour() && hour < this.workEndHour();
  }

  isWorkingTime(date: Date, hour: number): boolean {
    const dayName = this.DAY_NAMES[date.getDay()];
    const isWorkingDay = this.workingDays().includes(dayName);
    const isWorkingHour = hour >= this.workStartHour() && hour < this.workEndHour();
    return isWorkingDay && isWorkingHour;
  }

  getEventsForDay(date: Date): { event: Meeting; layout: { left: string; width: string } }[] {
    const dayEvents = this.events().filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear();
    });

    if (dayEvents.length === 0) return [];

    // Sort by start time, then end time
    dayEvents.sort((a, b) => {
      const startDiff = new Date(a.start).getTime() - new Date(b.start).getTime();
      if (startDiff !== 0) return startDiff;
      return new Date(b.end).getTime() - new Date(a.end).getTime();
    });

    const results: { event: Meeting; layout: { left: string; width: string } }[] = [];
    const columns: Meeting[][] = [];

    dayEvents.forEach(event => {
      let placed = false;
      const eventStart = new Date(event.start).getTime();

      for (let i = 0; i < columns.length; i++) {
        const lastEventInColumn = columns[i][columns[i].length - 1];
        if (new Date(lastEventInColumn.end).getTime() <= eventStart) {
          columns[i].push(event);
          placed = true;
          break;
        }
      }

      if (!placed) {
        columns.push([event]);
      }
    });

    // Now we have events in columns, but we need to know the total width they can occupy
    // This simple approach assigns columns. For better visualization, we group overlapping events.

    const totalColumns = columns.length;
    columns.forEach((column, columnIndex) => {
      column.forEach(event => {
        results.push({
          event,
          layout: {
            left: `${(columnIndex / totalColumns) * 100}%`,
            width: `${(1 / totalColumns) * 100}%`
          }
        });
      });
    });

    return results;
  }

  getDailyFeedbackForDay(date: Date): DailyFeedback | undefined {
    const dateStr = this.formatDateToISO(date);
    return this.dailyFeedbacks().find(df => df.date === dateStr);
  }

  getEodButtonClasses(status: string): string {
    switch (status) {
      case FeedbackStatus.SUBMITTED:
        return 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100';
      case FeedbackStatus.DISMISSED:
        return 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100';
      default:
        return 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100';
    }
  }

  private formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onEventClick(event: Meeting, e: MouseEvent): void {
    e.stopPropagation();
    this.eventClick.emit(event);
  }
}
