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

/**
 * @deprecated This component is replaced by the Daily Flow Analysis.
 */
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
        <div class='text-center mb-6 flex items-center justify-center gap-2'>
          <span class='text-lg font-bold' [style.color]='scoreColor()'>{{ scoreLabel() }}</span>
          
          <!-- Formula Tooltip -->
          <div class="relative group">
            <svg class="w-4 h-4 text-muted-foreground-2 cursor-help transition-colors group-hover:text-blue-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white dark:bg-gray-900 border border-card-line shadow-lg rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
              <p class='text-[11px] font-semibold text-muted-foreground-1 mb-2'>CFS Calculation:</p>
              <div class="bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700 mb-2">
                <code class="text-[10px] font-mono text-blue-600 dark:text-blue-400 block text-center">
                  (Σ Fragmented / Σ Free Time) × 100
                </code>
              </div>
              <ul class='text-[10px] space-y-1 text-muted-foreground-2'>
                <li class="flex items-start gap-1">
                  <span class="text-blue-500">•</span>
                  <span><strong>Free Time:</strong> Work Hours - Meeting Time</span>
                </li>
                <li class="flex items-start gap-1">
                  <span class="text-blue-500">•</span>
                  <span><strong>Fragmented:</strong> Gaps under 60 minutes</span>
                </li>
              </ul>
              <!-- Arrow -->
              <div class="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white dark:border-t-gray-900 drop-shadow-sm"></div>
            </div>
          </div>
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
    return items.length > 0 ? items[items.length - 1].scorePercentage : null;
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
        const score = items[items.length - 1].scorePercentage;
        this.gaugeSeries = [score];
        if (score <= 40) this.gaugeColors = [SEMANTIC_COLORS.success];
        else if (score <= 70) this.gaugeColors = ['#eab308'];
        else this.gaugeColors = [SEMANTIC_COLORS.danger];

        this.trendSeries = [{ name: 'Fragmentation', data: items.map((d) => d.scorePercentage) }];
        this.trendXaxis = {
          categories: items.map((d) => d.date),
          labels: { rotate: -45, style: { fontSize: '10px' } },
        };
      }
    });
  }
}
