import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { FilterService } from './filter.service';
import { DataProcessorService } from './data-processor.service';
import {
  Meeting,
  MeetingsResponse,
  StructureSummary,
  StructureSummaryResponse,
  MeetingTypeCount,
  MeetingTypeDistributionResponse,
  TimingData,
  TimingAnalysisResponse,
  FocusBlock,
  FocusBlocksResponse,
  FragmentationScore,
  FragmentationScoresResponse,
  RecurringRatio,
  RecurringRatioResponse,
} from '../models/structure.model';

@Injectable({ providedIn: 'root' })
export class StructureService {
  private http = inject(HttpClient);
  private filterService = inject(FilterService);
  private dataProcessor = inject(DataProcessorService);
  private basePath = 'mock-data/structure';

  private rawMeetings = signal<Meeting[]>([]);

  readonly filteredMeetings = computed(() => {
    const meetings = this.rawMeetings();
    const filters = this.filterService.activeFilters();
    return this.dataProcessor.filterMeetings(meetings, filters);
  });

  readonly summary = computed<StructureSummary | null>(() => {
    const meetings = this.filteredMeetings();
    if (!meetings.length) return null;
    const calc = this.dataProcessor.calculateSummary(meetings);
    return {
      ...calc,
      totalMeetingsLastWeek: 0,
      totalHoursLastWeek: 0,
      avgDurationLastWeek: 0,
      avgMeetingsPerDayLastWeek: 0,
    };
  });

  readonly meetingTypeDistribution = computed<MeetingTypeCount[]>(() => {
    return this.dataProcessor.aggregateByMeetingType(this.filteredMeetings());
  });

  readonly timingAnalysis = computed<TimingData[]>(() => {
    return this.dataProcessor.aggregateByTimeOfDay(this.filteredMeetings()).map((d) => ({
      timeOfDay: d.timeOfDay,
      count: d.count,
      percentage: d.percentage,
    }));
  });

  readonly recurringRatio = computed<RecurringRatio>(() => {
    return this.dataProcessor.calculateRecurringRatio(this.filteredMeetings());
  });

  loadMeetings(): Observable<MeetingsResponse> {
    return this.http
      .get<MeetingsResponse>(`${this.basePath}/meetings.json`)
      .pipe(tap((res) => this.rawMeetings.set(res.meetings)));
  }

  getSummary(): Observable<StructureSummaryResponse> {
    return this.http.get<StructureSummaryResponse>(
      `${this.basePath}/structure-summary.json`,
    );
  }

  getMeetingTypeDistribution(): Observable<MeetingTypeDistributionResponse> {
    return this.http.get<MeetingTypeDistributionResponse>(
      `${this.basePath}/meeting-type-distribution.json`,
    );
  }

  getTimingAnalysis(): Observable<TimingAnalysisResponse> {
    return this.http.get<TimingAnalysisResponse>(
      `${this.basePath}/timing-analysis.json`,
    );
  }

  getFocusBlocks(): Observable<FocusBlocksResponse> {
    return this.http.get<FocusBlocksResponse>(
      `${this.basePath}/focus-blocks.json`,
    );
  }

  getFragmentationScores(): Observable<FragmentationScoresResponse> {
    return this.http.get<FragmentationScoresResponse>(
      `${this.basePath}/fragmentation-scores.json`,
    );
  }

  getRecurringRatio(): Observable<RecurringRatioResponse> {
    return this.http.get<RecurringRatioResponse>(
      `${this.basePath}/recurring-ratio.json`,
    );
  }
}
