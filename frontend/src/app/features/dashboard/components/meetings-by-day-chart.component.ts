import { Component, input, effect } from "@angular/core";
import { NgApexchartsModule } from "ng-apexcharts";
import { DayData } from "../models/dashboard.model";
import { CHART_PRIMARY, CHART_GRID_BORDER } from "../../../theme.constants";
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexGrid,
  ApexTooltip,
} from "ng-apexcharts";

@Component({
  selector: "app-meetings-by-day-chart",
  imports: [NgApexchartsModule],
  template: `
    <div
      class="bg-white border border-gray-200 shadow-2xs rounded-xl p-4 md:p-5"
    >
      <h4 class="text-sm font-medium text-gray-500 uppercase mb-3">
        Meetings by Day
      </h4>
      <apx-chart
        [series]="series"
        [chart]="chart"
        [xaxis]="xaxis"
        [yaxis]="yaxis"
        [dataLabels]="dataLabels"
        [plotOptions]="plotOptions"
        [grid]="grid"
        [tooltip]="tooltip"
        [colors]="colors"
      />
    </div>
  `,
})
export class MeetingsByDayChartComponent {
  days = input.required<DayData[]>();

  series: ApexAxisChartSeries = [];
  chart: ApexChart = { type: "bar", height: 300, toolbar: { show: false } };
  xaxis: ApexXAxis = { categories: [] };
  yaxis: ApexYAxis = { title: { text: "Meetings" } };
  dataLabels: ApexDataLabels = { enabled: false };
  plotOptions: ApexPlotOptions = {
    bar: { borderRadius: 6, columnWidth: "50%" },
  };
  grid: ApexGrid = { borderColor: CHART_GRID_BORDER, strokeDashArray: 4 };
  tooltip: ApexTooltip = { theme: "light" };
  colors = [CHART_PRIMARY];

  constructor() {
    effect(() => {
      const data = this.days();
      if (data.length) {
        this.series = [{ name: "Meetings", data: data.map((d) => d.count) }];
        this.xaxis = { categories: data.map((d) => d.day) };
      }
    });
  }
}
