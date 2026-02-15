import { Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { ImpactService } from './services/impact.service';
import { FilterService } from './services/filter.service';
import { FilterPanelComponent } from './components/shared/filter-panel.component';
import { ImpactKpiSummaryComponent } from './components/impact/impact-kpi-summary.component';
import { SentimentDistributionComponent } from './components/impact/sentiment-distribution.component';
import { EfficiencyDistributionComponent } from './components/impact/efficiency-distribution.component';
import { ImpactByMeetingTypeComponent } from './components/impact/impact-by-meeting-type.component';
import { ImpactByTimeOfDayComponent } from './components/impact/impact-by-time-of-day.component';
import { FocusDisruptionPerceptionComponent } from './components/impact/focus-disruption-perception.component';
import { QualitativeThemesComponent } from './components/impact/qualitative-themes.component';

@Component({
  selector: 'app-impact-dashboard',
  imports: [
    FilterPanelComponent,
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
      <!-- Filter Panel -->
      <app-filter-panel />

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
  private impactService = inject(ImpactService);
  private filterService = inject(FilterService);

  private dashboardData = toSignal(
    forkJoin({
      feedback: this.impactService.loadFeedback(),
      summary: this.impactService.getSummary(),
      sentiment: this.impactService.getSentimentDistribution(),
      efficiency: this.impactService.getEfficiencyDistribution(),
      impactByType: this.impactService.getImpactByMeetingType(),
      impactByTime: this.impactService.getImpactByTimeOfDay(),
      focusDisruption: this.impactService.getFocusDisruption(),
      themes: this.impactService.getQualitativeThemes(),
    }),
    { initialValue: null },
  );

  summary = computed(() => this.dashboardData()?.summary.summary ?? null);
  sentiment = computed(() => this.dashboardData()?.sentiment.distribution ?? []);
  efficiency = computed(() => this.dashboardData()?.efficiency.distribution ?? []);
  impactByType = computed(() => this.dashboardData()?.impactByType.impacts ?? []);
  impactByTime = computed(() => this.dashboardData()?.impactByTime.impacts ?? []);
  focusDisruption = computed(() => this.dashboardData()?.focusDisruption.disruption ?? []);
  themes = computed(() => this.dashboardData()?.themes.themes ?? []);
}
