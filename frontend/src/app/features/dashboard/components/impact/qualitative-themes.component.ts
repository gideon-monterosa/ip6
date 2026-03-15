import { Component, input, effect } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ThemeFrequency } from '../../models/dashboard.model';
import { ChartCardComponent } from '../shared/chart-card.component';
import { CHART_GRID_BORDER, CHART_SEMANTIC } from '../../../../theme.constants';
import { IssueTag, POSITIVE_TAG_LABELS, ISSUE_TAG_LABELS, PositiveTag } from '../../../feedback-inbox/models/feedback.model';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexGrid,
  ApexTooltip,
  ApexStroke,
} from 'ng-apexcharts';

@Component({
  selector: 'app-qualitative-themes',
  imports: [NgApexchartsModule, ChartCardComponent],
  template: `
    <app-chart-card title='Meeting Characteristics' subtitle='Comparison of positive and negative feedback themes'>
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
        [stroke]='stroke'
      />
    </app-chart-card>
  `,
})
export class QualitativeThemesComponent {
  data = input.required<ThemeFrequency[]>();

  series: ApexAxisChartSeries = [];
  chart: ApexChart = { 
    type: 'bar', 
    height: 600, 
    stacked: true, 
    toolbar: { show: false },
    offsetY: 0,
    offsetX: 10
  };
  xaxis: ApexXAxis = {
    categories: [],
    labels: {
      formatter: (val) => {
        const num = Number(val);
        return Math.floor(num) === num ? Math.abs(num).toString() : '';
      },
    },
    axisTicks: { show: true },
    axisBorder: { show: true }
  };
  yaxis: ApexYAxis = {
    labels: {
      style: { fontWeight: 500 },
      maxWidth: 250, // Increased to prevent cutoff
    }
  };
  dataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val) => Math.abs(Number(val)).toString(),
  };
  plotOptions: ApexPlotOptions = {
    bar: {
      borderRadius: 4,
      horizontal: true,
      barHeight: '80%',
    },
  };
  stroke: ApexStroke = { width: 1, colors: ['#fff'] };
  grid: ApexGrid = { borderColor: CHART_GRID_BORDER, strokeDashArray: 4, xaxis: { lines: { show: true } } };
  tooltip: ApexTooltip = {
    theme: 'light',
    y: {
      formatter: (val) => Math.abs(val).toString(),
    },
  };
  colors = [CHART_SEMANTIC.positive, CHART_SEMANTIC.disruption];

  constructor() {
    effect(() => {
      const items = this.data();
      if (items.length) {
        const groups = [
          { label: 'Agenda', positive: PositiveTag.CLEAR_AGENDA, negative: IssueTag.NO_CLEAR_AGENDA },
          { label: 'Purpose', positive: PositiveTag.CLEAR_PURPOSE, negative: IssueTag.UNCLEAR_PURPOSE },
          { label: 'Outcomes', positive: PositiveTag.CLEAR_DECISIONS, negative: IssueTag.NO_CLEAR_OUTCOME },
          { label: 'Timing', positive: PositiveTag.GOOD_TIME, negative: IssueTag.BAD_TIME },
          { label: 'Duration', positive: PositiveTag.EFFICIENT_STRUCTURED, negative: IssueTag.TOO_LONG },
          { label: 'Relevance', positive: PositiveTag.HELPED_PROGRESS, negative: IssueTag.NO_RELEVANCE },
          { label: 'Energy', positive: PositiveTag.ENERGIZING_DISCUSSION, negative: IssueTag.MENTALLY_DRAINING },
        ];

        const positiveData: number[] = [];
        const negativeData: number[] = [];
        const categories: string[] = [];

        const themeMap = new Map(items.map((i) => [i.theme, i.frequency]));
        const groupedTags = new Set<string>();

        for (const g of groups) {
          const posVal = themeMap.get(g.positive) || 0;
          const negVal = themeMap.get(g.negative) || 0;

          if (posVal > 0 || negVal > 0) {
            categories.push(g.label);
            positiveData.push(posVal);
            negativeData.push(-negVal);
          }

          groupedTags.add(g.positive);
          groupedTags.add(g.negative);
        }

        const remainingEntries: { label: string, positive: number, negative: number, total: number }[] = [];

        items.forEach(item => {
          if (!groupedTags.has(item.theme)) {
            if (Object.values(PositiveTag).includes(item.theme as PositiveTag)) {
              remainingEntries.push({
                label: POSITIVE_TAG_LABELS[item.theme as PositiveTag] || item.theme,
                positive: item.frequency,
                negative: 0,
                total: item.frequency
              });
            } else if (Object.values(IssueTag).includes(item.theme as IssueTag)) {
              remainingEntries.push({
                label: ISSUE_TAG_LABELS[item.theme as IssueTag] || item.theme,
                positive: 0,
                negative: item.frequency,
                total: item.frequency
              });
            }
          }
        });

        remainingEntries.sort((a, b) => b.total - a.total);

        remainingEntries.forEach(entry => {
          categories.push(entry.label);
          positiveData.push(entry.positive);
          negativeData.push(-entry.negative);
        });

        this.series = [
          { name: 'Positive', data: positiveData },
          { name: 'Negative', data: negativeData },
        ];

        const maxVal = Math.max(
          ...positiveData,
          ...negativeData.map(Math.abs),
          1 // min 1
        );
        
        this.xaxis = { 
          ...this.xaxis, 
          categories,
          min: -maxVal,
          max: maxVal,
          tickAmount: maxVal * 2
        };

        const newHeight = Math.max(400, categories.length * 40 + 100);
        this.chart = { ...this.chart, height: newHeight };
      }
    });
  }
}
