import { Component, input, effect } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TypeDistribution } from '../../models/dashboard.model';
import { ChartCardComponent } from '../shared/chart-card.component';
import { CHART_SERIES_PALETTE, CHART_GRID_BORDER } from '../../../../theme.constants';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexGrid,
  ApexTooltip,
} from 'ng-apexcharts';

@Component({
  selector: 'app-meeting-type-distribution',
  imports: [NgApexchartsModule, ChartCardComponent],
  template: `
    <app-chart-card title='Meeting Type Distribution'
      subtitle='Visualizes how meeting count is distributed across different meeting categories.'>
      <apx-chart
        [series]='barSeries'
        [chart]='barChart'
        [xaxis]='xaxis'
        [dataLabels]='barDataLabels'
        [plotOptions]='plotOptions'
        [grid]='grid'
        [tooltip]='tooltip'
        [colors]='colors'
      />
    </app-chart-card>
  `,
})
export class MeetingTypeDistributionComponent {
  data = input.required<TypeDistribution[]>();

  barSeries: ApexAxisChartSeries = [];
  labels: string[] = [];
  barChart: ApexChart = { type: 'bar', height: 300, toolbar: { show: false } };
  xaxis: ApexXAxis = { categories: [] };
  barDataLabels: ApexDataLabels = { enabled: true };
  plotOptions: ApexPlotOptions = { bar: { borderRadius: 6, columnWidth: '50%' } };
  grid: ApexGrid = { borderColor: CHART_GRID_BORDER, strokeDashArray: 4 };
  tooltip: ApexTooltip = { theme: 'light' };
  colors = [...CHART_SERIES_PALETTE];

  constructor() {
    effect(() => {
      const items = this.data();
      if (items.length) {
        this.labels = items.map((d) => d.type);
        this.barSeries = [{ name: 'Meetings', data: items.map((d) => d.count) }];
        this.xaxis = { categories: this.labels };
      }
    });
  }
}
