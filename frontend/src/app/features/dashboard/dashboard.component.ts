import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardTabsComponent } from './components/shared/dashboard-tabs.component';
import { WeekSelectorComponent } from './components/shared/week-selector.component';
import { StructureDashboardComponent } from './structure-dashboard.component';
import { ImpactDashboardComponent } from './impact-dashboard.component';
import { getMonday, getSunday } from './utils/week.utils';
import { TourService } from '../../core/services/tour.service';
import { StructureDashboardService } from './services/structure-dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    DashboardTabsComponent,
    WeekSelectorComponent,
    StructureDashboardComponent,
    ImpactDashboardComponent,
    RouterLink,
  ],
  template: `
    <div class="max-w-[85rem] px-4 py-3 sm:px-6 lg:px-8 lg:py-4 mx-auto">
      <!-- Header with Week Selector on the right -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          @if (currentUser()) {
            <h1 class="text-2xl font-bold text-foreground">
              Welcome back, {{ currentUser()!.username }}
            </h1>
            <p class="text-sm text-muted-foreground-1">Here's your meeting analytics overview.</p>
          }
        </div>
        
        <div class="w-full sm:w-auto">
          <app-week-selector
            [weekStart]="selectedWeekStart()"
            (weekChange)="onWeekChange($event)"
          />
        </div>
      </div>

      @if (hasMeetings() === false) {
        <div class="mt-12 flex flex-col items-center justify-center text-center">
          <div class="mb-4 text-muted-foreground-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-foreground">No meetings found</h3>
          <p class="text-muted-foreground-1 mt-1 max-w-sm mx-auto">
            There are no calendar events for the selected week.
          </p>
          <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a routerLink="/settings" class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors cursor-pointer">
              Link a calendar
            </a>
            <a routerLink="/calendar" class="inline-flex items-center justify-center px-4 py-2 border border-border text-sm font-medium rounded-md text-foreground bg-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors cursor-pointer">
              Add events manually
            </a>
          </div>
        </div>
      } @else if (hasMeetings() === true) {
        <!-- Full-width Tabs -->
        <div class="mb-6">
          <app-dashboard-tabs
            [activeTab]="activeTab()"
            (tabChange)="onTabChange($event)"
          />
        </div>

        <!-- Dashboard Content -->
        <div>
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
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private tourService = inject(TourService);
  private structureService = inject(StructureDashboardService);

  currentUser = this.authService.currentUser;
  activeTab = signal<'structure' | 'impact'>('structure');

  selectedWeekStart = signal<Date>(getMonday(new Date()));
  selectedWeekEnd = computed(() => getSunday(this.selectedWeekStart()));

  hasMeetings = signal<boolean | null>(null);

  constructor() {
    effect(() => {
      this.structureService.getStructureSummary(this.selectedWeekStart(), this.selectedWeekEnd())
        .subscribe(summary => this.hasMeetings.set(summary.totalMeetings > 0));
    });
  }

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
