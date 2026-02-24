import { Component, input, effect } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SentimentBucket } from '../../models/dashboard.model';
import { ChartCardComponent } from '../shared/chart-card.component';
import { SEMANTIC_COLORS, CHART_GRID_BORDER } from '../../../../theme.constants';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexGrid,
  ApexTooltip,
} from 'ng-apexcharts';

@Component({
  selector: 'app-sentiment-distribution',
  imports: [NgApexchartsModule, ChartCardComponent],
  template: `
    <app-chart-card title='Emotional Impact of Meetings'>
      <apx-chart
        [series]='series'
        [chart]='chart'
        [xaxis]='xaxis'
        [dataLabels]='dataLabels'
        [plotOptions]='plotOptions'
        [grid]='grid'
        [tooltip]='tooltip'
        [colors]='colors'
      />
      @if (motivatedPct > 0) {
        <p class='text-sm text-muted-foreground-1 mt-2'>
          {{ motivatedPct }}% reported motivated feeling
        </p>
      }
    </app-chart-card>
  `,
})
export class SentimentDistributionComponent {
  data = input.required<SentimentBucket[]>();
  motivatedPct = 0;

  series: ApexAxisChartSeries = [];
  chart: ApexChart = { type: 'bar', height: 280, toolbar: { show: false } };
  xaxis: ApexXAxis = { categories: [] };
  dataLabels: ApexDataLabels = { enabled: true };
  plotOptions: ApexPlotOptions = {
    bar: { borderRadius: 6, columnWidth: '50%', distributed: true },
  };
  grid: ApexGrid = { borderColor: CHART_GRID_BORDER, strokeDashArray: 4 };
  tooltip: ApexTooltip = { theme: 'light' };
  colors = [SEMANTIC_COLORS.danger, '#9ca3af', SEMANTIC_COLORS.success];

  constructor() {
    effect(() => {
      const items = this.data();
      if (items.length) {
        const labelMap: Record<string, string> = {
          stressed: 'Stressed',
          neutral: 'Neutral',
          motivated: 'Motivated',
        };
        this.series = [{ name: 'Count', data: items.map((d) => d.count) }];
        this.xaxis = { categories: items.map((d) => labelMap[d.sentiment] ?? d.sentiment) };
        const motivated = items.find((d) => d.sentiment === 'motivated');
        this.motivatedPct = motivated?.percentage ?? 0;
      }
    });
  }
}
