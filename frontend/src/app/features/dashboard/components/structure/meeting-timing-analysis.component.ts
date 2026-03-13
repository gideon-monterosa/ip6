import { Component, input, effect } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { WeekMeeting } from '../../models/dashboard.model';
import { UserSettings } from '../../../../core/models/user.model';
import { ChartCardComponent } from '../shared/chart-card.component';
import { CHART_GRID_BORDER, CHART_PRIMARY } from '../../../../theme.constants';
import { parseLocal } from '../../../../core/utils/date.utils';
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

/**
 * @deprecated This component is OBSOLETE and has been replaced by more comprehensive views in the structure dashboard.
 * It is no longer displayed.
 */
@Component({
  selector: 'app-meeting-timing-analysis',
  imports: [NgApexchartsModule, ChartCardComponent],
  template: `
    <app-chart-card title='Weekly Meeting Intensity' subtitle='Shows total meeting minutes across the week. Identifies which hour slots and work periods are most heavily booked.'>
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
    const [startH, startM] = settings.workStartTime.split(':').map(Number);
    const [endH, endM] = settings.workEndTime.split(':').map(Number);

    const workStartTotal = startH * 60 + startM;
    const workEndTotal = endH * 60 + endM;

    const startHour = startH;
    const endHour = endM === 0 ? endH - 1 : endH;

    const hourLabels = [];
    for (let h = startHour; h <= endHour; h++) {
      hourLabels.push(`${h}:00 - ${h + 1}:00`);
    }
    const categories = ['Before', ...hourLabels, 'After'];

    const stats = new Map<string, { minutes: number, count: number, meetingIds: Set<string> }>();
    categories.forEach(cat => stats.set(cat, { minutes: 0, count: 0, meetingIds: new Set() }));

    meetings.forEach((m) => {
      const start = parseLocal(m.startTime);
      const end = parseLocal(m.endTime);

      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) return;

      let iter = new Date(start);
      // We step through the meeting minute by minute (or in larger chunks)
      // For precision and to handle all edge cases, we iterate in chunks of minutes
      while (iter < end) {
        const h = iter.getHours();
        const mInH = iter.getMinutes();
        const timeInMin = h * 60 + mInH;

        // Determine next boundary: either next full hour or meeting end
        const nextHour = new Date(iter);
        nextHour.setHours(h + 1, 0, 0, 0);
        const chunkEnd = nextHour < end ? nextHour : end;
        const duration = Math.round((chunkEnd.getTime() - iter.getTime()) / 60000);

        if (duration > 0) {
          // Now check if this chunk crosses work boundaries
          const chunkStartTotal = timeInMin;
          const chunkEndTotal = timeInMin + duration;

          const processSubChunk = (s: number, e: number) => {
            const dur = e - s;
            if (dur <= 0) return;

            let key: string;
            if (e <= workStartTotal) {
              key = 'Before';
            } else if (s >= workEndTotal) {
              key = 'After';
            } else {
              const hourIdx = Math.floor(s / 60);
              if (hourIdx < startHour) key = 'Before';
              else if (hourIdx > endHour) key = 'After';
              else key = `${hourIdx}:00 - ${hourIdx + 1}:00`;
            }

            const stat = stats.get(key);
            if (stat) {
              stat.minutes += dur;
              if (!stat.meetingIds.has(m.id)) {
                stat.count += 1;
                stat.meetingIds.add(m.id);
              }
            }
          };

          // Split chunk at work start/end if they fall inside
          const boundaries = [chunkStartTotal, chunkEndTotal, workStartTotal, workEndTotal]
            .filter(b => b >= chunkStartTotal && b <= chunkEndTotal)
            .sort((a, b) => a - b);

          const unique = Array.from(new Set(boundaries));
          for (let i = 0; i < unique.length - 1; i++) {
            processSubChunk(unique[i], unique[i+1]);
          }
        }
        iter = chunkEnd;
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
