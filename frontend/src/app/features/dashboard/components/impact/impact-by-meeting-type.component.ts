import { Component, input, effect, signal } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ImpactByType } from '../../models/dashboard.model';
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
  selector: 'app-impact-by-meeting-type',
  imports: [NgApexchartsModule, ChartCardComponent],
  template: `
    <app-chart-card title='Impact by Meeting Type'>
      <div class='flex gap-2 mb-3'>
        <button type='button'
          class='px-2 py-1 text-xs rounded border transition-colors'
          [class.bg-primary]='viewMode() === "chart"'
          [class.text-white]='viewMode() === "chart"'
          [class.border-primary]='viewMode() === "chart"'
          [class.border-gray-300]='viewMode() !== "chart"'
          (click)='viewMode.set("chart")'>Chart</button>
        <button type='button'
          class='px-2 py-1 text-xs rounded border transition-colors'
          [class.bg-primary]='viewMode() === "table"'
          [class.text-white]='viewMode() === "table"'
          [class.border-primary]='viewMode() === "table"'
          [class.border-gray-300]='viewMode() !== "table"'
          (click)='viewMode.set("table")'>Table</button>
      </div>

      @if (viewMode() === 'chart') {
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
      } @else {
        <div class='overflow-x-auto'>
          <table class='min-w-full divide-y divide-card-divider text-sm'>
            <thead>
              <tr>
                <th class='px-3 py-2 text-start text-xs font-medium text-muted-foreground-1 uppercase'>Type</th>
                <th class='px-3 py-2 text-start text-xs font-medium text-muted-foreground-1 uppercase'>Efficiency</th>
                <th class='px-3 py-2 text-start text-xs font-medium text-muted-foreground-1 uppercase'>Emotion</th>
                <th class='px-3 py-2 text-start text-xs font-medium text-muted-foreground-1 uppercase'>Energy</th>
                <th class='px-3 py-2 text-start text-xs font-medium text-muted-foreground-1 uppercase'>Disruption</th>
              </tr>
            </thead>
            <tbody class='divide-y divide-card-divider'>
              @for (item of data(); track item.type) {
                <tr class='hover:bg-muted'>
                  <td class='px-3 py-2 font-medium text-foreground'>{{ item.type }}</td>
                  <td class='px-3 py-2' [class.text-green-600]='item.avgEfficiency >= 4' [class.text-red-600]='item.avgEfficiency < 3'>{{ item.avgEfficiency }}</td>
                  <td class='px-3 py-2' [class.text-green-600]='item.avgEmotional > 0' [class.text-red-600]='item.avgEmotional < 0'>{{ item.avgEmotional }}</td>
                  <td class='px-3 py-2' [class.text-green-600]='item.avgEnergy >= 4' [class.text-red-600]='item.avgEnergy < 3'>{{ item.avgEnergy }}</td>
                  <td class='px-3 py-2' [class.text-green-600]='item.avgDisruption <= 2' [class.text-red-600]='item.avgDisruption > 3'>{{ item.avgDisruption }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </app-chart-card>
  `,
})
export class ImpactByMeetingTypeComponent {
  data = input.required<ImpactByType[]>();
  viewMode = signal<'chart' | 'table'>('chart');

  series: ApexAxisChartSeries = [];
  chart: ApexChart = { type: 'bar', height: 320, toolbar: { show: false } };
  xaxis: ApexXAxis = { categories: [] };
  yaxis: ApexYAxis = { max: 5, min: 0, title: { text: 'Score' } };
  dataLabels: ApexDataLabels = { enabled: false };
  plotOptions: ApexPlotOptions = { bar: { borderRadius: 4, columnWidth: '70%' } };
  grid: ApexGrid = { borderColor: CHART_GRID_BORDER, strokeDashArray: 4 };
  tooltip: ApexTooltip = { theme: 'light' };
  legend: ApexLegend = { position: 'top', fontSize: '12px' };
  colors = [CHART_SERIES_PALETTE[0], CHART_SERIES_PALETTE[1], CHART_SERIES_PALETTE[2], CHART_SERIES_PALETTE[3]];

  constructor() {
    effect(() => {
      const items = this.data();
      if (items.length) {
        this.xaxis = { categories: items.map((d) => d.type) };
        this.series = [
          { name: 'Efficiency', data: items.map((d) => d.avgEfficiency) },
          { name: 'Energy', data: items.map((d) => d.avgEnergy) },
          { name: 'Disruption', data: items.map((d) => d.avgDisruption) },
        ];
      }
    });
  }
}
