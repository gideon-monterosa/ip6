import { Component, inject, input, effect, signal } from '@angular/core';
import { StructureDashboardService } from './services/structure-dashboard.service';
import { StructureKpiSummaryComponent } from './components/structure/structure-kpi-summary.component';
import { MeetingTypeDistributionComponent } from './components/structure/meeting-type-distribution.component';
import { MeetingTimingAnalysisComponent } from './components/structure/meeting-timing-analysis.component';
import { FocusTimeAnalysisComponent } from './components/structure/focus-time-analysis.component';
import { FragmentationScoreComponent } from './components/structure/fragmentation-score.component';
import { MeetingsTrendChartComponent } from './components/meetings-trend-chart.component';
import { MeetingsByDayChartComponent } from './components/meetings-by-day-chart.component';
import { DurationBreakdownChartComponent } from './components/duration-breakdown-chart.component';
import {
  StructureSummaryWeek,
  DailyOverviewData,
  DayData,
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
    MeetingsByDayChartComponent,
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

      <!-- Row 2: Daily Overview + Meetings by Day -->
      @if (summary() && summary()!.totalMeetings > 0) {
        <div class='grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6'>
          <app-meetings-trend-chart [dailyData]='dailyOverview()' />
          <app-meetings-by-day-chart [days]='meetingsByDay()' />
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
      @if (timing().length || focusBlocks().length || fragmentation().length) {
        <div class='grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6'>
          @if (timing().length) {
            <app-meeting-timing-analysis [data]='timing()' />
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

  weekStart = input.required<Date>();
  weekEnd = input.required<Date>();

  summary = signal<StructureSummaryWeek | null>(null);
  dailyOverview = signal<DailyOverviewData[]>([]);
  meetingsByDay = signal<DayData[]>([]);
  durationBreakdown = signal<DurationData[]>([]);
  weekMeetings = signal<WeekMeeting[]>([]);
  meetingTypes = signal<TypeDistribution[]>([]);
  timing = signal<TimingBucket[]>([]);
  focusBlocks = signal<FocusBlockDay[]>([]);
  fragmentation = signal<FragmentationDay[]>([]);

  constructor() {
    effect(() => {
      const start = this.weekStart();
      const end = this.weekEnd();

      this.service.getStructureSummary(start, end).subscribe((d) => this.summary.set(d));
      this.service.getDailyOverview(start, end).subscribe((d) => this.dailyOverview.set(d));
      this.service.getMeetingsByDay(start, end).subscribe((d) => this.meetingsByDay.set(d));
      this.service.getDurationBreakdown(start, end).subscribe((d) => this.durationBreakdown.set(d));
      this.service.getWeekMeetings(start, end).subscribe((d) => this.weekMeetings.set(d));
      this.service.getMeetingTypeDistribution(start, end).subscribe((d) => this.meetingTypes.set(d));
      this.service.getTimingAnalysis(start, end).subscribe((d) => this.timing.set(d));
      this.service.getFocusBlocks(start, end).subscribe((d) => this.focusBlocks.set(d));
      this.service.getFragmentationScores(start, end).subscribe((d) => this.fragmentation.set(d));
    });
  }
}
