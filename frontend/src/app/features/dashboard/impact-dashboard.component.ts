import { Component, inject, input, effect, signal } from '@angular/core';
import { ImpactDashboardService } from './services/impact-dashboard.service';
import { UserService } from '../../core/services/user.service';
import { ImpactKpiSummaryComponent } from './components/impact/impact-kpi-summary.component';
import { ImpactByMeetingTypeComponent } from './components/impact/impact-by-meeting-type.component';
import { QualitativeThemesComponent } from './components/impact/qualitative-themes.component';
import { ImpactTimelineChartComponent } from './components/impact/impact-timeline-chart.component';
import { UserSettings } from '../../core/models/user.model';
import {
  ImpactSummaryWeek,
  ImpactByType,
  ThemeFrequency,
  ImpactTimelineHour,
} from './models/dashboard.model';

/**
 * @deprecated This component is being phased out in favor of more streamlined dashboard views.
 */
@Component({
  selector: 'app-impact-dashboard',
  imports: [
    ImpactKpiSummaryComponent,
    ImpactByMeetingTypeComponent,
    QualitativeThemesComponent,
    ImpactTimelineChartComponent,
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

      <!-- Row 2: Impact Timeline -->
      @if (impactTimeline().length) {
        <div class='mb-6'>
          <app-impact-timeline-chart [data]='impactTimeline()' />
        </div>
      }

      <!-- Row 3: Impact by Type (full width) -->
      @if (impactByType().length) {
        <div class='mb-6'>
          <app-impact-by-meeting-type [data]='impactByType()' />
        </div>
      }

      <!-- Row 4: Qualitative Themes (full width) -->
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
  private userService = inject(UserService);

  weekStart = input.required<Date>();
  weekEnd = input.required<Date>();

  summary = signal<ImpactSummaryWeek | null>(null);
  impactByType = signal<ImpactByType[]>([]);
  themes = signal<ThemeFrequency[]>([]);
  impactTimeline = signal<ImpactTimelineHour[]>([]);
  userSettings = signal<UserSettings | null>(null);

  constructor() {
    this.userService.getSettings().subscribe(s => this.userSettings.set(s));

    effect(() => {
      const start = this.weekStart();
      const end = this.weekEnd();
      const settings = this.userSettings();

      this.service.getImpactSummary(start, end).subscribe((d) => this.summary.set(d));
      this.service.getImpactByType(start, end).subscribe((d) => this.impactByType.set(d));
      this.service.getQualitativeThemes(start, end).subscribe((d) => this.themes.set(d));
      
      if (settings) {
        this.service.getImpactTimeline(start, end, settings).subscribe((d) => this.impactTimeline.set(d));
      }
    });
  }
}
