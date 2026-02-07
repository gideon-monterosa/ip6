import { Component, input, effect } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DurationData } from '../../models/dashboard.model';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexResponsive,
  ApexLegend,
  ApexDataLabels,
  ApexPlotOptions,
} from 'ng-apexcharts';

@Component({
  selector: 'app-duration-breakdown-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  template: `
    <div class="bg-white border border-gray-200 shadow-2xs rounded-xl p-4 md:p-5">
      <h4 class="text-sm font-medium text-gray-500 uppercase mb-3">Duration Breakdown</h4>
      <apx-chart
        [series]="series"
        [chart]="chart"
        [labels]="labels"
        [responsive]="responsive"
        [legend]="legend"
        [dataLabels]="dataLabels"
        [plotOptions]="plotOptions"
        [colors]="colors"
      />
    </div>
  `,
})
export class DurationBreakdownChartComponent {
  breakdown = input.required<DurationData[]>();

  series: ApexNonAxisChartSeries = [];
  labels: string[] = [];
  chart: ApexChart = { type: 'donut', height: 300 };
  responsive: ApexResponsive[] = [
    { breakpoint: 480, options: { chart: { width: 280 }, legend: { position: 'bottom' } } },
  ];
  legend: ApexLegend = { position: 'bottom', fontSize: '13px' };
  dataLabels: ApexDataLabels = { enabled: true, style: { fontSize: '14px' } };
  plotOptions: ApexPlotOptions = {
    pie: { donut: { size: '55%' } },
  };
  colors = ['#22d3ee', '#6366f1', '#f59e0b'];

  constructor() {
    effect(() => {
      const data = this.breakdown();
      if (data.length) {
        this.series = data.map(d => d.count);
        this.labels = data.map(d => d.label);
      }
    });
  }
}
