import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../shared/components/input/input.component';
import { CalendarService } from '../calendar/services/calendar.service';
import { AuthProvider, CalendarStatusResponse } from '../calendar/models/calendar.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  private calendarService = inject(CalendarService);

  AuthProvider = AuthProvider;

  isLoading = signal(false);
  calendarStatus = signal<CalendarStatusResponse>({
    googleConnected: false,
    microsoftConnected: false
  });

  placeholder = signal('');
  placeholderControl = new FormControl('');

  isGoogleConnected = computed(() => this.calendarStatus().googleConnected);
  isMicrosoftConnected = computed(() => this.calendarStatus().microsoftConnected);
  hasConnection = computed(() => this.isGoogleConnected() || this.isMicrosoftConnected());

  constructor() {
    effect(() => {
      const value = this.placeholderControl.value;
      if (value !== null) {
        this.placeholder.set(value);
      }
    });
  }

  ngOnInit(): void {
    this.loadStatus();
  }

  loadStatus(): void {
    this.isLoading.set(true);
    this.calendarService.getStatus().subscribe({
      next: (status) => {
        this.calendarStatus.set(status);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load calendar status', err);
        this.isLoading.set(false);
      }
    });
  }

  connectCalendar(provider: AuthProvider): void {
    this.isLoading.set(true);
    this.calendarService.getAuthUrl(provider).subscribe({
      next: (response) => {
        // Redirect the user to the provider's OAuth page
        window.location.href = response.url;
      },
      error: (err) => {
        console.error('Failed to get auth URL', err);
        this.isLoading.set(false);
      }
    });
  }
}
