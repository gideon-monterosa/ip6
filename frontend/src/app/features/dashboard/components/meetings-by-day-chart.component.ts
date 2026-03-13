import { Component, input, effect } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DayData } from '../models/dashboard.model';
import { CHART_PRIMARY, CHART_GRID_BORDER } from '../../../theme.constants';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexGrid,
  ApexTooltip,
} from 'ng-apexcharts';

/**
 * @deprecated This component is OBSOLETE and has been replaced by more comprehensive views in the structure dashboard.
 * It is no longer displayed.
 */
@Component({
  selector: 'app-meetings-by-day-chart',
  imports: [NgApexchartsModule],
  template: `
    <div
      class='bg-card border border-card-line shadow-2xs rounded-xl p-4 md:p-5 h-full flex flex-col'
    >
      <h4 class='text-sm font-medium text-muted-foreground-1 uppercase mb-3'>
        Meetings by Day
      </h4>
      @if (hasData) {
        <apx-chart
          [series]='series'
          [chart]='chart'
          [xaxis]='xaxis'
          [yaxis]='yaxis'
          [dataLabels]='dataLabels'
          [plotOptions]='plotOptions'
          [grid]='grid'
          [tooltip]='tooltip'
          [colors]='colors'
        />
      } @else {
        <div class="flex items-center justify-center h-[300px] text-sm text-muted-foreground-2">
          No meetings this week
        </div>
      }
    </div>
  `,
})
export class MeetingsByDayChartComponent {
  days = input.required<DayData[]>();

  series: ApexAxisChartSeries = [];
  hasData = false;
  chart: ApexChart = { type: 'bar', height: 300, toolbar: { show: false } };
  xaxis: ApexXAxis = { categories: [] };
  yaxis: ApexYAxis = { title: { text: 'Meetings' } };
  dataLabels: ApexDataLabels = { enabled: false };
  plotOptions: ApexPlotOptions = {
    bar: { borderRadius: 6, columnWidth: '50%' },
  };
  grid: ApexGrid = { borderColor: CHART_GRID_BORDER, strokeDashArray: 4 };
  tooltip: ApexTooltip = { theme: 'light' };
  colors = [CHART_PRIMARY];

  constructor() {
    effect(() => {
      const data = this.days();
      this.hasData = data.some((d) => d.count > 0);
      if (this.hasData) {
        this.series = [{ name: 'Meetings', data: data.map((d) => d.count) }];
        this.xaxis = { categories: data.map((d) => d.day) };
      }
    });
  }
}
