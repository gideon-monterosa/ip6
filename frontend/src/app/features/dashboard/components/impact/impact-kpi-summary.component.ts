import { Component, input } from '@angular/core';
import { ImpactSummary } from '../../models/impact.model';
import { StatCardComponent } from '../stat-card.component';

@Component({
  selector: 'app-impact-kpi-summary',
  imports: [StatCardComponent],
  template: `
    <div class='grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
      @if (summary(); as s) {
        <app-stat-card
          title='Avg Efficiency'
          [value]="s.avgEfficiency + ' / 5'"
          [change]='percentChange(s.avgEfficiency, s.avgEfficiencyLastWeek)'
        />
        <app-stat-card
          title='Emotional Score'
          [value]="formatEmotional(s.avgEmotionalScore)"
          [change]='percentChange(s.avgEmotionalScore + 2, s.avgEmotionalScoreLastWeek + 2)'
        />
        <app-stat-card
          title='Avg Energy After'
          [value]="s.avgEnergyAfter + ' / 5'"
          [change]='percentChange(s.avgEnergyAfter, s.avgEnergyAfterLastWeek)'
        />
        <app-stat-card
          title='Meetings Valuable'
          [value]="s.percentageValuable + '%'"
          [change]='percentChange(s.percentageValuable, s.percentageValuableLastWeek)'
        />
      }
    </div>
  `,
})
export class ImpactKpiSummaryComponent {
  summary = input.required<ImpactSummary | null>();

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
