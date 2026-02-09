import { Component, OnInit, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormControl } from "@angular/forms";
import { InputComponent } from "../../shared/components/input/input.component";
import { CalendarService } from "../calendar/services/calendar.service";
import { AuthProvider } from "../calendar/models/calendar.model";

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent
  ],
  templateUrl: "./settings.component.html",
  styleUrl: "./settings.component.css",
})
export class SettingsComponent implements OnInit {
  placeholderControl = new FormControl('');

  isGoogleConnected = signal(false);
  isMicrosoftConnected = signal(false);
  isLoading = signal(false);

  hasConnection = computed(() => this.isGoogleConnected() || this.isMicrosoftConnected());
  readonly AuthProvider = AuthProvider;

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.isLoading.set(true);
    this.calendarService.getStatus().subscribe({
      next: (status) => {
        this.isGoogleConnected.set(status.googleConnected);
        this.isMicrosoftConnected.set(status.microsoftConnected);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  connectCalendar(provider: AuthProvider): void {
    if (this.hasConnection()) return;

    this.isLoading.set(true);
    this.calendarService.getAuthUrl(provider).subscribe({
      next: (response) => {
        localStorage.setItem('pending_calendar_provider', provider);
        window.location.href = response.url;
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
