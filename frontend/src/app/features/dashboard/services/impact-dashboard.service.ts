import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, forkJoin, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  RawFeedback,
  RawMeeting,
  ImpactSummaryWeek,
  ImpactByType,
  ImpactByTime,
  EfficiencyBucket,
  SentimentBucket,
  ThemeFrequency,
  DisruptionDay,
  DurationEfficiency,
  ImpactTimelineHour,
} from '../models/dashboard.model';
import { isDateInWeek, toDateString } from '../utils/week.utils';
import { UserSettings } from '../../../core/models/user.model';
import { parseLocal } from '../../../core/utils/date.utils';

@Injectable({ providedIn: 'root' })
export class ImpactDashboardService {
  private http = inject(HttpClient);

  private feedback$ = this.http
    .get<{ feedback: RawFeedback[] }>(`${environment.apiUrl}/api/dashboard/impact/feedback`)
    .pipe(
      map((res) => res.feedback),
      shareReplay(1),
    );

  private meetings$ = this.http
    .get<{ meetings: RawMeeting[] }>(`${environment.apiUrl}/api/dashboard/structure/meetings`)
    .pipe(
      map((res) => res.meetings),
      shareReplay(1),
    );

  private focusDisruption$ = this.http
    .get<{ disruption: DisruptionDay[] }>(`${environment.apiUrl}/api/dashboard/impact/focus-disruption`)
    .pipe(
      map((res) => res.disruption),
      shareReplay(1),
    );

  private filterFeedback(feedback: RawFeedback[], weekStart: Date, weekEnd: Date): RawFeedback[] {
    return feedback.filter((f) => isDateInWeek(f.meeting_start_time, weekStart, weekEnd));
  }

  private filterMeetings(meetings: RawMeeting[], weekStart: Date, weekEnd: Date): RawMeeting[] {
    return meetings.filter((m) => isDateInWeek(m.start_time, weekStart, weekEnd));
  }

  private emotionalScore(impact: string): number {
    switch (impact) {
      case 'motivated': return 1;
      case 'neutral': return 0;
      case 'stressed': return -1;
      default: return 0;
    }
  }

  private computeImpactStats(feedback: RawFeedback[]) {
    if (feedback.length === 0) {
      return {
        avgEfficiency: 0,
        avgEmotionalScore: 0,
        avgEnergyAfter: 0,
        percentageValuable: 0,
      };
    }
    const total = feedback.length;
    const sumEfficiency = feedback.reduce((s, f) => s + f.perceived_efficiency, 0);
    const sumEmotional = feedback.reduce((s, f) => s + this.emotionalScore(f.emotional_impact), 0);
    const sumEnergy = feedback.reduce((s, f) => s + f.energy_after_meeting, 0);
    const valuable = feedback.filter((f) => f.perceived_value).length;

    return {
      avgEfficiency: Math.round((sumEfficiency / total) * 10) / 10,
      avgEmotionalScore: Math.round((sumEmotional / total) * 100) / 100,
      avgEnergyAfter: Math.round((sumEnergy / total) * 10) / 10,
      percentageValuable: Math.round((valuable / total) * 1000) / 10,
    };
  }

  getImpactSummary(weekStart: Date, weekEnd: Date): Observable<ImpactSummaryWeek> {
    const prevStart = new Date(weekStart);
    prevStart.setDate(prevStart.getDate() - 7);
    const prevEnd = new Date(weekEnd);
    prevEnd.setDate(prevEnd.getDate() - 7);

    return this.feedback$.pipe(
      map((feedback) => {
        const current = this.filterFeedback(feedback, weekStart, weekEnd);
        const prev = this.filterFeedback(feedback, prevStart, prevEnd);

        const curr = this.computeImpactStats(current);
        const previous = this.computeImpactStats(prev);

        return {
          ...curr,
          prevAvgEfficiency: previous.avgEfficiency,
          prevAvgEmotionalScore: previous.avgEmotionalScore,
          prevAvgEnergyAfter: previous.avgEnergyAfter,
          prevPercentageValuable: previous.percentageValuable,
        };
      }),
    );
  }

  getImpactByType(weekStart: Date, weekEnd: Date): Observable<ImpactByType[]> {
    return this.feedback$.pipe(
      map((feedback) => {
        const filtered = this.filterFeedback(feedback, weekStart, weekEnd);
        if (filtered.length === 0) return [];

        const groups = new Map<string, RawFeedback[]>();
        for (const f of filtered) {
          const arr = groups.get(f.meeting_type) ?? [];
          arr.push(f);
          groups.set(f.meeting_type, arr);
        }

        return Array.from(groups.entries()).map(([type, entries]) => {
          const n = entries.length;
          return {
            type,
            avgEfficiency: Math.round(entries.reduce((s, e) => s + e.perceived_efficiency, 0) / n * 10) / 10,
            avgEmotional: Math.round(entries.reduce((s, e) => s + this.emotionalScore(e.emotional_impact), 0) / n * 100) / 100,
            avgEnergy: Math.round(entries.reduce((s, e) => s + e.energy_after_meeting, 0) / n * 10) / 10,
            avgDisruption: Math.round(entries.reduce((s, e) => s + e.perceived_focus_disruption, 0) / n * 10) / 10,
          };
        });
      }),
    );
  }

  getImpactByTime(weekStart: Date, weekEnd: Date): Observable<ImpactByTime[]> {
    return this.feedback$.pipe(
      map((feedback) => {
        const filtered = this.filterFeedback(feedback, weekStart, weekEnd);
        if (filtered.length === 0) return [];

        const groups = new Map<string, RawFeedback[]>();
        for (const f of filtered) {
          const arr = groups.get(f.time_of_day_bucket) ?? [];
          arr.push(f);
          groups.set(f.time_of_day_bucket, arr);
        }

        const bucketOrder = ['Morning', 'Midday', 'Afternoon'];
        return bucketOrder
          .filter((b) => groups.has(b))
          .map((timeOfDay) => {
            const entries = groups.get(timeOfDay)!;
            const n = entries.length;
            return {
              timeOfDay,
              avgEfficiency: Math.round(entries.reduce((s, e) => s + e.perceived_efficiency, 0) / n * 10) / 10,
              avgEmotional: Math.round(entries.reduce((s, e) => s + this.emotionalScore(e.emotional_impact), 0) / n * 100) / 100,
              avgDisruption: Math.round(entries.reduce((s, e) => s + e.perceived_focus_disruption, 0) / n * 10) / 10,
            };
          });
      }),
    );
  }

  getEfficiencyDistribution(weekStart: Date, weekEnd: Date): Observable<EfficiencyBucket[]> {
    return this.feedback$.pipe(
      map((feedback) => {
        const filtered = this.filterFeedback(feedback, weekStart, weekEnd);
        if (filtered.length === 0) return [];

        const counts = new Map<number, number>();
        for (const f of filtered) {
          counts.set(f.perceived_efficiency, (counts.get(f.perceived_efficiency) ?? 0) + 1);
        }
        const total = filtered.length;

        return [1, 2, 3, 4, 5].map((scale) => ({
          scale,
          count: counts.get(scale) ?? 0,
          percentage: Math.round(((counts.get(scale) ?? 0) / total) * 1000) / 10,
        }));
      }),
    );
  }

  getSentimentDistribution(weekStart: Date, weekEnd: Date): Observable<SentimentBucket[]> {
    return this.feedback$.pipe(
      map((feedback) => {
        const filtered = this.filterFeedback(feedback, weekStart, weekEnd);
        if (filtered.length === 0) return [];

        const counts = new Map<string, number>();
        for (const f of filtered) {
          counts.set(f.emotional_impact, (counts.get(f.emotional_impact) ?? 0) + 1);
        }
        const total = filtered.length;

        return ['stressed', 'neutral', 'motivated'].map((sentiment) => ({
          sentiment,
          count: counts.get(sentiment) ?? 0,
          percentage: Math.round(((counts.get(sentiment) ?? 0) / total) * 1000) / 10,
        }));
      }),
    );
  }

  getQualitativeThemes(weekStart: Date, weekEnd: Date): Observable<ThemeFrequency[]> {
    return this.feedback$.pipe(
      map((feedback) => {
        const filtered = this.filterFeedback(feedback, weekStart, weekEnd);
        if (filtered.length === 0) return [];

        const counts = new Map<string, number>();
        for (const f of filtered) {
          if (f.themes) {
            for (const theme of f.themes) {
              counts.set(theme, (counts.get(theme) ?? 0) + 1);
            }
          }
        }

        return Array.from(counts.entries())
          .map(([theme, frequency]) => ({ theme, frequency }))
          .sort((a, b) => b.frequency - a.frequency);
      }),
    );
  }

  getFocusDisruption(weekStart: Date, weekEnd: Date): Observable<DisruptionDay[]> {
    const startStr = toDateString(weekStart);
    const endStr = toDateString(new Date(weekEnd));

    return this.focusDisruption$.pipe(
      map((data) =>
        data.filter((d) => d.date >= startStr && d.date <= endStr),
      ),
    );
  }

  getImpactTimeline(weekStart: Date, weekEnd: Date, settings: UserSettings | null): Observable<ImpactTimelineHour[]> {
    if (!settings) return of([]);

    return forkJoin({
      meetings: this.meetings$,
      feedback: this.feedback$,
    }).pipe(
      map(({ meetings, feedback }) => {
        const filteredFeedback = this.filterFeedback(feedback, weekStart, weekEnd);
        const filteredMeetings = this.filterMeetings(meetings, weekStart, weekEnd);

        const feedbackMap = new Map<string, RawFeedback>();
        for (const f of filteredFeedback) {
          feedbackMap.set(f.meeting_id, f);
        }

        const [startH] = settings.workStartTime.split(':').map(Number);
        const [endH] = settings.workEndTime.split(':').map(Number);

        interface HourBucket {
          count: number;
          sumEfficiency: number;
          sumEmotional: number;
          sumEnergy: number;
          sumDisruption: number;
        }

        const createEmptyBucket = (): HourBucket => ({
          count: 0, sumEfficiency: 0, sumEmotional: 0, sumEnergy: 0, sumDisruption: 0
        });

        const beforeWorkBucket = createEmptyBucket();
        const afterWorkBucket = createEmptyBucket();
        const hourlyBuckets = new Map<number, HourBucket>();
        
        for (let h = startH; h < endH; h++) {
          hourlyBuckets.set(h, createEmptyBucket());
        }

        const addFeedbackToBucket = (b: HourBucket, f: RawFeedback) => {
          b.count++;
          b.sumEfficiency += f.perceived_efficiency;
          b.sumEmotional += this.emotionalScore(f.emotional_impact);
          b.sumEnergy += f.energy_after_meeting;
          b.sumDisruption += f.perceived_focus_disruption;
        };

        for (const m of filteredMeetings) {
          const f = feedbackMap.get(m.meeting_id);
          if (!f) continue;

          const mStart = parseLocal(m.start_time);
          const mEnd = parseLocal(m.end_time);
          
          const workStart = new Date(mStart);
          workStart.setHours(startH, 0, 0, 0);
          
          const workEnd = new Date(mStart);
          workEnd.setHours(endH, 0, 0, 0);

          if (mStart < workStart) {
            addFeedbackToBucket(beforeWorkBucket, f);
          }

          if (mEnd > workEnd) {
            addFeedbackToBucket(afterWorkBucket, f);
          }

          for (let h = startH; h < endH; h++) {
            const bucketStart = new Date(mStart);
            bucketStart.setHours(h, 0, 0, 0);
            
            const bucketEnd = new Date(mStart);
            bucketEnd.setHours(h + 1, 0, 0, 0);

            if (mStart < bucketEnd && mEnd > bucketStart) {
              addFeedbackToBucket(hourlyBuckets.get(h)!, f);
            }
          }
        }

        const formatBucket = (label: string, b: HourBucket): ImpactTimelineHour => {
          if (b.count === 0) {
            return { label, avgEfficiency: null, avgEmotional: null, avgEnergy: null, avgDisruption: null } as any;
          }
          return {
            hour: label,
            avgEfficiency: Math.round((b.sumEfficiency / b.count) * 10) / 10,
            avgEmotional: Math.round((b.sumEmotional / b.count) * 100) / 100,
            avgEnergy: Math.round((b.sumEnergy / b.count) * 10) / 10,
            avgDisruption: Math.round((b.sumDisruption / b.count) * 10) / 10,
          };
        };

        const result: ImpactTimelineHour[] = [];
        
        result.push(formatBucket('Before Work', beforeWorkBucket));

        for (let h = startH; h < endH; h++) {
          const label = `${h.toString().padStart(2, '0')}:00 - ${(h + 1).toString().padStart(2, '0')}:00`;
          result.push(formatBucket(label, hourlyBuckets.get(h)!));
        }

        result.push(formatBucket('After Work', afterWorkBucket));

        return result;
      }),
    );
  }
}
