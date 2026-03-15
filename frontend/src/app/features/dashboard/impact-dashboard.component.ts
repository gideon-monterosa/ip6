import { Component, inject, input, effect, signal } from '@angular/core';
import { ImpactDashboardService } from './services/impact-dashboard.service';
import { ImpactKpiSummaryComponent } from './components/impact/impact-kpi-summary.component';
import { SentimentDistributionComponent } from './components/impact/sentiment-distribution.component';
import { EfficiencyDistributionComponent } from './components/impact/efficiency-distribution.component';
import { ImpactByMeetingTypeComponent } from './components/impact/impact-by-meeting-type.component';
import { ImpactByTimeOfDayComponent } from './components/impact/impact-by-time-of-day.component';
import { QualitativeThemesComponent } from './components/impact/qualitative-themes.component';
import {
  ImpactSummaryWeek,
  SentimentBucket,
  EfficiencyBucket,
  ImpactByType,
  ImpactByTime,
  ThemeFrequency,
} from './models/dashboard.model';

/**
 * @deprecated This component is being phased out in favor of more streamlined dashboard views.
 */
@Component({
  selector: 'app-impact-dashboard',
  imports: [
    ImpactKpiSummaryComponent,
    SentimentDistributionComponent,
    EfficiencyDistributionComponent,
    ImpactByMeetingTypeComponent,
    ImpactByTimeOfDayComponent,
    QualitativeThemesComponent,
  ],
  template: `
    <div class="flex flex-col gap-6">
      <!-- Dashboard Description -->
      <div>
        <h2 class="text-xl font-bold text-foreground flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          Meeting Impact Analysis
        </h2>
        <p class="text-base text-muted-foreground-1 mt-1 max-w-3xl">
          Get insight into the provieded meeting feedback. See what impact meetings have on you and identify possible pain points.
        </p>
      </div>

      <!-- KPI Summary Row -->
      @if (summary()) {
        <div class='mb-6'>
          <app-impact-kpi-summary [summary]='summary()' />
        </div>
      }

      <!-- Row 2: Sentiment + Efficiency -->
      @if (sentiment().length || efficiency().length) {
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
      }

      <!-- Row 3: Impact by Type (full width) -->
      @if (impactByType().length) {
        <div class='mb-6'>
          <app-impact-by-meeting-type [data]='impactByType()' />
        </div>
      }

      <!-- Row 4: Impact by Time (full width) -->
      @if (impactByTime().length) {
        <div class='mb-6'>
          <app-impact-by-time-of-day [data]='impactByTime()' />
        </div>
      }

      <!-- Row 5: Qualitative Themes (full width) -->
      @if (themes().length) {
        <div class='mb-6'>
          <app-qualitative-themes [data]='themes()' />
        </div>
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
      this.service.getQualitativeThemes(start, end).subscribe((d) => this.themes.set(d));
    });
  }
}
