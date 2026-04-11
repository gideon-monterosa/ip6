import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InputComponent } from '../../shared/components/input/input.component';
import { AuthProvider, CalendarStatusResponse } from '../calendar/models/calendar.model';
import { CalendarIntegrationService } from '../../shared/services/calendar-integration.service';
import { UserService } from '../../core/services/user.service';
import { UserSettings } from '../../core/models/user.model';
import { FirebaseService } from '../../core/services/firebase.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  private integrationService = inject(CalendarIntegrationService);
  private userService = inject(UserService);
  private firebaseService = inject(FirebaseService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  AuthProvider = AuthProvider;
  isLoading = signal(false);
  syncStarted = signal(false);

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
  pushNotificationsEnabled = signal(false);

  settingsForm!: FormGroup;
  isSavingSettings = signal(false);
  saveSettingsSuccess = signal(false);
  saveNotificationsSuccess = signal(false);

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
    this.syncStarted.set(this.route.snapshot.queryParams['syncStarted'] === 'true');
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
        this.pushNotificationsEnabled.set(settings.pushNotificationsEnabled || false);

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

  async togglePushNotifications() {
    const newState = !this.pushNotificationsEnabled();
    
    if (newState) {
      const token = await this.firebaseService.requestToken();
      if (token) {
        this.pushNotificationsEnabled.set(true);
        // We save immediately when enabling to store the token
        this.saveUserSettings(token, true);
      } else {
        alert('Push-Benachrichtigungen konnten nicht aktiviert werden. Bitte prüfen Sie die Browser-Berechtigungen.');
      }
    } else {
      this.pushNotificationsEnabled.set(false);
      this.saveUserSettings(undefined, true);
    }
  }

  saveUserSettings(fcmToken?: string, isNotificationToggle = false): void {
    if (!isNotificationToggle) {
      this.isSavingSettings.set(true);
      this.saveSettingsSuccess.set(false);
    } else {
      this.saveNotificationsSuccess.set(false);
    }

    const formVal = this.settingsForm.value;
    const selectedDays = this.availableDays
      .filter((_, i) => formVal.workingDays[i])
      .map(d => d.value);

    const payload: UserSettings = {
      googleCalendarEnabled: this.googleCalendarEnabled(),
      googleFreeBusyEnabled: this.googleFreeBusyEnabled(),
      microsoftCalendarEnabled: this.microsoftCalendarEnabled(),
      pushNotificationsEnabled: this.pushNotificationsEnabled(),
      fcmToken: fcmToken,
      workStartTime: formVal.workStartTime + ':00',
      workEndTime: formVal.workEndTime + ':00',
      workingDays: selectedDays
    };

    this.userService.updateSettings(payload).subscribe({
      next: () => {
        if (!isNotificationToggle) {
          this.isSavingSettings.set(false);
          this.saveSettingsSuccess.set(true);
          setTimeout(() => this.saveSettingsSuccess.set(false), 3000);
        } else {
          this.saveNotificationsSuccess.set(true);
          setTimeout(() => this.saveNotificationsSuccess.set(false), 3000);
        }
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
