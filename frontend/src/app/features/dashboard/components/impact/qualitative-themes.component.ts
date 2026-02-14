import { Component, input, effect } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { QualitativeTheme } from '../../models/impact.model';
import { ChartCardComponent } from '../shared/chart-card.component';
import { CHART_COLORS, CHART_GRID_BORDER } from '../../../../theme.constants';
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
  selector: 'app-qualitative-themes',
  imports: [NgApexchartsModule, ChartCardComponent],
  template: `
    <app-chart-card title='Common Feedback Themes' subtitle='Extracted from meeting feedback comments'>
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
export class QualitativeThemesComponent {
  data = input.required<QualitativeTheme[]>();

  series: ApexAxisChartSeries = [];
  chart: ApexChart = { type: 'bar', height: 320, toolbar: { show: false } };
  xaxis: ApexXAxis = { categories: [] };
  yaxis: ApexYAxis = { title: { text: 'Frequency' } };
  dataLabels: ApexDataLabels = { enabled: true };
  plotOptions: ApexPlotOptions = {
    bar: { borderRadius: 4, horizontal: true, barHeight: '60%' },
  };
  grid: ApexGrid = { borderColor: CHART_GRID_BORDER, strokeDashArray: 4 };
  tooltip: ApexTooltip = { theme: 'light' };
  colors = [CHART_COLORS.chart7];

  constructor() {
    effect(() => {
      const items = this.data();
      if (items.length) {
        const sorted = [...items].sort((a, b) => b.frequency - a.frequency);
        this.series = [{ name: 'Mentions', data: sorted.map((d) => d.frequency) }];
        this.xaxis = { categories: sorted.map((d) => d.theme) };
      }
    });
  }
}
