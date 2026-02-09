import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  AuthProvider,
  CalendarConnectionRequest,
  CalendarStatusResponse,
  CalendarUrlResponse,
} from "../models/calendar.model";

@Injectable({
  providedIn: "root",
})
export class CalendarService {
  private apiUrl = "http://localhost:8080/api/calendar";

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
}
