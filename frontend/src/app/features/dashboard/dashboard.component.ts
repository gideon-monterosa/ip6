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
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
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
