import { Component, input } from '@angular/core';
import { ImpactSummaryWeek } from '../../models/dashboard.model';
import { StatCardComponent } from '../stat-card.component';

@Component({
  selector: 'app-impact-kpi-summary',
  imports: [StatCardComponent],
  template: `
    <div class='grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
      @if (summary(); as s) {
        <app-stat-card
          title='Worth my time (Avg)'
          [value]="s.avgEfficiency + ' / 5'"
          [change]='percentChange(s.avgEfficiency, s.prevAvgEfficiency)'
        />
        <app-stat-card
          title='Feeling after'
          [value]="formatEmotional(s.avgEmotionalScore)"
          [change]='percentChange(s.avgEmotionalScore + 2, s.prevAvgEmotionalScore + 2)'
        />
        <app-stat-card
          title='Energy level (Avg)'
          [value]="s.avgEnergyAfter + ' / 5'"
          [change]='percentChange(s.avgEnergyAfter, s.prevAvgEnergyAfter)'
        />
        <app-stat-card
          title='Meetings Valuable'
          [value]="s.percentageValuable + '%'"
          [change]='percentChange(s.percentageValuable, s.prevPercentageValuable)'
        />
      }
    </div>
  `,
})
export class ImpactKpiSummaryComponent {
  summary = input.required<ImpactSummaryWeek | null>();

  percentChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  formatEmotional(score: number): string {
    if (score > 0.3) return 'Positive';
    if (score < -0.3) return 'Negative';
    return 'Neutral';
  }
}
