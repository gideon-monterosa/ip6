import { Component, input, effect, signal } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TypeDistribution } from '../../models/dashboard.model';
import { ChartCardComponent } from '../shared/chart-card.component';
import { CHART_SERIES_PALETTE, CHART_GRID_BORDER } from '../../../../theme.constants';
import {
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexGrid,
  ApexTooltip,
  ApexLegend,
} from 'ng-apexcharts';

@Component({
  selector: 'app-meeting-type-distribution',
  imports: [NgApexchartsModule, ChartCardComponent],
  template: `
    <app-chart-card title='Meeting Type Distribution'
      subtitle='Visualizes how meeting count is distributed across different meeting categories.'>
      <div class='flex gap-2 mb-3'>
        <button type='button'
          class='px-2 py-1 text-xs rounded border transition-colors'
          [class.bg-primary]='chartMode() === "bar"'
          [class.text-white]='chartMode() === "bar"'
          [class.border-primary]='chartMode() === "bar"'
          [class.border-gray-300]='chartMode() !== "bar"'
          (click)='chartMode.set("bar")'>Bar</button>
        <button type='button'
          class='px-2 py-1 text-xs rounded border transition-colors'
          [class.bg-primary]='chartMode() === "donut"'
          [class.text-white]='chartMode() === "donut"'
          [class.border-primary]='chartMode() === "donut"'
          [class.border-gray-300]='chartMode() !== "donut"'
          (click)='chartMode.set("donut")'>Donut</button>
      </div>
      @if (chartMode() === 'bar') {
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
      } @else {
        <apx-chart
          [series]='donutSeries'
          [chart]='donutChart'
          [labels]='labels'
          [legend]='legend'
          [dataLabels]='donutDataLabels'
          [colors]='colors'
        />
      }
    </app-chart-card>
  `,
})
export class MeetingTypeDistributionComponent {
  data = input.required<TypeDistribution[]>();
  chartMode = signal<'bar' | 'donut'>('bar');

  barSeries: ApexAxisChartSeries = [];
  donutSeries: ApexNonAxisChartSeries = [];
  labels: string[] = [];
  barChart: ApexChart = { type: 'bar', height: 300, toolbar: { show: false } };
  donutChart: ApexChart = { type: 'donut', height: 300 };
  xaxis: ApexXAxis = { categories: [] };
  barDataLabels: ApexDataLabels = { enabled: true };
  donutDataLabels: ApexDataLabels = { enabled: true };
  plotOptions: ApexPlotOptions = { bar: { borderRadius: 6, columnWidth: '50%' } };
  grid: ApexGrid = { borderColor: CHART_GRID_BORDER, strokeDashArray: 4 };
  tooltip: ApexTooltip = { theme: 'light' };
  legend: ApexLegend = { position: 'bottom', fontSize: '13px' };
  colors = [...CHART_SERIES_PALETTE];

  constructor() {
    effect(() => {
      const items = this.data();
      if (items.length) {
        this.labels = items.map((d) => d.type);
        this.barSeries = [{ name: 'Meetings', data: items.map((d) => d.count) }];
        this.xaxis = { categories: this.labels };
        this.donutSeries = items.map((d) => d.count);
      }
    });
  }
}
