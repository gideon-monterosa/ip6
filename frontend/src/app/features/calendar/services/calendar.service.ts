import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AuthProvider,
  CalendarConnectionRequest,
  CalendarStatusResponse,
  CalendarUrlResponse,
  CalendarEvent
} from '../models/calendar.model';
import { environment } from '../../../../environments/environment';

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
    return this.http.get<CalendarStatusResponse>(`${this.apiUrl}/status`);2
  }

  getEvents(start: Date, end: Date): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${this.apiUrl}/events`, {
      params: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    });
  }
}
