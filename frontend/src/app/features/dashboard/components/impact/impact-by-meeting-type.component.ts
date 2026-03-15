import { Component, input } from '@angular/core';
import { ImpactByType } from '../../models/dashboard.model';
import { ChartCardComponent } from '../shared/chart-card.component';
import { CHART_SEMANTIC } from '../../../../theme.constants';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-impact-by-meeting-type',
  imports: [CommonModule, ChartCardComponent],
  template: `
    <app-chart-card title='Impact Analysis by Meeting Type' subtitle='Heatmap showing average scores across key metrics'>
      <div class='overflow-x-auto'>
        <table class='min-w-full border-separate border-spacing-1'>
          <thead>
            <tr>
              <th class='px-3 py-2 text-start text-xs font-bold text-muted-foreground-1 uppercase tracking-wider'>Meeting Type</th>
              <th class='px-3 py-2 text-center text-xs font-bold text-muted-foreground-1 uppercase tracking-wider'>ROTI</th>
              <th class='px-3 py-2 text-center text-xs font-bold text-muted-foreground-1 uppercase tracking-wider'>Feeling</th>
              <th class='px-3 py-2 text-center text-xs font-bold text-muted-foreground-1 uppercase tracking-wider'>Energy</th>
              <th class='px-3 py-2 text-center text-xs font-bold text-muted-foreground-1 uppercase tracking-wider'>Disruption</th>
            </tr>
          </thead>
          <tbody>
            @for (item of data(); track item.type) {
              <tr>
                <td class='px-3 py-3 font-bold text-sm text-foreground bg-muted/30 rounded-l-lg'>
                  {{ item.type }}
                </td>
                
                <!-- ROTI (1-5) -->
                <td class='px-3 py-3 text-center font-black text-sm transition-transform hover:scale-105 cursor-default'
                    [style.backgroundColor]='getHeatmapColor(item.avgEfficiency, 1, 5)'
                    [style.color]='getTextColor(item.avgEfficiency, 1, 5)'>
                  {{ item.avgEfficiency.toFixed(1) }}
                </td>

                <!-- Feeling (-2 to 2) -->
                <td class='px-3 py-3 text-center font-black text-sm transition-transform hover:scale-105 cursor-default'
                    [style.backgroundColor]='getHeatmapColor(item.avgEmotional, -2, 2)'
                    [style.color]='getTextColor(item.avgEmotional, -2, 2)'>
                  {{ (item.avgEmotional > 0 ? "+" : "") + item.avgEmotional.toFixed(1) }}
                </td>

                <!-- Energy (1-5) -->
                <td class='px-3 py-3 text-center font-black text-sm transition-transform hover:scale-105 cursor-default'
                    [style.backgroundColor]='getHeatmapColor(item.avgEnergy, 1, 5)'
                    [style.color]='getTextColor(item.avgEnergy, 1, 5)'>
                  {{ item.avgEnergy.toFixed(1) }}
                </td>

                <!-- Disruption (1-5, Inverted) -->
                <td class='px-3 py-3 text-center font-black text-sm rounded-r-lg transition-transform hover:scale-105 cursor-default'
                    [style.backgroundColor]='getHeatmapColor(item.avgDisruption, 1, 5, true)'
                    [style.color]='getTextColor(item.avgDisruption, 1, 5, true)'>
                  {{ item.avgDisruption.toFixed(1) }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class='flex flex-wrap gap-4 mt-6 pt-4 border-t border-card-line justify-center'>
        <div class='flex items-center gap-1.5'>
          <div class='size-3 rounded-sm' [style.backgroundColor]='CHART_SEMANTIC.step5'></div>
          <span class='text-[10px] font-bold text-muted-foreground-1 uppercase'>Highest Impact</span>
        </div>
        <div class='flex items-center gap-1.5'>
          <div class='size-3 rounded-sm' [style.backgroundColor]='CHART_SEMANTIC.step3'></div>
          <span class='text-[10px] font-bold text-muted-foreground-1 uppercase'>Neutral</span>
        </div>
        <div class='flex items-center gap-1.5'>
          <div class='size-3 rounded-sm' [style.backgroundColor]='CHART_SEMANTIC.step1'></div>
          <span class='text-[10px] font-bold text-muted-foreground-1 uppercase'>Lowest Impact / Disruption</span>
        </div>
      </div>
    </app-chart-card>
  `,
})
export class ImpactByMeetingTypeComponent {
  data = input.required<ImpactByType[]>();
  CHART_SEMANTIC = CHART_SEMANTIC;

  getHeatmapColor(value: number, min: number, max: number, inverted: boolean = false): string {
    const range = max - min;
    let normalized = (value - min) / range;
    if (inverted) normalized = 1 - normalized;

    if (normalized <= 0.2) return CHART_SEMANTIC.step1;
    if (normalized <= 0.4) return CHART_SEMANTIC.step2;
    if (normalized <= 0.6) return CHART_SEMANTIC.step3;
    if (normalized <= 0.8) return CHART_SEMANTIC.step4;
    return CHART_SEMANTIC.step5;
  }

  getTextColor(value: number, min: number, max: number, inverted: boolean = false): string {
    return '#ffffff'; // All steps are now saturated enough for white text
  }
}
