import { Component, input, effect } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DailyOverviewData } from '../models/dashboard.model';
import {
  CHART_PRIMARY,
  CHART_COLORS,
  CHART_GRID_BORDER,
} from '../../../theme.constants';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexFill,
  ApexDataLabels,
  ApexTooltip,
  ApexGrid,
} from 'ng-apexcharts';

@Component({
  selector: 'app-meetings-trend-chart',
  imports: [NgApexchartsModule],
  template: `
    <div
      class='bg-card border border-card-line shadow-2xs rounded-xl p-4 md:p-5'
    >
      <h4 class='text-sm font-medium text-muted-foreground-1 uppercase mb-3'>
        Daily Overview
      </h4>
      @if (dailyData().length === 0) {
        <div class="flex items-center justify-center h-[300px] text-sm text-muted-foreground-2">
          No meetings this week
        </div>
      } @else {
        <apx-chart
          [series]='series'
          [chart]='chart'
          [xaxis]='xaxis'
          [yaxis]='yaxis'
          [stroke]='stroke'
          [fill]='fill'
          [dataLabels]='dataLabels'
          [tooltip]='tooltip'
          [grid]='grid'
          [colors]='colors'
        />
      }
    </div>
  `,
})
export class MeetingsTrendChartComponent {
  dailyData = input.required<DailyOverviewData[]>();

  series: ApexAxisChartSeries = [];
  chart: ApexChart = { type: 'area', height: 300, toolbar: { show: false } };
  xaxis: ApexXAxis = { categories: [] };
  yaxis: ApexYAxis = { title: { text: 'Count' } };
  stroke: ApexStroke = { curve: 'smooth', width: 2 };
  fill: ApexFill = {
    type: 'gradient',
    gradient: { opacityFrom: 0.5, opacityTo: 0.1 },
  };
  dataLabels: ApexDataLabels = { enabled: false };
  tooltip: ApexTooltip = { theme: 'light' };
  grid: ApexGrid = { borderColor: CHART_GRID_BORDER, strokeDashArray: 4 };
  colors = [CHART_PRIMARY, CHART_COLORS.chart6];

  constructor() {
    effect(() => {
      const data = this.dailyData();
      if (data.length) {
        this.series = [
          { name: 'Meetings', data: data.map((d) => d.meetings) },
          { name: 'Hours', data: data.map((d) => d.hours) },
        ];
        this.xaxis = { categories: data.map((d) => d.day) };
      }
    });
  }
}
