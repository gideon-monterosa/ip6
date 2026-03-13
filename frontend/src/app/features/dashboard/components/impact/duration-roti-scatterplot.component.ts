import { Component, input, effect } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DurationEfficiency } from '../../models/dashboard.model';
import { ChartCardComponent } from '../shared/chart-card.component';
import { CHART_PRIMARY, CHART_GRID_BORDER } from '../../../../theme.constants';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTooltip,
  ApexGrid,
  ApexMarkers,
} from 'ng-apexcharts';

@Component({
  selector: 'app-duration-roti-scatterplot',
  imports: [NgApexchartsModule, ChartCardComponent],
  template: `
    <app-chart-card title='Duration vs. ROTI' subtitle='Comparison of meeting duration (objective) and ROTI score (subjective)'>
      <apx-chart
        [series]='series'
        [chart]='chart'
        [xaxis]='xaxis'
        [yaxis]='yaxis'
        [tooltip]='tooltip'
        [grid]='grid'
        [markers]='markers'
        [colors]='colors'
      />
    </app-chart-card>
  `,
})
export class DurationRotiScatterplotComponent {
  data = input.required<DurationEfficiency[]>();

  series: ApexAxisChartSeries = [];
  chart: ApexChart = {
    type: 'scatter',
    height: 350,
    zoom: { enabled: true, type: 'xy' },
    toolbar: { show: false },
  };
  xaxis: ApexXAxis = {
    title: { text: 'Meeting Duration (minutes)' },
    tickAmount: 10,
    labels: { formatter: (val) => `${val}m` },
  };
  yaxis: ApexYAxis = {
    title: { text: 'ROTI Score (1-5)' },
    min: 0,
    max: 5,
    tickAmount: 5,
  };
  tooltip: ApexTooltip = {
    custom: ({ series, seriesIndex, dataPointIndex, w }) => {
      const d = w.config.series[seriesIndex].data[dataPointIndex];
      return `
        <div class="p-2 border bg-background shadow-sm rounded-md text-sm">
          <div class="font-medium">Meeting Info</div>
          <div>Duration: <span class="font-semibold">${d[0]}m</span></div>
          <div>ROTI: <span class="font-semibold">${d[1]}/5</span></div>
        </div>
      `;
    },
  };
  grid: ApexGrid = { borderColor: CHART_GRID_BORDER, strokeDashArray: 4 };
  markers: ApexMarkers = { size: 6, strokeWidth: 0, fillOpacity: 0.7 };
  colors = [CHART_PRIMARY];

  constructor() {
    effect(() => {
      const items = this.data();
      if (items.length) {
        this.series = [
          {
            name: 'Meetings',
            data: items.map((item) => [item.duration, item.efficiency]),
          },
        ];
      } else {
        this.series = [];
      }
    });
  }
}
