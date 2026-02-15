import { Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { StructureService } from './services/structure.service';
import { FilterService } from './services/filter.service';
import { AuthService } from '../../core/services/auth.service';
import { FilterPanelComponent } from './components/shared/filter-panel.component';
import { StructureKpiSummaryComponent } from './components/structure/structure-kpi-summary.component';
import { MeetingTypeDistributionComponent } from './components/structure/meeting-type-distribution.component';
import { MeetingTimingAnalysisComponent } from './components/structure/meeting-timing-analysis.component';
import { FocusTimeAnalysisComponent } from './components/structure/focus-time-analysis.component';
import { FragmentationScoreComponent } from './components/structure/fragmentation-score.component';
import { RecurringAdhocRatioComponent } from './components/structure/recurring-adhoc-ratio.component';

@Component({
  selector: 'app-structure-dashboard',
  imports: [
    FilterPanelComponent,
    StructureKpiSummaryComponent,
    MeetingTypeDistributionComponent,
    MeetingTimingAnalysisComponent,
    FocusTimeAnalysisComponent,
    FragmentationScoreComponent,
    RecurringAdhocRatioComponent,
  ],
  template: `
    <div>
      <!-- Filter Panel -->
      <app-filter-panel />

      <!-- KPI Summary Row -->
      @if (summary()) {
        <div class='mb-6'>
          <app-structure-kpi-summary [summary]='summary()' />
        </div>
      }

      <!-- Row 2: Meeting Types + Timing Analysis -->
      <div class='grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6'>
        @if (meetingTypes().length) {
          <app-meeting-type-distribution [data]='meetingTypes()' />
        }
        @if (timing().length) {
          <app-meeting-timing-analysis [data]='timing()' />
        }
      </div>

      <!-- Row 3: Focus Time + Fragmentation + Recurring -->
      <div class='grid lg:grid-cols-3 gap-4 sm:gap-6'>
        @if (focusBlocks().length) {
          <app-focus-time-analysis [data]='focusBlocks()' />
        }
        @if (fragmentation().length) {
          <app-fragmentation-score [data]='fragmentation()' />
        }
        @if (recurring()) {
          <app-recurring-adhoc-ratio [ratio]='recurring()' />
        }
      </div>
    </div>
  `,
})
export class StructureDashboardComponent {
  private structureService = inject(StructureService);
  private filterService = inject(FilterService);

  private dashboardData = toSignal(
    forkJoin({
      meetings: this.structureService.loadMeetings(),
      summary: this.structureService.getSummary(),
      meetingTypes: this.structureService.getMeetingTypeDistribution(),
      timing: this.structureService.getTimingAnalysis(),
      focusBlocks: this.structureService.getFocusBlocks(),
      fragmentation: this.structureService.getFragmentationScores(),
      recurring: this.structureService.getRecurringRatio(),
    }),
    { initialValue: null },
  );

  summary = computed(() => this.dashboardData()?.summary.summary ?? null);
  meetingTypes = computed(() => this.dashboardData()?.meetingTypes.distribution ?? []);
  timing = computed(() => this.dashboardData()?.timing.timing ?? []);
  focusBlocks = computed(() => this.dashboardData()?.focusBlocks.focusBlocks ?? []);
  fragmentation = computed(() => this.dashboardData()?.fragmentation.scores ?? []);
  recurring = computed(() => this.dashboardData()?.recurring.ratio ?? null);
}
