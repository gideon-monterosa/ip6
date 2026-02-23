import { Component, inject, input, effect, signal } from '@angular/core';
import { ImpactDashboardService } from './services/impact-dashboard.service';
import { ImpactKpiSummaryComponent } from './components/impact/impact-kpi-summary.component';
import { SentimentDistributionComponent } from './components/impact/sentiment-distribution.component';
import { EfficiencyDistributionComponent } from './components/impact/efficiency-distribution.component';
import { ImpactByMeetingTypeComponent } from './components/impact/impact-by-meeting-type.component';
import { ImpactByTimeOfDayComponent } from './components/impact/impact-by-time-of-day.component';
import { FocusDisruptionPerceptionComponent } from './components/impact/focus-disruption-perception.component';
import { QualitativeThemesComponent } from './components/impact/qualitative-themes.component';
import {
  ImpactSummaryWeek,
  SentimentBucket,
  EfficiencyBucket,
  ImpactByType,
  ImpactByTime,
  DisruptionDay,
  ThemeFrequency,
} from './models/dashboard.model';

@Component({
  selector: 'app-impact-dashboard',
  imports: [
    ImpactKpiSummaryComponent,
    SentimentDistributionComponent,
    EfficiencyDistributionComponent,
    ImpactByMeetingTypeComponent,
    ImpactByTimeOfDayComponent,
    FocusDisruptionPerceptionComponent,
    QualitativeThemesComponent,
  ],
  template: `
    <div>
      <!-- KPI Summary Row -->
      @if (summary()) {
        <div class='mb-6'>
          <app-impact-kpi-summary [summary]='summary()' />
        </div>
      }

      <!-- Row 2: Sentiment + Efficiency -->
      <div class='grid lg:grid-cols-5 gap-4 sm:gap-6 mb-6'>
        @if (sentiment().length) {
          <div class='lg:col-span-2'>
            <app-sentiment-distribution [data]='sentiment()' />
          </div>
        }
        @if (efficiency().length) {
          <div class='lg:col-span-3'>
            <app-efficiency-distribution [data]='efficiency()' />
          </div>
        }
      </div>

      <!-- Row 3: Impact by Type (full width) -->
      @if (impactByType().length) {
        <div class='mb-6'>
          <app-impact-by-meeting-type [data]='impactByType()' />
        </div>
      }

      <!-- Row 4: Impact by Time + Disruption Perception -->
      <div class='grid lg:grid-cols-3 gap-4 sm:gap-6 mb-6'>
        @if (impactByTime().length) {
          <div class='lg:col-span-2'>
            <app-impact-by-time-of-day [data]='impactByTime()' />
          </div>
        }
        @if (focusDisruption().length) {
          <app-focus-disruption-perception [data]='focusDisruption()' />
        }
      </div>

      <!-- Row 5: Qualitative Themes (full width) -->
      @if (themes().length) {
        <app-qualitative-themes [data]='themes()' />
      }
    </div>
  `,
})
export class ImpactDashboardComponent {
  private service = inject(ImpactDashboardService);

  weekStart = input.required<Date>();
  weekEnd = input.required<Date>();

  summary = signal<ImpactSummaryWeek | null>(null);
  sentiment = signal<SentimentBucket[]>([]);
  efficiency = signal<EfficiencyBucket[]>([]);
  impactByType = signal<ImpactByType[]>([]);
  impactByTime = signal<ImpactByTime[]>([]);
  focusDisruption = signal<DisruptionDay[]>([]);
  themes = signal<ThemeFrequency[]>([]);

  constructor() {
    effect(() => {
      const start = this.weekStart();
      const end = this.weekEnd();

      this.service.getImpactSummary(start, end).subscribe((d) => this.summary.set(d));
      this.service.getSentimentDistribution(start, end).subscribe((d) => this.sentiment.set(d));
      this.service.getEfficiencyDistribution(start, end).subscribe((d) => this.efficiency.set(d));
      this.service.getImpactByType(start, end).subscribe((d) => this.impactByType.set(d));
      this.service.getImpactByTime(start, end).subscribe((d) => this.impactByTime.set(d));
      this.service.getFocusDisruption(start, end).subscribe((d) => this.focusDisruption.set(d));
      this.service.getQualitativeThemes(start, end).subscribe((d) => this.themes.set(d));
    });
  }
}
