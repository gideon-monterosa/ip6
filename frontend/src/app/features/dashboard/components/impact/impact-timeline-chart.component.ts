import { Component, input, effect } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ImpactTimelineHour } from '../../models/dashboard.model';
import { ChartCardComponent } from '../shared/chart-card.component';
import { CHART_GRID_BORDER, CHART_SEMANTIC, CHART_COLORS } from '../../../../theme.constants';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexDataLabels,
  ApexGrid,
  ApexTooltip,
  ApexLegend,
  ApexMarkers,
} from 'ng-apexcharts';

@Component({
  selector: 'app-impact-timeline-chart',
  imports: [NgApexchartsModule, ChartCardComponent],
  template: `
    <app-chart-card title='Impact Timeline' subtitle='Average impact scores by time across the workweek'>
      <apx-chart
        [series]='series'
        [chart]='chart'
        [xaxis]='xaxis'
        [yaxis]='yaxis'
        [stroke]='stroke'
        [dataLabels]='dataLabels'
        [grid]='grid'
        [tooltip]='tooltip'
        [legend]='legend'
        [colors]='colors'
        [markers]='markers'
      />
    </app-chart-card>
  `,
})
export class ImpactTimelineChartComponent {
  data = input.required<ImpactTimelineHour[]>();

  series: ApexAxisChartSeries = [];
  chart: ApexChart = {
    type: 'line',
    height: 350,
    toolbar: { show: false },
    zoom: { enabled: false },
    selection: { enabled: false }
  };
  xaxis: ApexXAxis = { categories: [], tooltip: { enabled: false } };
  yaxis: ApexYAxis = { min: 1, max: 5, tickAmount: 4, title: { text: 'Score' } };
  stroke: ApexStroke = { curve: 'smooth', width: 3 };
  dataLabels: ApexDataLabels = { enabled: false };
  grid: ApexGrid = { borderColor: CHART_GRID_BORDER, strokeDashArray: 4 };
  tooltip: ApexTooltip = { theme: 'light', shared: true, intersect: false };
  legend: ApexLegend = { position: 'top', horizontalAlign: 'center' };
  markers: ApexMarkers = { size: 4, hover: { size: 6 } };

  // Using standard colors: Green for Positive/ROTI, Blue for Energy, Red for Disruption
  colors = [CHART_SEMANTIC.step5, CHART_COLORS.chart5, CHART_SEMANTIC.step1];

  constructor() {
    effect(() => {
      const items = this.data();
      if (items.length) {
        this.xaxis = { ...this.xaxis, categories: items.map(d => d.hour) };

        this.series = [
          {
            name: 'ROTI (Worth my time)',
            data: items.map(d => d.avgEfficiency)
          },
          {
            name: 'Energy Level',
            data: items.map(d => d.avgEnergy)
          },
          {
            name: 'Focus Disruption',
            data: items.map(d => d.avgDisruption)
          }
        ];
      }
    });
  }
}
