import { Component, input, effect, signal, computed } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FocusBlockDay } from '../../models/dashboard.model';
import { ChartCardComponent } from '../shared/chart-card.component';
import { CHART_PRIMARY, CHART_GRID_BORDER } from '../../../../theme.constants';
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
  selector: 'app-focus-time-analysis',
  imports: [NgApexchartsModule, ChartCardComponent],
  template: `
    <app-chart-card title='Uninterrupted Focus Time Blocks'>
      <div class='flex gap-2 mb-3'>
        @for (opt of blockOptions; track opt.value) {
          <button type='button'
            class='px-2 py-1 text-xs rounded border transition-colors'
            [class.bg-primary]='selectedBlock() === opt.value'
            [class.text-white]='selectedBlock() === opt.value'
            [class.border-primary]='selectedBlock() === opt.value'
            [class.border-gray-300]='selectedBlock() !== opt.value'
            (click)='selectedBlock.set(opt.value)'>
            {{ opt.label }}
          </button>
        }
      </div>
      <div class='mb-3 text-sm'>
        <span class='font-medium' [class.text-green-600]='totalBlocks() >= 10' [class.text-foreground]='totalBlocks() < 10'>
          {{ totalBlocks() }} blocks
        </span>
        <span class='text-muted-foreground-1'> of {{ selectedBlock() }}+ min available</span>
      </div>
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
    </app-chart-card>
  `,
})
export class FocusTimeAnalysisComponent {
  data = input.required<FocusBlockDay[]>();

  blockOptions = [
    { label: '>= 60 min', value: 60 },
    { label: '>= 90 min', value: 90 },
    { label: '>= 120 min', value: 120 },
  ];
  selectedBlock = signal(60);

  totalBlocks = computed(() => {
    const items = this.data();
    const block = this.selectedBlock();
    return items.reduce((sum, d) => {
      if (block === 60) return sum + d.blocks60min;
      if (block === 90) return sum + d.blocks90min;
      return sum + d.blocks120min;
    }, 0);
  });

  series: ApexAxisChartSeries = [];
  chart: ApexChart = { type: 'bar', height: 280, toolbar: { show: false } };
  xaxis: ApexXAxis = { categories: [] };
  yaxis: ApexYAxis = { title: { text: 'Focus Blocks' } };
  dataLabels: ApexDataLabels = { enabled: true };
  plotOptions: ApexPlotOptions = { bar: { borderRadius: 4, columnWidth: '60%' } };
  grid: ApexGrid = { borderColor: CHART_GRID_BORDER, strokeDashArray: 4 };
  tooltip: ApexTooltip = { theme: 'light' };
  colors = [CHART_PRIMARY];

  constructor() {
    effect(() => {
      const items = this.data();
      const block = this.selectedBlock();
      if (items.length) {
        const values = items.map((d) => {
          if (block === 60) return d.blocks60min;
          if (block === 90) return d.blocks90min;
          return d.blocks120min;
        });
        this.series = [{ name: 'Focus Blocks', data: values }];
        this.xaxis = { categories: items.map((d) => d.date) };
      }
    });
  }
}
