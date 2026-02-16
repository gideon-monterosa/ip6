import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  AuthProvider,
  CalendarConnectionRequest,
  CalendarStatusResponse,
  CalendarUrlResponse,
  CalendarEvent
} from '../models/calendar.model';
import { environment } from '../../../../environments/environment';
import { FeedbackStatus, MeetingType, MEETING_TYPES } from '../../feedback-inbox/models/feedback.model';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private apiUrl = `${environment.apiUrl}/api/calendar`;

  constructor(private http: HttpClient) {}

  getAuthUrl(provider: AuthProvider): Observable<CalendarUrlResponse> {
    return this.http.get<CalendarUrlResponse>(`${this.apiUrl}/connect`, {
      params: { provider: provider },
    });
  }

  connect(code: string, provider: AuthProvider): Observable<any> {
    const body: CalendarConnectionRequest = { code, provider };
    return this.http.post(`${this.apiUrl}/callback`, body);
  }

  getStatus(): Observable<CalendarStatusResponse> {
    return this.http.get<CalendarStatusResponse>(`${this.apiUrl}/status`);
  }

  getEvents(start: Date, end: Date): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${this.apiUrl}/events`, {
      params: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    }).pipe(
      map(events => events.map(event => this.enrichEventWithMockData(event)))
    );
  }

  sync(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/sync`, {});
  }

  private enrichEventWithMockData(event: CalendarEvent): CalendarEvent {
    const now = new Date();
    const eventEnd = new Date(event.end);
    const isPast = eventEnd < now;

    let type: MeetingType = 'Ad-hoc';
    const titleLower = event.title.toLowerCase();

    if (titleLower.includes('standup') || titleLower.includes('daily')) type = 'Stand-up';
    else if (titleLower.includes('planning')) type = 'Planning';
    else if (titleLower.includes('retro')) type = 'Retrospective';
    else if (titleLower.includes('1:1') || titleLower.includes('one-on-one')) type = '1:1';
    else {
      type = MEETING_TYPES[Math.floor(Math.random() * MEETING_TYPES.length)];
    }

    let status: FeedbackStatus | undefined;

    if (isPast) {
      const seed = event.id.charCodeAt(event.id.length - 1);

      if (seed % 3 === 0) {
        status = FeedbackStatus.SUBMITTED;
      } else if (seed % 3 === 1) {
        status = FeedbackStatus.DISMISSED;
      } else {
        status = FeedbackStatus.PENDING;
      }
    }

    return {
      ...event,
      meetingType: type,
      feedbackStatus: status
    };
  }
}
