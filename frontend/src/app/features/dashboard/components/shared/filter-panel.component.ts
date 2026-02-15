import { Component, inject, signal, computed } from '@angular/core';
import { FilterService } from '../../services/filter.service';
import { MeetingType, TimeOfDayBucket } from '../../models/common.model';

@Component({
  selector: 'app-filter-panel',
  template: `
    <div class='bg-card border border-card-line shadow-2xs rounded-xl p-4 md:p-5 mb-6'>
      <div class='flex items-center justify-between mb-3'>
        <h4 class='text-sm font-medium text-muted-foreground-1 uppercase'>Filters</h4>
        @if (activeFilterCount() > 0) {
          <span class='inline-flex items-center justify-center size-5 rounded-full bg-primary text-white text-xs'>
            {{ activeFilterCount() }}
          </span>
        }
      </div>

      <div class='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <!-- Date Range -->
        <div>
          <label class='block text-xs font-medium text-muted-foreground-1 mb-1'>Date Range</label>
          <div class='flex gap-2'>
            <button type='button'
              class='px-2 py-1 text-xs rounded border transition-colors'
              [class.bg-primary]='selectedPreset() === "7d"'
              [class.text-white]='selectedPreset() === "7d"'
              [class.border-primary]='selectedPreset() === "7d"'
              [class.border-gray-300]='selectedPreset() !== "7d"'
              (click)='setPresetRange("7d")'>
              7d
            </button>
            <button type='button'
              class='px-2 py-1 text-xs rounded border transition-colors'
              [class.bg-primary]='selectedPreset() === "30d"'
              [class.text-white]='selectedPreset() === "30d"'
              [class.border-primary]='selectedPreset() === "30d"'
              [class.border-gray-300]='selectedPreset() !== "30d"'
              (click)='setPresetRange("30d")'>
              30d
            </button>
            <button type='button'
              class='px-2 py-1 text-xs rounded border transition-colors'
              [class.bg-primary]='selectedPreset() === "all"'
              [class.text-white]='selectedPreset() === "all"'
              [class.border-primary]='selectedPreset() === "all"'
              [class.border-gray-300]='selectedPreset() !== "all"'
              (click)='setPresetRange("all")'>
              All
            </button>
          </div>
        </div>

        <!-- Meeting Type Filter -->
        <div>
          <label class='block text-xs font-medium text-muted-foreground-1 mb-1'>Meeting Type</label>
          <div class='flex flex-wrap gap-1'>
            @for (type of meetingTypes; track type) {
              <button type='button'
                class='px-2 py-1 text-xs rounded border transition-colors'
                [class.bg-primary]='isTypeSelected(type)'
                [class.text-white]='isTypeSelected(type)'
                [class.border-primary]='isTypeSelected(type)'
                [class.border-gray-300]='!isTypeSelected(type)'
                (click)='toggleMeetingType(type)'>
                {{ type }}
              </button>
            }
          </div>
        </div>

        <!-- Time of Day Filter -->
        <div>
          <label class='block text-xs font-medium text-muted-foreground-1 mb-1'>Time of Day</label>
          <div class='flex flex-wrap gap-1'>
            @for (bucket of timeBuckets; track bucket) {
              <button type='button'
                class='px-2 py-1 text-xs rounded border transition-colors'
                [class.bg-primary]='isBucketSelected(bucket)'
                [class.text-white]='isBucketSelected(bucket)'
                [class.border-primary]='isBucketSelected(bucket)'
                [class.border-gray-300]='!isBucketSelected(bucket)'
                (click)='toggleTimeBucket(bucket)'>
                {{ bucket }}
              </button>
            }
          </div>
        </div>

        <!-- Reset -->
        <div class='flex items-end'>
          <button type='button'
            class='px-3 py-1.5 text-xs font-medium rounded border border-gray-300 text-muted-foreground-1 hover:bg-gray-50 transition-colors'
            (click)='resetFilters()'>
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  `,
})
export class FilterPanelComponent {
  private filterService = inject(FilterService);

  readonly meetingTypes = Object.values(MeetingType);
  readonly timeBuckets = Object.values(TimeOfDayBucket);

  selectedPreset = signal<string>('all');

  activeFilterCount = computed(() => {
    const filters = this.filterService.activeFilters();
    let count = 0;
    if (filters.meetingTypes.length < this.meetingTypes.length) count++;
    if (filters.timeOfDay.length < this.timeBuckets.length) count++;
    return count;
  });

  isTypeSelected(type: MeetingType): boolean {
    return this.filterService.meetingTypeFilters().includes(type);
  }

  isBucketSelected(bucket: TimeOfDayBucket): boolean {
    return this.filterService.timeOfDayFilters().includes(bucket);
  }

  toggleMeetingType(type: MeetingType): void {
    const current = this.filterService.meetingTypeFilters();
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    if (updated.length > 0) {
      this.filterService.setMeetingTypeFilter(updated);
    }
  }

  toggleTimeBucket(bucket: TimeOfDayBucket): void {
    const current = this.filterService.timeOfDayFilters();
    const updated = current.includes(bucket)
      ? current.filter((b) => b !== bucket)
      : [...current, bucket];
    if (updated.length > 0) {
      this.filterService.setTimeOfDayFilter(updated);
    }
  }

  setPresetRange(preset: string): void {
    this.selectedPreset.set(preset);
    const end = new Date();
    const start = new Date();
    if (preset === '7d') {
      start.setDate(start.getDate() - 7);
    } else if (preset === '30d') {
      start.setDate(start.getDate() - 30);
    } else {
      start.setDate(start.getDate() - 365);
    }
    this.filterService.setDateRange(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0],
    );
  }

  resetFilters(): void {
    this.selectedPreset.set('all');
    this.filterService.resetFilters();
  }
}
