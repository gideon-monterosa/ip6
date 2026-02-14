import { Component, input, computed } from '@angular/core';
import { StructureSummary } from '../../models/structure.model';
import { StatCardComponent } from '../stat-card.component';

@Component({
  selector: 'app-structure-kpi-summary',
  imports: [StatCardComponent],
  template: `
    <div class='grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
      @if (summary(); as s) {
        <app-stat-card
          title='Total Meetings'
          [value]="'' + s.totalMeetings"
          [change]='percentChange(s.totalMeetings, s.totalMeetingsLastWeek)'
        />
        <app-stat-card
          title='Total Meeting Hours'
          [value]="s.totalHours + 'h'"
          [change]='percentChange(s.totalHours, s.totalHoursLastWeek)'
        />
        <app-stat-card
          title='Avg Duration'
          [value]="s.avgDuration + ' min'"
          [change]='percentChange(s.avgDuration, s.avgDurationLastWeek)'
        />
        <app-stat-card
          title='Avg Meetings/Day'
          [value]="'' + s.avgMeetingsPerDay"
          [change]='percentChange(s.avgMeetingsPerDay, s.avgMeetingsPerDayLastWeek)'
        />
      }
    </div>
  `,
})
export class StructureKpiSummaryComponent {
  summary = input.required<StructureSummary | null>();

  percentChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }
}
