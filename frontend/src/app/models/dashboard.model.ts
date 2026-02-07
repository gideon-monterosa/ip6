export interface WeeklyMeetings {
  weeks: WeekData[];
  summary: MeetingSummary;
}

export interface WeekData {
  label: string;
  meetings: number;
  hours: number;
}

export interface MeetingSummary {
  thisWeek: number;
  lastWeek: number;
  totalHoursThisWeek: number;
  totalHoursLastWeek: number;
  avgDurationMinutes: number;
  avgDurationLastWeek: number;
  totalAttendees: number;
  totalAttendeesLastWeek: number;
}

export interface MeetingsByDay {
  days: DayData[];
}

export interface DayData {
  day: string;
  count: number;
}

export interface MeetingsDuration {
  breakdown: DurationData[];
}

export interface DurationData {
  label: string;
  count: number;
}

export interface UpcomingMeetingsResponse {
  meetings: UpcomingMeeting[];
}

export interface UpcomingMeeting {
  id: number;
  title: string;
  date: string;
  duration: number;
  attendees: string[];
}
