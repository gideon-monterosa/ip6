import { Component, input, effect, computed } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FragmentationDay } from '../../models/dashboard.model';
import { ChartCardComponent } from '../shared/chart-card.component';
import { CHART_GRID_BORDER, SEMANTIC_COLORS } from '../../../../theme.constants';
import {
  ApexNonAxisChartSeries,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexFill,
  ApexPlotOptions,
  ApexGrid,
  ApexDataLabels,
  ApexTooltip,
} from 'ng-apexcharts';

@Component({
  selector: 'app-fragmentation-score',
  imports: [NgApexchartsModule, ChartCardComponent],
  template: `
    <app-chart-card title='Calendar Fragmentation Score'>
      @if (currentScore() !== null) {
        <!-- Radial gauge -->
        <div class='flex justify-center mb-4'>
          <apx-chart
            [series]='gaugeSeries'
            [chart]='gaugeChart'
            [plotOptions]='gaugePlotOptions'
            [labels]='gaugeLabels'
            [colors]='gaugeColors'
          />
        </div>
        <div class='text-center mb-4'>
          <span class='text-lg font-bold' [style.color]='scoreColor()'>{{ scoreLabel() }}</span>
        </div>
        <!-- Trend line -->
        <apx-chart
          [series]='trendSeries'
          [chart]='trendChart'
          [xaxis]='trendXaxis'
          [yaxis]='trendYaxis'
          [stroke]='trendStroke'
          [grid]='trendGrid'
          [dataLabels]='trendDataLabels'
          [tooltip]='trendTooltip'
          [colors]='trendColors'
        />
      }
    </app-chart-card>
  `,
})
export class FragmentationScoreComponent {
  data = input.required<FragmentationDay[]>();

  currentScore = computed(() => {
    const items = this.data();
    return items.length > 0 ? items[items.length - 1].score : null;
  });

  scoreColor = computed(() => {
    const score = this.currentScore();
    if (score === null) return '#000';
    if (score <= 40) return SEMANTIC_COLORS.success;
    if (score <= 70) return '#eab308';
    return SEMANTIC_COLORS.danger;
  });

  scoreLabel = computed(() => {
    const score = this.currentScore();
    if (score === null) return '';
    if (score <= 40) return 'Good';
    if (score <= 70) return 'Fair';
    return 'Poor';
  });

  // Gauge
  gaugeSeries: ApexNonAxisChartSeries = [0];
  gaugeChart: ApexChart = { type: 'radialBar', height: 200 };
  gaugePlotOptions: ApexPlotOptions = {
    radialBar: {
      startAngle: -135,
      endAngle: 135,
      hollow: { size: '60%' },
      track: { background: '#e5e7eb' },
      dataLabels: {
        name: { show: false },
        value: { fontSize: '24px', fontWeight: 'bold', offsetY: 5 },
      },
    },
  };
  gaugeLabels = ['Fragmentation'];
  gaugeColors: string[] = [SEMANTIC_COLORS.success];

  // Trend line
  trendSeries: ApexAxisChartSeries = [];
  trendChart: ApexChart = { type: 'line', height: 200, toolbar: { show: false } };
  trendXaxis: ApexXAxis = { categories: [] };
  trendYaxis: ApexYAxis = { min: 0, max: 100, title: { text: 'Score' } };
  trendStroke: ApexStroke = { curve: 'smooth', width: 2 };
  trendGrid: ApexGrid = { borderColor: CHART_GRID_BORDER, strokeDashArray: 4 };
  trendDataLabels: ApexDataLabels = { enabled: false };
  trendTooltip: ApexTooltip = { theme: 'light' };
  trendColors = ['#2563eb'];

  constructor() {
    effect(() => {
      const items = this.data();
      if (items.length) {
        const score = items[items.length - 1].score;
        this.gaugeSeries = [score];
        if (score <= 40) this.gaugeColors = [SEMANTIC_COLORS.success];
        else if (score <= 70) this.gaugeColors = ['#eab308'];
        else this.gaugeColors = [SEMANTIC_COLORS.danger];

        this.trendSeries = [{ name: 'Fragmentation', data: items.map((d) => d.score) }];
        this.trendXaxis = {
          categories: items.map((d) => d.date),
          labels: { rotate: -45, style: { fontSize: '10px' } },
        };
      }
    });
  }
}
