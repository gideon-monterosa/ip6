import { Component, inject, input, effect, signal, computed } from '@angular/core';
import { StructureDashboardService } from './services/structure-dashboard.service';
import { UserService } from '../../core/services/user.service';
import { StructureKpiSummaryComponent } from './components/structure/structure-kpi-summary.component';
import { MeetingTypeDistributionComponent } from './components/structure/meeting-type-distribution.component';
import { MeetingTimingAnalysisComponent } from './components/structure/meeting-timing-analysis.component';
import { DailyFlowScoreComponent } from './components/structure/daily-focus-score.component';
import { MeetingsTrendChartComponent } from './components/meetings-trend-chart.component';
import { DurationBreakdownChartComponent } from './components/duration-breakdown-chart.component';
import { UserSettings } from '../../core/models/user.model';
import {
  StructureSummaryWeek,
  DailyOverviewData,
  DurationData,
  WeekMeeting,
  TypeDistribution,
  TimingBucket,
  DailyFlowScore,
} from './models/dashboard.model';

@Component({
  selector: 'app-structure-dashboard',
  imports: [
    StructureKpiSummaryComponent,
    MeetingTypeDistributionComponent,
    MeetingTimingAnalysisComponent,
    DailyFlowScoreComponent,
    MeetingsTrendChartComponent,
    DurationBreakdownChartComponent
  ],
  template: `
    <div class="flex flex-col gap-10">
      <!-- Row 1: KPI Summary -->
      @if (summary()) {
        <div>
          <app-structure-kpi-summary [summary]='summary()' />
        </div>
      }

      <!-- Row 2: Volume & Trends (Daily Overview) -->
      @if (summary() && summary()!.totalMeetings > 0) {
        <div>
          <app-meetings-trend-chart [dailyData]='dailyOverview()' />
        </div>
      }

      <!-- Row 3: Meeting Characteristics (Type & Duration) -->
      @if (meetingTypes().length || durationBreakdown().length) {
        <div class='grid lg:grid-cols-2 gap-4 sm:gap-6'>
          @if (meetingTypes().length) {
            <app-meeting-type-distribution [data]='meetingTypes()' />
          }
          @if (durationBreakdown().length) {
            <app-duration-breakdown-chart [breakdown]='durationBreakdown()' />
          }
        </div>
      }

      <!-- Row 4: Weekly Timing Profile (Heatmap) -->
      @if (weekMeetings().length) {
        <div>
          <app-meeting-timing-analysis [meetings]='weekMeetings()' [settings]='userSettings()' />
        </div>
      }

      <!-- Row 5: Daily Flow Analysis -->
      @if (dailyFlowScores().length > 0) {
        <app-daily-flow-score [scores]='dailyFlowScores()' />
      }

    </div>
  `
})
export class StructureDashboardComponent {
  private service = inject(StructureDashboardService);
  private userService = inject(UserService);

  weekStart = input.required<Date>();
  weekEnd = input.required<Date>();

  summary = signal<StructureSummaryWeek | null>(null);
  dailyOverview = signal<DailyOverviewData[]>([]);
  durationBreakdown = signal<DurationData[]>([]);
  weekMeetings = signal<WeekMeeting[]>([]);
  meetingTypes = signal<TypeDistribution[]>([]);
  timing = signal<TimingBucket[]>([]);
  dailyFlowScores = signal<DailyFlowScore[]>([]);
  userSettings = signal<UserSettings | null>(null);

  constructor() {
    this.userService.getSettings().subscribe(s => this.userSettings.set(s));

    effect(() => {
      const start = this.weekStart();
      const end = this.weekEnd();
      const settings = this.userSettings();

      this.service.getStructureSummary(start, end).subscribe((d) => this.summary.set(d));
      this.service.getDailyOverview(start, end).subscribe((d) => this.dailyOverview.set(d));
      this.service.getDurationBreakdown(start, end).subscribe((d) => this.durationBreakdown.set(d));
      this.service.getWeekMeetings(start, end).subscribe((d) => this.weekMeetings.set(d));
      this.service.getMeetingTypeDistribution(start, end).subscribe((d) => this.meetingTypes.set(d));
      this.service.getTimingAnalysis(start, end).subscribe((d) => this.timing.set(d));
      this.service.getDailyFlowScores(start, end, settings).subscribe((d) => {
        this.dailyFlowScores.set(d);
      });
    });
  }

  getDayLabel(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' });
  }

  getScoreColor(score: number): string {
    if (score >= 70) return '#16a34a';
    if (score >= 40) return '#eab308';
    return '#dc2626';
  }
}
