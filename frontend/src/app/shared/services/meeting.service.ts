import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Meeting, MeetingType, FeedbackStatus } from '../models/meeting.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private http = inject(HttpClient);

  private calendarApiUrl = `${environment.apiUrl}/api/calendar`;
  private feedbackApiUrl = `${environment.apiUrl}/api/feedback`;

  private meetingsSignal = signal<Meeting[]>([]);
  public readonly meetings = this.meetingsSignal.asReadonly();

  private isLoadingSignal = signal<boolean>(false);
  public readonly isLoading = this.isLoadingSignal.asReadonly();

  loadMeetingsForDateRange(start: Date, end: Date): Observable<Meeting[]> {
    this.isLoadingSignal.set(true);
    const params = new HttpParams()
      .set('start', start.toISOString())
      .set('end', end.toISOString());

    return this.http.get<any[]>(`${this.calendarApiUrl}/events`, { params }).pipe(
      map(events => events.map(dto => this.mapDtoToMeeting(dto))),
      tap({
        next: (meetings) => {
          this.meetingsSignal.set(meetings);
          this.isLoadingSignal.set(false);
        },
        error: (err) => {
          console.error('Fehler beim Laden der Meetings', err);
          this.isLoadingSignal.set(false);
        }
      })
    );
  }

  updateMeetingCategory(meetingId: string, category: MeetingType): Observable<Meeting> {
    return this.http.patch<Meeting>(`${this.calendarApiUrl}/events/${meetingId}/category`, {
      meetingType: category
    }).pipe(
      tap(() => this.updateLocalMeeting(meetingId, { meetingType: category }))
    );
  }

  createEvent(event: any): Observable<Meeting> {
    return this.http.post<any>(`${this.calendarApiUrl}/events`, event).pipe(
      map(dto => this.mapDtoToMeeting(dto)),
      tap(newMeeting => {
        this.meetingsSignal.update(current => [...current, newMeeting]);
      })
    );
  }

  updateEvent(meetingId: string, event: any): Observable<Meeting> {
    return this.http.put<any>(`${this.calendarApiUrl}/events/${meetingId}`, event).pipe(
      map(dto => this.mapDtoToMeeting(dto)),
      tap(updatedMeeting => {
        this.updateLocalMeeting(meetingId, updatedMeeting);
      })
    );
  }

  deleteEvent(meetingId: string): Observable<void> {
    return this.http.delete<void>(`${this.calendarApiUrl}/events/${meetingId}`).pipe(
      tap(() => {
        this.meetingsSignal.update(current => current.filter(m => m.id !== meetingId));
      })
    );
  }

  submitFeedback(meetingId: string, feedbackData: any): Observable<void> {
    const payload = {
      details: {
        type: 'MEETING',
        focusDisruption: feedbackData.focus_disruption,
        rotiScore: feedbackData.roti_score,
        mood: feedbackData.mood,
        energyAfter: feedbackData.energy_after,
        issueTags: feedbackData.issue_tags,
        positiveTags: feedbackData.positive_tags,
        comment: feedbackData.comment
      }
    };
    return this.http.post<void>(`${this.feedbackApiUrl}/${meetingId}/feedback`, payload).pipe(
      tap(() => this.updateLocalMeeting(meetingId, { feedbackStatus: FeedbackStatus.SUBMITTED }))
    );
  }

  dismissFeedback(meetingId: string): Observable<void> {
    return this.http.post<void>(`${this.feedbackApiUrl}/${meetingId}/dismiss`, {}).pipe(
      tap(() => this.updateLocalMeeting(meetingId, { feedbackStatus: FeedbackStatus.DISMISSED }))
    );
  }

  undoDismiss(meetingId: string): Observable<void> {
    return this.http.post<void>(`${this.feedbackApiUrl}/${meetingId}/undo-dismiss`, {}).pipe(
      tap(() => this.updateLocalMeeting(meetingId, { feedbackStatus: FeedbackStatus.PENDING }))
    );
  }

  private mapDtoToMeeting(dto: any): Meeting {
    const startDate = new Date(dto.start);
    const endDate = new Date(dto.end);
    const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      link: dto.link,
      location: dto.location,
      provider: dto.provider,
      start: dto.start,
      end: dto.end,
      durationMinutes: durationMinutes,
      meetingType: dto.meetingType || 'Other',
      feedbackStatus: dto.feedbackStatus || FeedbackStatus.PENDING,
    };
  }

  private updateLocalMeeting(id: string, changes: Partial<Meeting>) {
    this.meetingsSignal.update(current =>
      current.map(m => m.id === id ? { ...m, ...changes } : m)
    );
  }
}
