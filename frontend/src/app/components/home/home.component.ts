import { Component, OnInit, signal } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { DashboardService } from "../../services/dashboard.service";
import { User } from "../../models/auth.model";
import {
  WeekData,
  MeetingSummary,
  DayData,
  DurationData,
  UpcomingMeeting,
} from "../../models/dashboard.model";
import { StatCardComponent } from "../dashboard/stat-card.component";
import { MeetingsTrendChartComponent } from "../dashboard/meetings-trend-chart.component";
import { MeetingsByDayChartComponent } from "../dashboard/meetings-by-day-chart.component";
import { DurationBreakdownChartComponent } from "../dashboard/duration-breakdown-chart.component";
import { UpcomingMeetingsComponent } from "../dashboard/upcoming-meetings.component";
import { forkJoin } from "rxjs";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [
    StatCardComponent,
    MeetingsTrendChartComponent,
    MeetingsByDayChartComponent,
    DurationBreakdownChartComponent,
    UpcomingMeetingsComponent,
  ],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent implements OnInit {
  currentUser = signal<User | null>(null);
  weeks = signal<WeekData[]>([]);
  summary = signal<MeetingSummary | null>(null);
  days = signal<DayData[]>([]);
  durations = signal<DurationData[]>([]);
  upcomingMeetings = signal<UpcomingMeeting[]>([]);

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe((user: User | null) => {
      this.currentUser.set(user);
    });

    forkJoin({
      weekly: this.dashboardService.getWeeklyMeetings(),
      byDay: this.dashboardService.getMeetingsByDay(),
      duration: this.dashboardService.getMeetingsDuration(),
      upcoming: this.dashboardService.getUpcomingMeetings(),
    }).subscribe(({ weekly, byDay, duration, upcoming }) => {
      this.weeks.set(weekly.weeks);
      this.summary.set(weekly.summary);
      this.days.set(byDay.days);
      this.durations.set(duration.breakdown);
      this.upcomingMeetings.set(upcoming.meetings);
    });
  }

  percentChange(current: number, previous: number): number {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  }
}
