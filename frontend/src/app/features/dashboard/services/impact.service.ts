import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { FilterService } from './filter.service';
import { DataProcessorService } from './data-processor.service';
import {
  MeetingFeedback,
  FeedbackResponse,
  ImpactSummary,
  ImpactSummaryResponse,
  SentimentCount,
  SentimentDistributionResponse,
  EfficiencyDistribution,
  EfficiencyDistributionResponse,
  MeetingTypeImpact,
  ImpactByTypeResponse,
  TimeOfDayImpact,
  ImpactByTimeResponse,
  FocusDisruptionData,
  FocusDisruptionResponse,
  QualitativeTheme,
  QualitativeThemesResponse,
} from '../models/impact.model';

@Injectable({ providedIn: 'root' })
export class ImpactService {
  private http = inject(HttpClient);
  private filterService = inject(FilterService);
  private dataProcessor = inject(DataProcessorService);
  private basePath = 'mock-data/impact';

  private rawFeedback = signal<MeetingFeedback[]>([]);

  readonly filteredFeedback = computed(() => {
    const feedback = this.rawFeedback();
    const filters = this.filterService.activeFilters();
    return this.dataProcessor.filterFeedback(feedback, filters);
  });

  loadFeedback(): Observable<FeedbackResponse> {
    return this.http
      .get<FeedbackResponse>(`${this.basePath}/feedback.json`)
      .pipe(tap((res) => this.rawFeedback.set(res.feedback)));
  }

  getSummary(): Observable<ImpactSummaryResponse> {
    return this.http.get<ImpactSummaryResponse>(
      `${this.basePath}/impact-summary.json`,
    );
  }

  getSentimentDistribution(): Observable<SentimentDistributionResponse> {
    return this.http.get<SentimentDistributionResponse>(
      `${this.basePath}/sentiment-distribution.json`,
    );
  }

  getEfficiencyDistribution(): Observable<EfficiencyDistributionResponse> {
    return this.http.get<EfficiencyDistributionResponse>(
      `${this.basePath}/efficiency-distribution.json`,
    );
  }

  getImpactByMeetingType(): Observable<ImpactByTypeResponse> {
    return this.http.get<ImpactByTypeResponse>(
      `${this.basePath}/impact-by-type.json`,
    );
  }

  getImpactByTimeOfDay(): Observable<ImpactByTimeResponse> {
    return this.http.get<ImpactByTimeResponse>(
      `${this.basePath}/impact-by-time.json`,
    );
  }

  getFocusDisruption(): Observable<FocusDisruptionResponse> {
    return this.http.get<FocusDisruptionResponse>(
      `${this.basePath}/focus-disruption.json`,
    );
  }

  getQualitativeThemes(): Observable<QualitativeThemesResponse> {
    return this.http.get<QualitativeThemesResponse>(
      `${this.basePath}/qualitative-themes.json`,
    );
  }
}
