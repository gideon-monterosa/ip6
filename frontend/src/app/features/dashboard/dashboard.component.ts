import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { DashboardTabsComponent } from './components/shared/dashboard-tabs.component';
import { StructureDashboardComponent } from './structure-dashboard.component';
import { ImpactDashboardComponent } from './impact-dashboard.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    DashboardTabsComponent,
    StructureDashboardComponent,
    ImpactDashboardComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;
  activeTab = signal<'structure' | 'impact'>('structure');

  onTabChange(tab: 'structure' | 'impact'): void {
    this.activeTab.set(tab);
  }
}
