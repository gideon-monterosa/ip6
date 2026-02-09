import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  WeeklyMeetings,
  MeetingsByDay,
  MeetingsDuration,
  UpcomingMeetingsResponse,
} from "../models/dashboard.model";

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  private basePath = "mock-data";

  constructor(private http: HttpClient) {}

  getWeeklyMeetings(): Observable<WeeklyMeetings> {
    return this.http.get<WeeklyMeetings>(
      `${this.basePath}/meetings-weekly.json`,
    );
  }

  getMeetingsByDay(): Observable<MeetingsByDay> {
    return this.http.get<MeetingsByDay>(
      `${this.basePath}/meetings-by-day.json`,
    );
  }

  getMeetingsDuration(): Observable<MeetingsDuration> {
    return this.http.get<MeetingsDuration>(
      `${this.basePath}/meetings-duration.json`,
    );
  }

  getUpcomingMeetings(): Observable<UpcomingMeetingsResponse> {
    return this.http.get<UpcomingMeetingsResponse>(
      `${this.basePath}/upcoming-meetings.json`,
    );
  }
}
