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
  ApexPlotOptions,
} from 'ng-apexcharts';

@Component({
  selector: 'app-meetings-trend-chart',
  imports: [NgApexchartsModule],
  template: `
    <div
      class='bg-card border border-card-line shadow-2xs rounded-xl p-4 md:p-5'
    >
      <h4 class='text-sm font-medium text-muted-foreground-1 uppercase'>
        Daily Overview
      </h4>
      <p class='text-xs text-muted-foreground-2 mb-3'>
        Shows total meeting count and duration across the week. Identifies the busiest days and peak meeting loads.
      </p>
      @if (dailyData().length === 0) {
        <div class="flex items-center justify-center h-[300px] text-sm text-muted-foreground-2">
          No meetings this week
        </div>
      } @else {
        <apx-chart
          [series]='series'
          [chart]='chart'
          [plotOptions]='plotOptions'
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
  chart: ApexChart = { type: 'bar', height: 300, toolbar: { show: false } };
  plotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 4,
    },
  };
  xaxis: ApexXAxis = { categories: [] };
  yaxis: ApexYAxis | ApexYAxis[] = [
    {
      title: { text: 'Count', style: { color: CHART_PRIMARY } },
      labels: { style: { colors: CHART_PRIMARY } },
    },
    {
      opposite: true,
      title: { text: 'Hours', style: { color: CHART_COLORS.chart6 } },
      labels: { style: { colors: CHART_COLORS.chart6 } },
    },
  ];
  stroke: ApexStroke = { show: true, width: 2, colors: ['transparent'] };
  fill: ApexFill = { opacity: 1 };
  dataLabels: ApexDataLabels = { enabled: false };
  tooltip: ApexTooltip = {
    theme: 'light',
    shared: true,
    intersect: false,
  };
  grid: ApexGrid = { borderColor: CHART_GRID_BORDER, strokeDashArray: 4 };
  colors = [CHART_PRIMARY, CHART_COLORS.chart6];

  constructor() {
    effect(() => {
      const data = this.dailyData();
      if (data.length) {
        this.series = [
          { name: 'Meetings', type: 'bar', data: data.map((d) => d.meetings) },
          { name: 'Hours', type: 'bar', data: data.map((d) => d.hours) },
        ];
        this.xaxis = { categories: data.map((d) => d.day) };
      }
    });
  }
}
