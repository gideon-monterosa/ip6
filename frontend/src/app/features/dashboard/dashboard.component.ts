import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { DashboardTabsComponent } from './components/shared/dashboard-tabs.component';
import { WeekSelectorComponent } from './components/shared/week-selector.component';
import { StructureDashboardComponent } from './structure-dashboard.component';
import { ImpactDashboardComponent } from './impact-dashboard.component';
import { getMonday, getSunday } from './utils/week.utils';
import { TourService } from '../../core/services/tour.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    DashboardTabsComponent,
    WeekSelectorComponent,
    StructureDashboardComponent,
    ImpactDashboardComponent,
  ],
  template: `
    <div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      <!-- Header -->
      <div class="mb-6">
        @if (currentUser()) {
          <h1 class="text-2xl font-bold text-foreground">
            Welcome back, {{ currentUser()!.username }}
          </h1>
          <p class="text-sm text-muted-foreground-1 mt-1">Here's your meeting analytics overview.</p>
        }
      </div>

      <!-- Week Selector -->
      <div class="mb-6">
        <app-week-selector
          [weekStart]="selectedWeekStart()"
          (weekChange)="onWeekChange($event)"
        />
      </div>

      <!-- Dashboard Tabs -->
      <div class="mb-6">
        <app-dashboard-tabs
          [activeTab]="activeTab()"
          (tabChange)="onTabChange($event)"
        />
      </div>

      <!-- Dashboard Content -->
      @if (activeTab() === 'structure') {
        <app-structure-dashboard
          [weekStart]="selectedWeekStart()"
          [weekEnd]="selectedWeekEnd()"
        />
      } @else {
        <app-impact-dashboard
          [weekStart]="selectedWeekStart()"
          [weekEnd]="selectedWeekEnd()"
        />
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      background-color: var(--background-1);
    }
  `,
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private tourService = inject(TourService);

  currentUser = this.authService.currentUser;
  activeTab = signal<'structure' | 'impact'>('structure');

  selectedWeekStart = signal<Date>(getMonday(new Date()));
  selectedWeekEnd = computed(() => getSunday(this.selectedWeekStart()));

  ngOnInit(): void {
    this.tourService.startIfFirstTime();
  }

  onTabChange(tab: 'structure' | 'impact'): void {
    this.activeTab.set(tab);
  }

  onWeekChange(newMonday: Date): void {
    this.selectedWeekStart.set(newMonday);
  }
}
