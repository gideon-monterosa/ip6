import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserSettings } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/user/settings`;

  getSettings(): Observable<UserSettings> {
    return this.http.get<UserSettings>(this.apiUrl);
  }

  updateSettings(settings: UserSettings): Observable<UserSettings> {
    return this.http.patch<UserSettings>(this.apiUrl, settings);
  }
}
