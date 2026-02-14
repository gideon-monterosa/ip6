import { Component, input, effect } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { RecurringRatio } from '../../models/structure.model';
import { ChartCardComponent } from '../shared/chart-card.component';
import { CHART_PRIMARY, CHART_COLORS } from '../../../../theme.constants';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexLegend,
  ApexDataLabels,
  ApexPlotOptions,
} from 'ng-apexcharts';

@Component({
  selector: 'app-recurring-adhoc-ratio',
  imports: [NgApexchartsModule, ChartCardComponent],
  template: `
    <app-chart-card title='Meeting Predictability'>
      <apx-chart
        [series]='series'
        [chart]='chart'
        [labels]='labels'
        [legend]='legend'
        [dataLabels]='dataLabels'
        [plotOptions]='plotOptions'
        [colors]='colors'
      />
      @if (ratio(); as r) {
        <p class='text-sm text-muted-foreground-1 text-center mt-2'>
          {{ r.recurringPercentage }}% of meetings are recurring
        </p>
      }
    </app-chart-card>
  `,
})
export class RecurringAdhocRatioComponent {
  ratio = input.required<RecurringRatio | null>();

  series: ApexNonAxisChartSeries = [];
  labels = ['Recurring', 'Ad-hoc'];
  chart: ApexChart = { type: 'donut', height: 280 };
  legend: ApexLegend = { position: 'bottom', fontSize: '13px' };
  dataLabels: ApexDataLabels = { enabled: true };
  plotOptions: ApexPlotOptions = { pie: { donut: { size: '55%' } } };
  colors = [CHART_PRIMARY, CHART_COLORS.chart7];

  constructor() {
    effect(() => {
      const r = this.ratio();
      if (r) {
        this.series = [r.recurringCount, r.adHocCount];
      }
    });
  }
}
