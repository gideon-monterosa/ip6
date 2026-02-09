import { Component, OnInit, computed, inject } from "@angular/core";
import { AuthService } from "../../core/services/auth.service";
import { DashboardService } from "./services/dashboard.service";
import {
  WeekData,
  MeetingSummary,
  DayData,
  DurationData,
  UpcomingMeeting,
} from "./models/dashboard.model";
import { StatCardComponent } from "./components/stat-card.component";
import { MeetingsTrendChartComponent } from "./components/meetings-trend-chart.component";
import { MeetingsByDayChartComponent } from "./components/meetings-by-day-chart.component";
import { DurationBreakdownChartComponent } from "./components/duration-breakdown-chart.component";
import { UpcomingMeetingsComponent } from "./components/upcoming-meetings.component";
import { toSignal } from "@angular/core/rxjs-interop";
import { forkJoin } from "rxjs";

@Component({
  selector: "app-dashboard",
  imports: [
    StatCardComponent,
    MeetingsTrendChartComponent,
    MeetingsByDayChartComponent,
    DurationBreakdownChartComponent,
    UpcomingMeetingsComponent,
  ],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.css",
})
export class DashboardComponent implements OnInit {
  // Use inject() for dependency injection
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);

  // Consume currentUser signal directly from AuthService
  currentUser = this.authService.currentUser;

  // Use toSignal to convert Observable to Signal
  dashboardData = toSignal(
    forkJoin({
      weekly: this.dashboardService.getWeeklyMeetings(),
      byDay: this.dashboardService.getMeetingsByDay(),
      duration: this.dashboardService.getMeetingsDuration(),
      upcoming: this.dashboardService.getUpcomingMeetings(),
    }),
    { initialValue: null },
  );

  // Computed signals derived from dashboard data
  weeks = computed<WeekData[]>(() => this.dashboardData()?.weekly.weeks ?? []);
  summary = computed<MeetingSummary | null>(
    () => this.dashboardData()?.weekly.summary ?? null,
  );
  days = computed<DayData[]>(() => this.dashboardData()?.byDay.days ?? []);
  durations = computed<DurationData[]>(
    () => this.dashboardData()?.duration.breakdown ?? [],
  );
  upcomingMeetings = computed<UpcomingMeeting[]>(
    () => this.dashboardData()?.upcoming.meetings ?? [],
  );

  ngOnInit(): void {
    // No subscriptions needed - all data is managed via signals
  }

  percentChange(current: number, previous: number): number {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  }
}
