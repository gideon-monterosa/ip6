import { Injectable } from '@angular/core';
import { Meeting } from '../models/structure.model';
import { MeetingFeedback } from '../models/impact.model';
import { MeetingType, TimeOfDayBucket, FilterState } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class DataProcessorService {
  filterMeetings(meetings: Meeting[], filters: FilterState): Meeting[] {
    return meetings.filter((m) => {
      const meetingDate = m.start_time.split('T')[0];
      const inDateRange =
        meetingDate >= filters.dateRange.startDate &&
        meetingDate <= filters.dateRange.endDate;
      const inMeetingType = filters.meetingTypes.includes(m.meeting_type);
      const inTimeOfDay = filters.timeOfDay.includes(m.time_of_day_bucket);
      return inDateRange && inMeetingType && inTimeOfDay;
    });
  }

  filterFeedback(feedback: MeetingFeedback[], filters: FilterState): MeetingFeedback[] {
    return feedback.filter((f) => {
      const feedbackDate = f.feedback_timestamp.split('T')[0];
      const inDateRange =
        feedbackDate >= filters.dateRange.startDate &&
        feedbackDate <= filters.dateRange.endDate;
      const inMeetingType = filters.meetingTypes.includes(f.meeting_type);
      const inTimeOfDay = filters.timeOfDay.includes(f.time_of_day_bucket);
      return inDateRange && inMeetingType && inTimeOfDay;
    });
  }

  aggregateByMeetingType(meetings: Meeting[]): { type: MeetingType; count: number; percentage: number }[] {
    const counts = new Map<MeetingType, number>();
    for (const m of meetings) {
      counts.set(m.meeting_type, (counts.get(m.meeting_type) ?? 0) + 1);
    }
    const total = meetings.length;
    return Object.values(MeetingType).map((type) => ({
      type,
      count: counts.get(type) ?? 0,
      percentage: total > 0 ? Math.round(((counts.get(type) ?? 0) / total) * 1000) / 10 : 0,
    }));
  }

  aggregateByTimeOfDay(meetings: Meeting[]): { timeOfDay: TimeOfDayBucket; count: number; percentage: number }[] {
    const counts = new Map<TimeOfDayBucket, number>();
    for (const m of meetings) {
      counts.set(m.time_of_day_bucket, (counts.get(m.time_of_day_bucket) ?? 0) + 1);
    }
    const total = meetings.length;
    return Object.values(TimeOfDayBucket).map((bucket) => ({
      timeOfDay: bucket,
      count: counts.get(bucket) ?? 0,
      percentage: total > 0 ? Math.round(((counts.get(bucket) ?? 0) / total) * 1000) / 10 : 0,
    }));
  }

  calculateRecurringRatio(meetings: Meeting[]): { recurringCount: number; adHocCount: number; recurringPercentage: number } {
    const recurring = meetings.filter((m) => m.recurring).length;
    const adHoc = meetings.length - recurring;
    return {
      recurringCount: recurring,
      adHocCount: adHoc,
      recurringPercentage: meetings.length > 0 ? Math.round((recurring / meetings.length) * 1000) / 10 : 0,
    };
  }

  calculateSummary(meetings: Meeting[]): {
    totalMeetings: number;
    totalHours: number;
    avgDuration: number;
    avgMeetingsPerDay: number;
  } {
    const totalMinutes = meetings.reduce((sum, m) => sum + m.duration_minutes, 0);
    const uniqueDays = new Set(meetings.map((m) => m.start_time.split('T')[0])).size;
    return {
      totalMeetings: meetings.length,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      avgDuration: meetings.length > 0 ? Math.round(totalMinutes / meetings.length) : 0,
      avgMeetingsPerDay: uniqueDays > 0 ? Math.round((meetings.length / uniqueDays) * 10) / 10 : 0,
    };
  }
}
