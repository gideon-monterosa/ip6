import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthProvider, CalendarStatusResponse, CalendarUrlResponse } from '../../features/calendar/models/calendar.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarIntegrationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/calendar`;

  getConnectionStatus(): Observable<CalendarStatusResponse> {
    return this.http.get<CalendarStatusResponse>(`${this.apiUrl}/status`);
  }

  sync(): Observable<any> {
    return this.http.post(`${this.apiUrl}/sync`, {});
  }

  getAuthorizationUrl(provider: AuthProvider): Observable<CalendarUrlResponse> {
    return this.http.get<CalendarUrlResponse>(`${this.apiUrl}/connect?provider=${provider}`);
  }

  connect(code: string, provider: AuthProvider): Observable<any> {
    return this.http.post(`${this.apiUrl}/callback`, { code, provider });
  }

}
