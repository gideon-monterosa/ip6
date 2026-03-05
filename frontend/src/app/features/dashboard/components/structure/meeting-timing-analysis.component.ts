import { Component, input, effect } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { WeekMeeting } from '../../models/dashboard.model';
import { UserSettings } from '../../../../core/models/user.model';
import { ChartCardComponent } from '../shared/chart-card.component';
import { CHART_GRID_BORDER, CHART_PRIMARY } from '../../../../theme.constants';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexGrid,
  ApexTooltip,
  ApexStroke,
} from 'ng-apexcharts';

@Component({
  selector: 'app-meeting-timing-analysis',
  imports: [NgApexchartsModule, ChartCardComponent],
  template: `
    <app-chart-card title='Weekly Meeting Intensity' subtitle='Combined meeting density across all work days'>
      @if (series.length) {
        <apx-chart
          [series]='series'
          [chart]='chart'
          [xaxis]='xaxis'
          [dataLabels]='dataLabels'
          [plotOptions]='plotOptions'
          [grid]='grid'
          [tooltip]='tooltip'
          [colors]='colors'
          [stroke]='stroke'
        />
      } @else {
        <div class="flex items-center justify-center h-[200px] text-gray-500">
          No meeting data for this week
        </div>
      }
    </app-chart-card>
  `,
})
export class MeetingTimingAnalysisComponent {
  meetings = input.required<WeekMeeting[]>();
  settings = input.required<UserSettings | null>();

  series: ApexAxisChartSeries = [];
  chart: ApexChart = { type: 'heatmap', height: 180, toolbar: { show: false } };
  xaxis: ApexXAxis = { type: 'category', position: 'top' };
  dataLabels: ApexDataLabels = { enabled: false };
  plotOptions: ApexPlotOptions = {
    heatmap: {
      radius: 4,
      enableShades: true,
      shadeIntensity: 0.5,
      colorScale: {
        ranges: [
          { from: 0, to: 0, color: '#f3f4f6', name: 'None' },
          { from: 1, to: 60, color: '#bfdbfe', name: 'Low' },
          { from: 61, to: 180, color: '#60a5fa', name: 'Medium' },
          { from: 181, to: 2000, color: '#2563eb', name: 'High' },
        ],
      },
    },
  };
  grid: ApexGrid = { borderColor: CHART_GRID_BORDER, strokeDashArray: 4 };
  stroke: ApexStroke = { width: 2, colors: ['#fff'] };

  private counts: number[] = [];

  tooltip: ApexTooltip = {
    theme: 'light',
    y: {
      formatter: (val, opts) => {
        const count = this.counts[opts.dataPointIndex];
        return `${val} min (${count} ${count === 1 ? 'meeting' : 'meetings'})`;
      },
    },
  };
  colors = [CHART_PRIMARY];

  constructor() {
    effect(() => {
      const meetings = this.meetings();
      const settings = this.settings();

      if (settings) {
        this.buildHeatmap(meetings, settings);
      }
    });
  }

  private buildHeatmap(meetings: WeekMeeting[], settings: UserSettings) {
    const startHour = parseInt(settings.workStartTime.split(':')[0], 10);
    const endHour = parseInt(settings.workEndTime.split(':')[0], 10);
    const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

    const hourLabels = hours.map(h => `${h}:00`);
    const categories = ['Earlier', ...hourLabels, 'Later'];

    const stats = new Map<string, { minutes: number, count: number }>();
    categories.forEach(cat => stats.set(cat, { minutes: 0, count: 0 }));

    meetings.forEach((m) => {
      const date = new Date(m.startTime);
      const hour = date.getHours();

      let key: string;
      if (hour < startHour) {
        key = 'Earlier';
      } else if (hour > endHour) {
        key = 'Later';
      } else {
        key = `${hour}:00`;
      }

      const s = stats.get(key);
      if (s) {
        s.minutes += m.durationMinutes;
        s.count += 1;
      }
    });

    this.counts = categories.map(cat => stats.get(cat)!.count);

    this.series = [{
      name: 'Weekly Profile',
      data: categories.map((cat) => ({
        x: cat,
        y: stats.get(cat)!.minutes,
      })),
    }];

    this.xaxis = {
      type: 'category',
      position: 'top',
      categories: categories
    };
  }
}
