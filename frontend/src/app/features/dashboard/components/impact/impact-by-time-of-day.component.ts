import { Component, input, effect } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TimeOfDayImpact } from '../../models/impact.model';
import { ChartCardComponent } from '../shared/chart-card.component';
import { CHART_SERIES_PALETTE, CHART_GRID_BORDER } from '../../../../theme.constants';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexGrid,
  ApexTooltip,
  ApexLegend,
} from 'ng-apexcharts';

@Component({
  selector: 'app-impact-by-time-of-day',
  imports: [NgApexchartsModule, ChartCardComponent],
  template: `
    <app-chart-card title='Impact by Time of Day'>
      <apx-chart
        [series]='series'
        [chart]='chart'
        [xaxis]='xaxis'
        [yaxis]='yaxis'
        [dataLabels]='dataLabels'
        [plotOptions]='plotOptions'
        [grid]='grid'
        [tooltip]='tooltip'
        [legend]='legend'
        [colors]='colors'
      />
      @if (worstTime) {
        <p class='text-sm text-muted-foreground-1 mt-2'>
          {{ worstTime }} meetings perceived as most disruptive
        </p>
      }
    </app-chart-card>
  `,
})
export class ImpactByTimeOfDayComponent {
  data = input.required<TimeOfDayImpact[]>();
  worstTime = '';

  series: ApexAxisChartSeries = [];
  chart: ApexChart = { type: 'bar', height: 300, toolbar: { show: false } };
  xaxis: ApexXAxis = { categories: [] };
  yaxis: ApexYAxis = { max: 5, min: 0, title: { text: 'Score' } };
  dataLabels: ApexDataLabels = { enabled: true, style: { fontSize: '10px' } };
  plotOptions: ApexPlotOptions = { bar: { borderRadius: 4, columnWidth: '60%' } };
  grid: ApexGrid = { borderColor: CHART_GRID_BORDER, strokeDashArray: 4 };
  tooltip: ApexTooltip = { theme: 'light' };
  legend: ApexLegend = { position: 'top', fontSize: '12px' };
  colors = [CHART_SERIES_PALETTE[0], CHART_SERIES_PALETTE[1], CHART_SERIES_PALETTE[2]];

  constructor() {
    effect(() => {
      const items = this.data();
      if (items.length) {
        this.xaxis = { categories: items.map((d) => d.timeOfDay) };
        this.series = [
          { name: 'Efficiency', data: items.map((d) => d.avgEfficiency) },
          { name: 'Emotion', data: items.map((d) => Math.round((d.avgEmotional + 2) * 12.5) / 10) },
          { name: 'Disruption', data: items.map((d) => d.avgDisruption) },
        ];
        const worst = items.reduce((prev, curr) =>
          curr.avgDisruption > prev.avgDisruption ? curr : prev,
        );
        this.worstTime = worst.timeOfDay;
      }
    });
  }
}
