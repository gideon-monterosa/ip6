import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FeedbackStatus } from '../models/meeting.model';
import { DailyFeedback, DailyFeedbackDetails } from '../../features/feedback-inbox/models/feedback.model';

@Injectable({
  providedIn: 'root'
})
export class DailyFeedbackService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/daily-feedback`;

  private dailyFeedbacksSignal = signal<DailyFeedback[]>([]);
  public readonly dailyFeedbacks = this.dailyFeedbacksSignal.asReadonly();

  private isLoadingSignal = signal<boolean>(false);
  public readonly isLoading = this.isLoadingSignal.asReadonly();

  loadForDateRange(start: string, end: string): Observable<DailyFeedback[]> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<DailyFeedback[]>(`${this.apiUrl}/range`, { params }).pipe(
      tap(feedbacks => this.dailyFeedbacksSignal.set(feedbacks))
    );
  }

  loadPending(): Observable<DailyFeedback[]> {
    this.isLoadingSignal.set(true);
    return this.http.get<DailyFeedback[]>(`${this.apiUrl}/pending`).pipe(
      tap({
        next: (feedbacks) => {
          this.dailyFeedbacksSignal.set(feedbacks);
          this.isLoadingSignal.set(false);
        },
        error: () => this.isLoadingSignal.set(false)
      })
    );
  }

  submitFeedback(date: string, details: DailyFeedbackDetails): Observable<void> {
    const payload = { details: { ...details, type: 'DAILY' } };
    return this.http.post<void>(`${this.apiUrl}/${date}/submit`, payload).pipe(
      tap(() => this.updateLocalStatus(date, FeedbackStatus.SUBMITTED))
    );
  }

  dismissFeedback(date: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${date}/dismiss`, {}).pipe(
      tap(() => this.updateLocalStatus(date, FeedbackStatus.DISMISSED))
    );
  }

  undoDismiss(date: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${date}/undo-dismiss`, {}).pipe(
      tap(() => this.updateLocalStatus(date, FeedbackStatus.PENDING))
    );
  }

  private updateLocalStatus(date: string, status: FeedbackStatus): void {
    this.dailyFeedbacksSignal.update(current =>
      current.map(df => df.date === date ? { ...df, feedbackStatus: status } : df)
    );
  }
}
