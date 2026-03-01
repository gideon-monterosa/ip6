import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  RawMeeting,
  DailyOverviewData,
  DayData,
  DurationData,
  WeekMeeting,
  StructureSummaryWeek,
  TypeDistribution,
  RecurringRatioData,
  TimingBucket,
  FocusBlockDay,
  FragmentationDay,
} from '../models/dashboard.model';
import { isDateInWeek, getWeekDayLabels, toDateString } from '../utils/week.utils';

@Injectable({ providedIn: 'root' })
export class StructureDashboardService {
  private http = inject(HttpClient);

  private meetings$ = this.http
    .get<{ meetings: RawMeeting[] }>(`${environment.apiUrl}/api/dashboard/structure/meetings`)
    .pipe(
      map((res) => res.meetings),
      shareReplay(1),
    );

  private focusBlocks$ = this.http
    .get<{ focusBlocks: FocusBlockDay[] }>(`${environment.apiUrl}/api/dashboard/structure/focus-blocks`)
    .pipe(
      map((res) => res.focusBlocks),
      shareReplay(1),
    );

  private fragmentationScores$ = this.http
    .get<{ scores: FragmentationDay[] }>(`${environment.apiUrl}/api/dashboard/structure/fragmentation-scores`)
    .pipe(
      map((res) => res.scores),
      shareReplay(1),
    );

  private filterMeetings(meetings: RawMeeting[], weekStart: Date, weekEnd: Date): RawMeeting[] {
    return meetings.filter((m) => isDateInWeek(m.start_time, weekStart, weekEnd));
  }

  getStructureSummary(weekStart: Date, weekEnd: Date): Observable<StructureSummaryWeek> {
    const prevStart = new Date(weekStart);
    prevStart.setDate(prevStart.getDate() - 7);
    const prevEnd = new Date(weekEnd);
    prevEnd.setDate(prevEnd.getDate() - 7);

    return this.meetings$.pipe(
      map((meetings) => {
        const current = this.filterMeetings(meetings, weekStart, weekEnd);
        const prev = this.filterMeetings(meetings, prevStart, prevEnd);

        const computeStats = (ms: RawMeeting[]) => {
          const totalMinutes = ms.reduce((sum, m) => sum + m.duration_minutes, 0);
          const uniqueDays = new Set(ms.map((m) => m.start_time.split('T')[0])).size;
          return {
            totalMeetings: ms.length,
            totalHours: Math.round((totalMinutes / 60) * 10) / 10,
            avgDuration: ms.length > 0 ? Math.round(totalMinutes / ms.length) : 0,
            avgMeetingsPerDay: uniqueDays > 0
              ? Math.round((ms.length / uniqueDays) * 10) / 10
              : 0,
          };
        };

        const curr = computeStats(current);
        const previous = computeStats(prev);

        return {
          ...curr,
          prevTotalMeetings: previous.totalMeetings,
          prevTotalHours: previous.totalHours,
          prevAvgDuration: previous.avgDuration,
          prevAvgMeetingsPerDay: previous.avgMeetingsPerDay,
        };
      }),
    );
  }

  getDailyOverview(weekStart: Date, weekEnd: Date): Observable<DailyOverviewData[]> {
    const labels = getWeekDayLabels(weekStart);

    return this.meetings$.pipe(
      map((meetings) => {
        const filtered = this.filterMeetings(meetings, weekStart, weekEnd);
        return labels.map((label, i) => {
          const dayDate = new Date(weekStart);
          dayDate.setDate(dayDate.getDate() + i);
          const dateStr = toDateString(dayDate);

          const dayMeetings = filtered.filter(
            (m) => m.start_time.split('T')[0] === dateStr,
          );
          return {
            day: label,
            meetings: dayMeetings.length,
            hours: Math.round(
              dayMeetings.reduce((s, m) => s + m.duration_minutes, 0) / 60 * 10,
            ) / 10,
          };
        });
      }),
    );
  }

  getMeetingsByDay(weekStart: Date, weekEnd: Date): Observable<DayData[]> {
    const labels = getWeekDayLabels(weekStart);

    return this.meetings$.pipe(
      map((meetings) => {
        const filtered = this.filterMeetings(meetings, weekStart, weekEnd);
        return labels.map((label, i) => {
          const dayDate = new Date(weekStart);
          dayDate.setDate(dayDate.getDate() + i);
          const dateStr = toDateString(dayDate);

          const count = filtered.filter(
            (m) => m.start_time.split('T')[0] === dateStr,
          ).length;
          return { day: label, count };
        });
      }),
    );
  }

  getDurationBreakdown(weekStart: Date, weekEnd: Date): Observable<DurationData[]> {
    return this.meetings$.pipe(
      map((meetings) => {
        const filtered = this.filterMeetings(meetings, weekStart, weekEnd);
        if (filtered.length === 0) return [];

        let short = 0;
        let medium = 0;
        let long = 0;
        for (const m of filtered) {
          if (m.duration_minutes < 30) short++;
          else if (m.duration_minutes <= 60) medium++;
          else long++;
        }

        return [
          { label: 'Short (< 30 min)', count: short },
          { label: 'Medium (30–60 min)', count: medium },
          { label: 'Long (> 60 min)', count: long },
        ].filter((d) => d.count > 0);
      }),
    );
  }

  getWeekMeetings(weekStart: Date, weekEnd: Date): Observable<WeekMeeting[]> {
    return this.meetings$.pipe(
      map((meetings) => {
        const filtered = this.filterMeetings(meetings, weekStart, weekEnd);
        return filtered
          .map((m) => ({
            id: m.meeting_id,
            title: `${m.meeting_type} – ${m.organizer}`,
            startTime: m.start_time,
            endTime: m.end_time,
            durationMinutes: m.duration_minutes,
            meetingType: m.meeting_type,
            organizer: m.organizer,
            participants: m.number_of_participants,
            recurring: m.recurring,
            dayOfWeek: m.day_of_week,
            timeOfDayBucket: m.time_of_day_bucket,
          }))
          .sort(
            (a, b) =>
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
          );
      }),
    );
  }

  getMeetingTypeDistribution(weekStart: Date, weekEnd: Date): Observable<TypeDistribution[]> {
    return this.meetings$.pipe(
      map((meetings) => {
        const filtered = this.filterMeetings(meetings, weekStart, weekEnd);
        if (filtered.length === 0) return [];

        const counts = new Map<string, number>();
        for (const m of filtered) {
          counts.set(m.meeting_type, (counts.get(m.meeting_type) ?? 0) + 1);
        }
        const total = filtered.length;
        return Array.from(counts.entries()).map(([type, count]) => ({
          type,
          count,
          percentage: Math.round((count / total) * 1000) / 10,
        }));
      }),
    );
  }

  getRecurringRatio(weekStart: Date, weekEnd: Date): Observable<RecurringRatioData> {
    return this.meetings$.pipe(
      map((meetings) => {
        const filtered = this.filterMeetings(meetings, weekStart, weekEnd);
        const recurring = filtered.filter((m) => m.recurring).length;
        const adHoc = filtered.length - recurring;
        return {
          recurringCount: recurring,
          adHocCount: adHoc,
          recurringPercentage:
            filtered.length > 0
              ? Math.round((recurring / filtered.length) * 1000) / 10
              : 0,
        };
      }),
    );
  }

  getTimingAnalysis(weekStart: Date, weekEnd: Date): Observable<TimingBucket[]> {
    return this.meetings$.pipe(
      map((meetings) => {
        const filtered = this.filterMeetings(meetings, weekStart, weekEnd);
        if (filtered.length === 0) return [];

        const counts = new Map<string, number>();
        for (const m of filtered) {
          counts.set(
            m.time_of_day_bucket,
            (counts.get(m.time_of_day_bucket) ?? 0) + 1,
          );
        }
        const total = filtered.length;
        const bucketOrder = ['Morning', 'Midday', 'Afternoon'];
        return bucketOrder
          .filter((b) => counts.has(b))
          .map((timeOfDay) => ({
            timeOfDay,
            count: counts.get(timeOfDay) ?? 0,
            percentage:
              Math.round(((counts.get(timeOfDay) ?? 0) / total) * 1000) / 10,
          }));
      }),
    );
  }

  getFocusBlocks(weekStart: Date, weekEnd: Date): Observable<FocusBlockDay[]> {
    const startStr = toDateString(weekStart);
    const endStr = toDateString(new Date(weekEnd));

    return this.focusBlocks$.pipe(
      map((blocks) =>
        blocks.filter((b) => b.date >= startStr && b.date <= endStr),
      ),
    );
  }

  getFragmentationScores(weekStart: Date, weekEnd: Date): Observable<FragmentationDay[]> {
    const startStr = toDateString(weekStart);
    const endStr = toDateString(new Date(weekEnd));

    return this.fragmentationScores$.pipe(
      map((scores) =>
        scores.filter((s) => s.date >= startStr && s.date <= endStr),
      ),
    );
  }
}
