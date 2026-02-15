import { Component, input, effect, computed } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { EfficiencyDistribution } from '../../models/impact.model';
import { ChartCardComponent } from '../shared/chart-card.component';
import { CHART_GRID_BORDER } from '../../../../theme.constants';
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

@Component({
  selector: 'app-efficiency-distribution',
  imports: [NgApexchartsModule, ChartCardComponent],
  template: `
    <app-chart-card title='Perceived Meeting Efficiency'>
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
      <div class='flex gap-3 mt-3'>
        <span class='inline-flex items-center gap-1 text-xs'>
          <span class='size-2 rounded-full bg-red-500'></span>
          Low (1-2): {{ lowPct() }}%
        </span>
        <span class='inline-flex items-center gap-1 text-xs'>
          <span class='size-2 rounded-full bg-yellow-500'></span>
          Medium (3): {{ medPct() }}%
        </span>
        <span class='inline-flex items-center gap-1 text-xs'>
          <span class='size-2 rounded-full bg-green-500'></span>
          High (4-5): {{ highPct() }}%
        </span>
      </div>
    </app-chart-card>
  `,
})
export class EfficiencyDistributionComponent {
  data = input.required<EfficiencyDistribution[]>();

  lowPct = computed(() => {
    const items = this.data();
    return items.filter((d) => d.scale <= 2).reduce((s, d) => s + d.percentage, 0).toFixed(1);
  });

  medPct = computed(() => {
    const items = this.data();
    return items.filter((d) => d.scale === 3).reduce((s, d) => s + d.percentage, 0).toFixed(1);
  });

  highPct = computed(() => {
    const items = this.data();
    return items.filter((d) => d.scale >= 4).reduce((s, d) => s + d.percentage, 0).toFixed(1);
  });

  series: ApexAxisChartSeries = [];
  chart: ApexChart = { type: 'bar', height: 280, toolbar: { show: false } };
  xaxis: ApexXAxis = { categories: [] };
  yaxis: ApexYAxis = { title: { text: 'Count' } };
  dataLabels: ApexDataLabels = { enabled: true };
  plotOptions: ApexPlotOptions = {
    bar: { borderRadius: 4, columnWidth: '60%', distributed: true },
  };
  grid: ApexGrid = { borderColor: CHART_GRID_BORDER, strokeDashArray: 4 };
  tooltip: ApexTooltip = { theme: 'light' };
  colors = ['#dc2626', '#f97316', '#eab308', '#22c55e', '#16a34a'];

  constructor() {
    effect(() => {
      const items = this.data();
      if (items.length) {
        this.series = [{ name: 'Responses', data: items.map((d) => d.count) }];
        this.xaxis = { categories: items.map((d) => '' + d.scale) };
      }
    });
  }
}
