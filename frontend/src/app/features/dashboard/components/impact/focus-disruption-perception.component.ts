import { Component, input, effect, computed } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FocusDisruptionData } from '../../models/impact.model';
import { ChartCardComponent } from '../shared/chart-card.component';
import { CHART_GRID_BORDER, SEMANTIC_COLORS } from '../../../../theme.constants';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexFill,
  ApexDataLabels,
  ApexGrid,
  ApexTooltip,
} from 'ng-apexcharts';

@Component({
  selector: 'app-focus-disruption-perception',
  imports: [NgApexchartsModule, ChartCardComponent],
  template: `
    <app-chart-card title='Focus Disruption Perception'>
      <!-- Current average metric -->
      <div class='flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg'>
        <div class='text-3xl font-bold' [style.color]='metricColor()'>
          {{ currentAvg() }}
        </div>
        <div>
          <div class='text-sm font-medium text-foreground'>Average Disruption</div>
          <div class='text-xs text-muted-foreground-1'>Scale: 1 (low) – 5 (high)</div>
        </div>
      </div>
      <!-- Trend line -->
      <apx-chart
        [series]='series'
        [chart]='chart'
        [xaxis]='xaxis'
        [yaxis]='yaxis'
        [stroke]='stroke'
        [fill]='fill'
        [dataLabels]='dataLabels'
        [grid]='grid'
        [tooltip]='tooltip'
        [colors]='colors'
      />
    </app-chart-card>
  `,
})
export class FocusDisruptionPerceptionComponent {
  data = input.required<FocusDisruptionData[]>();

  currentAvg = computed(() => {
    const items = this.data();
    if (!items.length) return '0';
    const avg = items.reduce((sum, d) => sum + d.avgDisruption, 0) / items.length;
    return avg.toFixed(1);
  });

  metricColor = computed(() => {
    const avg = parseFloat(this.currentAvg());
    if (avg <= 2) return SEMANTIC_COLORS.success;
    if (avg <= 3.5) return '#eab308';
    return SEMANTIC_COLORS.danger;
  });

  series: ApexAxisChartSeries = [];
  chart: ApexChart = { type: 'area', height: 220, toolbar: { show: false } };
  xaxis: ApexXAxis = { categories: [], labels: { rotate: -45, style: { fontSize: '10px' } } };
  yaxis: ApexYAxis = { min: 1, max: 5, title: { text: 'Disruption Score' } };
  stroke: ApexStroke = { curve: 'smooth', width: 2 };
  fill: ApexFill = {
    type: 'gradient',
    gradient: { opacityFrom: 0.4, opacityTo: 0.1 },
  };
  dataLabels: ApexDataLabels = { enabled: false };
  grid: ApexGrid = { borderColor: CHART_GRID_BORDER, strokeDashArray: 4 };
  tooltip: ApexTooltip = { theme: 'light' };
  colors = ['#f97316'];

  constructor() {
    effect(() => {
      const items = this.data();
      if (items.length) {
        this.series = [{ name: 'Avg Disruption', data: items.map((d) => d.avgDisruption) }];
        this.xaxis = {
          categories: items.map((d) => d.date),
          labels: { rotate: -45, style: { fontSize: '10px' } },
        };
      }
    });
  }
}
