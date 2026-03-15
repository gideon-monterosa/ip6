import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  RawMeeting,
  DailyOverviewData,
  DayData,
  DurationData,
  WeekMeeting,
  StructureSummaryWeek,
  TypeDistribution,
  TimingBucket,
  FlowBlockDay,
  FragmentationDay,
  DailyFlowScore,
  FlowBlock,
} from '../models/dashboard.model';
import { isDateInWeek, getWeekDayLabels, toDateString } from '../utils/week.utils';

import { parseLocal } from '../../../core/utils/date.utils';
import { UserSettings } from '../../../core/models/user.model';

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
    .get<{ focusBlocks: FlowBlockDay[] }>(`${environment.apiUrl}/api/dashboard/structure/focus-blocks`)
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
            (m) => m.start_time.replace('T', ' ').split(' ')[0] === dateStr,
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
            (m) => m.start_time.replace('T', ' ').split(' ')[0] === dateStr,
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
              parseLocal(a.startTime).getTime() - parseLocal(b.startTime).getTime(),
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

  getFlowBlocks(weekStart: Date, weekEnd: Date): Observable<FlowBlockDay[]> {
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

  getDailyFlowScores(
    weekStart: Date,
    weekEnd: Date,
    settings: UserSettings | null,
  ): Observable<DailyFlowScore[]> {
    if (!settings) return of([]);

    const labels = getWeekDayLabels(weekStart);

    return this.meetings$.pipe(
      map((meetings) => {
        const filtered = this.filterMeetings(meetings, weekStart, weekEnd);

        return labels.map((_, i) => {
          const dayDate = new Date(weekStart);
          dayDate.setDate(dayDate.getDate() + i);
          const dateStr = toDateString(dayDate);

          const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
          const dayOfWeek = days[dayDate.getDay()];
          const isWorkingDay = settings.workingDays.includes(dayOfWeek);

          if (!isWorkingDay) {
            return {
              date: dateStr,
              score: 0,
              totalWorkingMinutes: 0,
              effectiveFlowMinutes: 0,
              potentialScore: 0,
              blocks: [],
            };
          }

          const [startH, startM] = settings.workStartTime.split(':').map(Number);
          const [endH, endM] = settings.workEndTime.split(':').map(Number);

          const workStart = new Date(dayDate);
          workStart.setHours(startH, startM, 0, 0);

          const workEnd = new Date(dayDate);
          workEnd.setHours(endH, endM, 0, 0);

          const totalWorkingMinutes = (workEnd.getTime() - workStart.getTime()) / (1000 * 60);

          const dayMeetings = filtered
            .filter((m) => m.start_time.replace('T', ' ').split(' ')[0] === dateStr)
            .map((m) => {
              const mStart = parseLocal(m.start_time);
              const mEnd = parseLocal(m.end_time);

              const clippedStart = new Date(Math.max(mStart.getTime(), workStart.getTime()));
              const clippedEnd = new Date(Math.min(mEnd.getTime(), workEnd.getTime()));

              return { start: clippedStart, end: clippedEnd };
            })
            .filter((m) => m.start.getTime() < m.end.getTime())
            .sort((a, b) => a.start.getTime() - b.start.getTime());

          const mergedMeetings: { start: Date; end: Date }[] = [];
          if (dayMeetings.length > 0) {
            let current = { start: dayMeetings[0].start, end: dayMeetings[0].end };
            for (let j = 1; j < dayMeetings.length; j++) {
              const next = dayMeetings[j];
              if (next.start.getTime() <= current.end.getTime()) {
                current.end = new Date(Math.max(current.end.getTime(), next.end.getTime()));
              } else {
                mergedMeetings.push(current);
                current = { start: next.start, end: next.end };
              }
            }
            mergedMeetings.push(current);
          }

          const blocks: FlowBlock[] = [];
          let currentTime = workStart.getTime();
          let effectiveFlowMinutes = 0;
          let totalMeetingMinutes = 0;
          const FLOW_ENTRY_COST = 25;
          let hasPriorMeeting = false;

          for (const m of mergedMeetings) {
            if (m.start.getTime() > currentTime) {
              const gapDuration = (m.start.getTime() - currentTime) / (1000 * 60);
              const cost = hasPriorMeeting ? FLOW_ENTRY_COST : 0;
              const effective = Math.max(0, gapDuration - cost);

              const type = gapDuration < 30 ? 'GAP_MINIMAL' : gapDuration < 60 ? 'GAP_SHORT' : gapDuration < 120 ? 'GAP_MEDIUM' : 'GAP_LARGE';

              blocks.push({
                type: type,
                startTime: new Date(currentTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                endTime: m.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                durationMinutes: gapDuration,
                factor: 1.0,
                effectiveMinutes: effective,
                costMinutes: cost,
              });

              effectiveFlowMinutes += effective;
            }

            const meetingDuration = (m.end.getTime() - m.start.getTime()) / (1000 * 60);
            blocks.push({
              type: 'MEETING',
              startTime: m.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              endTime: m.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              durationMinutes: meetingDuration,
              factor: 0,
              effectiveMinutes: 0,
              costMinutes: 0,
            });
            totalMeetingMinutes += meetingDuration;
            currentTime = m.end.getTime();
            hasPriorMeeting = true;
          }

          if (currentTime < workEnd.getTime()) {
            const gapDuration = (workEnd.getTime() - currentTime) / (1000 * 60);
            const cost = hasPriorMeeting ? FLOW_ENTRY_COST : 0;
            const effective = Math.max(0, gapDuration - cost);

            const type = gapDuration < 30 ? 'GAP_MINIMAL' : gapDuration < 60 ? 'GAP_SHORT' : gapDuration < 120 ? 'GAP_MEDIUM' : 'GAP_LARGE';

            blocks.push({
              type: type,
              startTime: new Date(currentTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              endTime: workEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              durationMinutes: gapDuration,
              factor: 1.0,
              effectiveMinutes: effective,
              costMinutes: cost,
            });

            effectiveFlowMinutes += effective;
          }

          const totalFreeMinutes = totalWorkingMinutes - totalMeetingMinutes;
          const score = totalFreeMinutes > 0 ? (effectiveFlowMinutes / totalFreeMinutes) * 100 : 0;

          const potentialScore = totalFreeMinutes > 0 ? 100 : 0;

          return {
            date: dateStr,
            score: Math.round(score),
            totalWorkingMinutes,
            effectiveFlowMinutes: Math.round(effectiveFlowMinutes),
            potentialScore: Math.round(potentialScore),
            blocks,
          };
        });
      }),
    );
  }
}
