import { Component, input, effect } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TimingBucket } from '../../models/dashboard.model';
import { ChartCardComponent } from '../shared/chart-card.component';
import { CHART_GRID_BORDER, CHART_PRIMARY, CHART_COLORS } from '../../../../theme.constants';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexGrid,
  ApexTooltip,
  ApexFill,
} from 'ng-apexcharts';

@Component({
  selector: 'app-meeting-timing-analysis',
  imports: [NgApexchartsModule, ChartCardComponent],
  template: `
    <app-chart-card title='When Do Meetings Occur?'>
      <apx-chart
        [series]='series'
        [chart]='chart'
        [xaxis]='xaxis'
        [dataLabels]='dataLabels'
        [plotOptions]='plotOptions'
        [grid]='grid'
        [tooltip]='tooltip'
        [fill]='fill'
        [colors]='colors'
      />
    </app-chart-card>
  `,
})
export class MeetingTimingAnalysisComponent {
  data = input.required<TimingBucket[]>();

  series: ApexAxisChartSeries = [];
  chart: ApexChart = { type: 'bar', height: 300, toolbar: { show: false } };
  xaxis: ApexXAxis = { categories: [] };
  dataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val: number, opts: { w: { globals: { series: number[][] } }; seriesIndex: number; dataPointIndex: number }) => {
      const items = this.data();
      if (items[opts.dataPointIndex]) {
        return items[opts.dataPointIndex].percentage + '%';
      }
      return val + '';
    },
  };
  plotOptions: ApexPlotOptions = { bar: { borderRadius: 6, columnWidth: '50%', distributed: true } };
  grid: ApexGrid = { borderColor: CHART_GRID_BORDER, strokeDashArray: 4 };
  tooltip: ApexTooltip = { theme: 'light' };
  fill: ApexFill = {
    type: 'gradient',
    gradient: { shade: 'light', type: 'vertical', opacityFrom: 0.9, opacityTo: 0.7 },
  };
  colors = [CHART_PRIMARY, CHART_COLORS.chart6, CHART_COLORS.chart7];

  constructor() {
    effect(() => {
      const items = this.data();
      if (items.length) {
        const bucketLabels: Record<string, string> = {
          Morning: 'Morning (8-12)',
          Midday: 'Midday (12-15)',
          Afternoon: 'Afternoon (15-18)',
        };
        this.series = [{ name: 'Meetings', data: items.map((d) => d.count) }];
        this.xaxis = { categories: items.map((d) => bucketLabels[d.timeOfDay] ?? d.timeOfDay) };
      }
    });
  }
}
