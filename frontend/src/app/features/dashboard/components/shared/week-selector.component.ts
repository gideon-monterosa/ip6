import { Component, input, output, computed } from '@angular/core';
import { getMonday, getSunday, isSameWeek, formatWeekRange } from '../../utils/week.utils';

@Component({
  selector: 'app-week-selector',
  template: `
    <div class="flex items-center justify-center gap-x-3 py-0">
      <!-- Previous week -->
      <button
        type="button"
        (click)="goToPreviousWeek()"
        class="inline-flex items-center justify-center size-8 rounded-full text-muted-foreground-1 hover:bg-muted hover:text-foreground transition-all active:scale-95"
      >
        <svg class="shrink-0 size-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <!-- Date range label -->
      <span class="text-xl font-bold text-foreground min-w-[320px] text-center select-none tabular-nums tracking-tight">
        {{ label() }}
      </span>

      <!-- Next week -->
      <button
        type="button"
        (click)="goToNextWeek()"
        [disabled]="isCurrentWeek()"
        class="inline-flex items-center justify-center size-8 rounded-full transition-all active:scale-95"
        [class.text-muted-foreground-1]="!isCurrentWeek()"
        [class.hover:bg-muted]="!isCurrentWeek()"
        [class.hover:text-foreground]="!isCurrentWeek()"
        [class.text-muted-foreground-2]="isCurrentWeek()"
        [class.opacity-40]="isCurrentWeek()"
        [class.cursor-not-allowed]="isCurrentWeek()"
      >
        <svg class="shrink-0 size-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <!-- Today shortcut -->
      <div class="w-16 flex justify-center">
        @if (!isCurrentWeek()) {
          <button
            type="button"
            (click)="goToToday()"
            class="px-3 py-1 text-xs font-bold rounded-full bg-primary text-white hover:bg-primary/90 transition-all shadow-sm active:scale-95"
          >
            Today
          </button>
        }
      </div>
    </div>
  `,
})
export class WeekSelectorComponent {
  weekStart = input.required<Date>();
  weekChange = output<Date>();

  label = computed(() => formatWeekRange(this.weekStart()));

  isCurrentWeek = computed(() => isSameWeek(this.weekStart(), new Date()));

  goToPreviousWeek(): void {
    const prev = new Date(this.weekStart());
    prev.setDate(prev.getDate() - 7);
    this.weekChange.emit(prev);
  }

  goToNextWeek(): void {
    if (this.isCurrentWeek()) return;
    const next = new Date(this.weekStart());
    next.setDate(next.getDate() + 7);
    this.weekChange.emit(next);
  }

  goToToday(): void {
    this.weekChange.emit(getMonday(new Date()));
  }
}
