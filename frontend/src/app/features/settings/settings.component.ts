import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { InputComponent } from '../../shared/components/input/input.component';
import { AuthProvider, CalendarStatusResponse } from '../calendar/models/calendar.model';
import { CalendarIntegrationService } from '../../shared/services/calendar-integration.service';
import { UserService } from '../../core/services/user.service';
import { UserSettings } from '../../core/models/user.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  private integrationService = inject(CalendarIntegrationService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  AuthProvider = AuthProvider;
  isLoading = signal(false);

  calendarStatus = signal<CalendarStatusResponse>({
    googleConnected: false,
    microsoftConnected: false,
    googleFreeBusyConnected: false,
  });

  isGoogleConnected = computed(() => this.calendarStatus().googleConnected);
  isMicrosoftConnected = computed(() => this.calendarStatus().microsoftConnected);
  isFreeBusyConnected = computed(() => this.calendarStatus().googleFreeBusyConnected);
  hasConnection = computed(() => this.isGoogleConnected() || this.isMicrosoftConnected() || this.isFreeBusyConnected());

  googleCalendarEnabled = signal(true);
  googleFreeBusyEnabled = signal(true);
  microsoftCalendarEnabled = signal(false);

  settingsForm!: FormGroup;
  isSavingSettings = signal(false);
  saveSettingsSuccess = signal(false);

  availableDays = [
    { label: 'Monday', value: 'MONDAY' },
    { label: 'Tuesday', value: 'TUESDAY' },
    { label: 'Wednesday', value: 'WEDNESDAY' },
    { label: 'Thursday', value: 'THURSDAY' },
    { label: 'Friday', value: 'FRIDAY' },
    { label: 'Saturday', value: 'SATURDAY' },
    { label: 'Sunday', value: 'SUNDAY' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadStatus();
    this.loadUserSettings();
  }

  initForm(): void {
    this.settingsForm = this.fb.group({
      workStartTime: ['09:00'],
      workEndTime: ['17:00'],
      workingDays: this.fb.array(this.availableDays.map(() => new FormControl(false)))
    });
  }

  get workingDaysFormArray() {
    return this.settingsForm.get('workingDays') as FormArray;
  }

  loadUserSettings(): void {
    this.userService.getSettings().subscribe({
      next: (settings) => {
        const startTime = settings.workStartTime ? settings.workStartTime.substring(0, 5) : '09:00';
        const endTime = settings.workEndTime ? settings.workEndTime.substring(0, 5) : '17:00';

        this.googleCalendarEnabled.set(settings.googleCalendarEnabled);
        this.googleFreeBusyEnabled.set(settings.googleFreeBusyEnabled);
        this.microsoftCalendarEnabled.set(settings.microsoftCalendarEnabled);

        this.settingsForm.patchValue({
          workStartTime: startTime,
          workEndTime: endTime
        });

        // Checkboxen setzen
        const days = settings.workingDays || [];
        this.workingDaysFormArray.controls.forEach((control, i) => {
          control.setValue(days.includes(this.availableDays[i].value));
        });
      },
      error: (err) => console.error('Fehler beim Laden der Einstellungen', err)
    });
  }

  saveUserSettings(): void {
    this.isSavingSettings.set(true);
    this.saveSettingsSuccess.set(false);

    const formVal = this.settingsForm.value;
    const selectedDays = this.availableDays
      .filter((_, i) => formVal.workingDays[i])
      .map(d => d.value);

    const payload: UserSettings = {
      googleCalendarEnabled: this.googleCalendarEnabled(),
      googleFreeBusyEnabled: this.googleFreeBusyEnabled(),
      microsoftCalendarEnabled: this.microsoftCalendarEnabled(),
      workStartTime: formVal.workStartTime + ':00',
      workEndTime: formVal.workEndTime + ':00',
      workingDays: selectedDays
    };

    this.userService.updateSettings(payload).subscribe({
      next: () => {
        this.isSavingSettings.set(false);
        this.saveSettingsSuccess.set(true);
        setTimeout(() => this.saveSettingsSuccess.set(false), 3000);
      },
      error: (err) => {
        console.error('Fehler beim Speichern', err);
        this.isSavingSettings.set(false);
      }
    });
  }

  loadStatus(): void {
    this.isLoading.set(true);
    this.integrationService.getConnectionStatus().subscribe({
      next: (status: any) => {
        this.calendarStatus.set(status);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load calendar status', err);
        this.isLoading.set(false);
      }
    });
  }

  connectCalendar(provider: AuthProvider): void {
    this.isLoading.set(true);

    localStorage.setItem('pending_calendar_provider', provider);

    this.integrationService.getAuthorizationUrl(provider).subscribe({
      next: (response: any) => {
        window.location.href = response.url;
      },
      error: (err: any) => {
        console.error('Failed to get auth URL', err);
        this.isLoading.set(false);
      }
    });
  }
}
