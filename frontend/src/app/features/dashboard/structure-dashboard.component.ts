import { Component, inject, input, effect, signal } from '@angular/core';
import { StructureDashboardService } from './services/structure-dashboard.service';
import { UserService } from '../../core/services/user.service';
import { StructureKpiSummaryComponent } from './components/structure/structure-kpi-summary.component';
import { MeetingTypeDistributionComponent } from './components/structure/meeting-type-distribution.component';
import { MeetingTimingAnalysisComponent } from './components/structure/meeting-timing-analysis.component';
import { FocusTimeAnalysisComponent } from './components/structure/focus-time-analysis.component';
import { FragmentationScoreComponent } from './components/structure/fragmentation-score.component';
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
  FocusBlockDay,
  FragmentationDay,
} from './models/dashboard.model';

@Component({
  selector: 'app-structure-dashboard',
  imports: [
    StructureKpiSummaryComponent,
    MeetingTypeDistributionComponent,
    MeetingTimingAnalysisComponent,
    FocusTimeAnalysisComponent,
    FragmentationScoreComponent,
    MeetingsTrendChartComponent,
    DurationBreakdownChartComponent
  ],
  template: `
    <div>
      <!-- KPI Summary Row -->
      @if (summary()) {
        <div class='mb-6'>
          <app-structure-kpi-summary [summary]='summary()' />
        </div>
      }

      <!-- Row 2: Daily Overview -->
      @if (summary() && summary()!.totalMeetings > 0) {
        <div class='mb-6'>
          <app-meetings-trend-chart [dailyData]='dailyOverview()' />
        </div>
      }

      <!-- Row 3: Duration Breakdown + Meeting Types -->
      @if (durationBreakdown().length || meetingTypes().length) {
        <div class='grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6'>
          @if (durationBreakdown().length) {
            <app-duration-breakdown-chart [breakdown]='durationBreakdown()' />
          }
          @if (meetingTypes().length) {
            <app-meeting-type-distribution [data]='meetingTypes()' />
          }
        </div>
      }

      <!-- Row 4: Timing Analysis + Focus Time + Fragmentation -->
      @if (weekMeetings().length || focusBlocks().length || fragmentation().length) {
        <div class='grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6'>
          @if (weekMeetings().length) {
            <app-meeting-timing-analysis [meetings]='weekMeetings()' [settings]='userSettings()' />
          }
          <div class='grid gap-4 sm:gap-6'>
            @if (focusBlocks().length) {
              <app-focus-time-analysis [data]='focusBlocks()' />
            }
            @if (fragmentation().length) {
              <app-fragmentation-score [data]='fragmentation()' />
            }
          </div>
        </div>
      }
    </div>
  `,
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
  focusBlocks = signal<FocusBlockDay[]>([]);
  fragmentation = signal<FragmentationDay[]>([]);
  userSettings = signal<UserSettings | null>(null);

  constructor() {
    this.userService.getSettings().subscribe(s => this.userSettings.set(s));

    effect(() => {
      const start = this.weekStart();
      const end = this.weekEnd();

      this.service.getStructureSummary(start, end).subscribe((d) => this.summary.set(d));
      this.service.getDailyOverview(start, end).subscribe((d) => this.dailyOverview.set(d));
      this.service.getDurationBreakdown(start, end).subscribe((d) => this.durationBreakdown.set(d));
      this.service.getWeekMeetings(start, end).subscribe((d) => this.weekMeetings.set(d));
      this.service.getMeetingTypeDistribution(start, end).subscribe((d) => this.meetingTypes.set(d));
      this.service.getTimingAnalysis(start, end).subscribe((d) => this.timing.set(d));
      this.service.getFocusBlocks(start, end).subscribe((d) => this.focusBlocks.set(d));
      this.service.getFragmentationScores(start, end).subscribe((d) => this.fragmentation.set(d));
    });
  }
}
