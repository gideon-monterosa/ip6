import { Injectable, signal, computed } from '@angular/core';
import {
  FilterState,
  DateRange,
  MeetingType,
  TimeOfDayBucket,
} from '../models/common.model';

const STORAGE_KEY = 'dashboard_filters';

function getDefaultDateRange(): DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 56); // 8 weeks
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

function getDefaultFilters(): FilterState {
  return {
    dateRange: getDefaultDateRange(),
    meetingTypes: Object.values(MeetingType),
    timeOfDay: Object.values(TimeOfDayBucket),
  };
}

function loadFiltersFromStorage(): FilterState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as FilterState;
    }
  } catch {
    // ignore parse errors
  }
  return getDefaultFilters();
}

@Injectable({ providedIn: 'root' })
export class FilterService {
  private filterState = signal<FilterState>(loadFiltersFromStorage());

  readonly activeFilters = computed(() => this.filterState());
  readonly dateRange = computed(() => this.filterState().dateRange);
  readonly meetingTypeFilters = computed(() => this.filterState().meetingTypes);
  readonly timeOfDayFilters = computed(() => this.filterState().timeOfDay);

  setDateRange(startDate: string, endDate: string): void {
    this.filterState.update((state) => {
      const updated = { ...state, dateRange: { startDate, endDate } };
      this.persist(updated);
      return updated;
    });
  }

  setMeetingTypeFilter(types: MeetingType[]): void {
    this.filterState.update((state) => {
      const updated = { ...state, meetingTypes: types };
      this.persist(updated);
      return updated;
    });
  }

  setTimeOfDayFilter(buckets: TimeOfDayBucket[]): void {
    this.filterState.update((state) => {
      const updated = { ...state, timeOfDay: buckets };
      this.persist(updated);
      return updated;
    });
  }

  resetFilters(): void {
    const defaults = getDefaultFilters();
    this.filterState.set(defaults);
    this.persist(defaults);
  }

  private persist(state: FilterState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }
}
