import { Component, input, effect } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { WeekData } from '../../models/dashboard.model';
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
  standalone: true,
  imports: [NgApexchartsModule],
  template: `
    <div class="bg-white border border-gray-200 shadow-2xs rounded-xl p-4 md:p-5">
      <h4 class="text-sm font-medium text-gray-500 uppercase mb-3">Meetings Over Time</h4>
      <apx-chart
        [series]="series"
        [chart]="chart"
        [xaxis]="xaxis"
        [yaxis]="yaxis"
        [stroke]="stroke"
        [fill]="fill"
        [dataLabels]="dataLabels"
        [tooltip]="tooltip"
        [grid]="grid"
        [colors]="colors"
      />
    </div>
  `,
})
export class MeetingsTrendChartComponent {
  weeks = input.required<WeekData[]>();

  series: ApexAxisChartSeries = [];
  chart: ApexChart = { type: 'area', height: 300, toolbar: { show: false } };
  xaxis: ApexXAxis = { categories: [] };
  yaxis: ApexYAxis = { title: { text: 'Count' } };
  stroke: ApexStroke = { curve: 'smooth', width: 2 };
  fill: ApexFill = { type: 'gradient', gradient: { opacityFrom: 0.5, opacityTo: 0.1 } };
  dataLabels: ApexDataLabels = { enabled: false };
  tooltip: ApexTooltip = { theme: 'light' };
  grid: ApexGrid = { borderColor: '#e5e7eb', strokeDashArray: 4 };
  colors = ['#6366f1', '#22d3ee'];

  constructor() {
    effect(() => {
      const data = this.weeks();
      if (data.length) {
        this.series = [
          { name: 'Meetings', data: data.map(w => w.meetings) },
          { name: 'Hours', data: data.map(w => w.hours) },
        ];
        this.xaxis = { categories: data.map(w => w.label) };
      }
    });
  }
}
