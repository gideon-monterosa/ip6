import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarIntegrationService } from '../../../shared/services/calendar-integration.service';
import { AuthProvider } from '../models/calendar.model';

@Component({
  selector: 'app-calendar-callback',
  imports: [],
  templateUrl: './calendar-callback.component.html',
})
export class CalendarCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private calendarService: CalendarIntegrationService,
  ) {}

  ngOnInit(): void {
    const code = this.route.snapshot.queryParams['code'];
    const providerStr = localStorage.getItem('pending_calendar_provider');

    if (code && providerStr) {
      const provider = providerStr as AuthProvider;

      this.calendarService.connect(code, provider).subscribe({
        next: () => {
          localStorage.removeItem('pending_calendar_provider');
          this.router.navigate(['/home']);
        },
        error: () => {
          this.router.navigate(['/home']);
        },
      });
    } else {
      this.router.navigate(['/home']);
    }
  }
}
