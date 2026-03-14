import { Component, input, computed, signal, effect } from '@angular/core';
import { DailyFlowScore, FlowBlock } from '../../models/dashboard.model';
import { ChartCardComponent } from '../shared/chart-card.component';
import { SEMANTIC_COLORS, CHART_PRIMARY } from '../../../../theme.constants';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-daily-flow-score',

  standalone: true,
  imports: [CommonModule, ChartCardComponent],
  template: `
    <app-chart-card title='Daily Flow Potential'>
      @if (scores().length > 0) {
        <div class='flex flex-col gap-8'>
          <!-- Day Selection Grid -->
          <div class='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 w-full'>
            @for (score of scores(); track score.date; let i = $index) {
              @if (score.totalWorkingMinutes > 0) {
                <button
                  (click)='selectedDayIndex.set(i)'
                  class='flex flex-col items-center p-4 rounded-2xl border-2 transition-all w-full shadow-xs hover:shadow-md'
                  [class.bg-blue-50]='selectedDayIndex() === i'
                  [class.border-blue-500]='selectedDayIndex() === i'
                  [class.bg-white]='selectedDayIndex() !== i'
                  [class.border-slate-100]='selectedDayIndex() !== i'
                  [class.dark:bg-slate-900]='selectedDayIndex() !== i'
                  [class.dark:border-slate-800]='selectedDayIndex() !== i'
                >
                  <span class='text-[11px] uppercase font-black text-slate-400 mb-1 tracking-tighter'>{{ getDayLabel(score.date) }}</span>
                  <span class='text-2xl font-black leading-none' [style.color]='scoreBgColor(score.score)'>{{ score.score }}%</span>
                </button>
              }
            }
          </div>

          @if (data()) {
            <div class='flex flex-col gap-8 animate-in fade-in duration-500'>
              <!-- Hero Section -->
              <div class='flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800/50 relative overflow-hidden'>
                <span class='text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2'>Flow Capacity Score</span>
                <div class='text-7xl font-black mb-2 text-slate-900 dark:text-white'>
                  {{ data()!.score }}%
                </div>
                <div class='px-6 py-1.5 rounded-full text-sm font-bold shadow-sm'
                     [style.backgroundColor]='scoreBgColor()'
                     [style.color]='"white"'>
                  {{ scoreLabel() }}
                </div>
                <p class='mt-6 text-sm text-slate-600 dark:text-slate-400 text-center max-w-md leading-relaxed'>
                  Based on your {{ data()!.totalWorkingMinutes }} min workday. <br/>
                  Weighted flow potential: <strong class='text-slate-900 dark:text-white'>{{ data()!.effectiveFlowMinutes }} min</strong>.
                </p>
              </div>

          <!-- Visual Timeline -->
          <div class='flex flex-col gap-3'>
            <div class='flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider'>
              <span>Daily Flow Schedule</span>
              <div class='flex flex-wrap justify-end gap-x-4 gap-y-2'>
                <div class='flex items-center gap-1.5'>
                  <div class='w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700'></div>
                  <span>Meeting</span>
                </div>
                <div class='flex items-center gap-1.5'>
                  <div class='w-3 h-3 rounded-sm' [style.backgroundColor]="colors['GAP_FLOW']"></div>
                  <span class='text-blue-600 dark:text-blue-400'>Ideal Flow</span>
                </div>
              </div>
            </div>

            <div class='h-14 w-full flex items-center rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 px-1'>
              @for (block of data()!.blocks; track $index) {
                <div class='h-12 relative flex-none' [style.width.%]='(block.durationMinutes / data()!.totalWorkingMinutes) * 100'>
                  <div
                    class='absolute inset-y-0 left-[1px] right-[1px] group transition-colors rounded-[10px] cursor-default hover:brightness-95 dark:hover:brightness-110'
                    [style.backgroundColor]="colors[block.type]"
                  >
                    <!-- Tooltip -->
                    <div class='absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-slate-900 text-white text-[11px] rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 whitespace-nowrap pointer-events-none shadow-2xl border border-white/10'>
                      <p class='font-black mb-1 text-blue-400 uppercase tracking-tighter'>{{ block.type.replace('GAP_', '').replace('MEETING', 'Meeting') }}</p>
                      <p class='font-medium'>{{ block.startTime }} - {{ block.endTime }}</p>
                      @if (block.type !== 'MEETING') {
                        <p class='opacity-70'>{{ block.durationMinutes }} min (-25m startup cost)</p>
                      } @else {
                        <p class='opacity-70'>{{ block.durationMinutes }} min</p>
                      }
                      <div class='absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900'></div>
                    </div>
                  </div>
                </div>
              }
            </div>
            <div class='flex justify-between text-[10px] font-bold text-slate-400 px-2 uppercase'>
               <span>{{ data()!.blocks[0]?.startTime }}</span>
               <span>Workday Start/End</span>
               <span>{{ data()!.blocks[data()!.blocks.length - 1]?.endTime }}</span>
            </div>
          </div>

          <!-- Potential Callout (Only if > 10% improvement) -->
          @if (improvement() > 10) {
            <div class='p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl flex items-start gap-5 shadow-sm'>
              <div class='p-3 bg-emerald-100 dark:bg-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-300'>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              </div>
              <div>
                <h4 class='text-base font-black mb-1 uppercase tracking-tight text-emerald-900 dark:text-emerald-100'>Ideal Flow Potential</h4>
                <p class='text-sm text-emerald-800 dark:text-emerald-200/80 leading-relaxed font-medium'>
                  By grouping meetings into a single block, you could gain <strong class='text-emerald-600 dark:text-emerald-400'>+{{ improvement() }}%</strong> more flow capacity.
                  This unlocks an additional <strong class='text-emerald-600 dark:text-emerald-400'>{{ extraMinutes() }} minutes</strong> of deep work time!
                </p>
              </div>
            </div>
          }

          <div class='flex flex-col gap-4'>
            <button
              (click)='showTable.set(!showTable())'
              class='flex items-center justify-between px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-sm font-bold text-slate-600 dark:text-slate-400'
            >
              <span>Detailed Segments Analysis</span>
              <svg [class.rotate-180]='showTable()' class='w-4 h-4 transition-transform' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            @if (showTable()) {
              <div class='overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300'>
                <table class='w-full text-left text-sm'>
                  <thead class='bg-slate-50 dark:bg-slate-900 text-slate-500 font-black uppercase text-[10px] tracking-widest'>
                    <tr>
                      <th class='px-6 py-4'>Segment Type</th>
                      <th class='px-6 py-4'>Total Time</th>
                      <th class='px-6 py-4'>Flow Entry Cost</th>
                      <th class='px-6 py-4 text-right'>Net Flow Potential</th>
                    </tr>
                  </thead>
                  <tbody class='divide-y divide-slate-100 dark:divide-slate-800'>
                    @for (row of tableData(); track row.type) {
                      <tr class='hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors'>
                        <td class='px-6 py-4 flex items-center gap-3'>
                          <div class='w-2.5 h-2.5 rounded-full shadow-xs' [style.backgroundColor]='colors[row.type]'></div>
                          <span class='font-bold text-slate-700 dark:text-slate-300'>{{ row.label }}</span>
                        </td>
                        <td class='px-6 py-4 text-slate-600 dark:text-slate-400 font-medium'>{{ row.duration }} min</td>
                        <td class='px-6 py-4 text-slate-400 font-mono'>
                          {{ row.type !== 'MEETING' ? '-' + row.cost + ' min' : '0 min' }}
                        </td>
                        <td class='px-6 py-4 text-right font-black text-slate-900 dark:text-white'>{{ row.effective }} min</td>
                      </tr>
                    }
                  </tbody>
                  <tfoot class='bg-slate-50/50 dark:bg-slate-900/50 font-black border-t-2 border-slate-100 dark:border-slate-800'>
                    <tr>
                      <td colspan='3' class='px-6 py-4 text-right text-slate-500 uppercase tracking-tighter'>Total Weighted Flow:</td>
                      <td class='px-6 py-4 text-right text-slate-900 dark:text-white text-lg'>{{ data()!.effectiveFlowMinutes }} min</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class='flex flex-col items-center justify-center py-20 text-slate-400 gap-4'>
          <svg class="w-12 h-12 opacity-20" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>
          <span class='italic font-medium'>No schedule data for selected day.</span>
        </div>
      }
    </div>
  } @else {
    <div class='flex flex-col items-center justify-center py-20 text-slate-400 gap-4'>
      <svg class="w-12 h-12 opacity-20" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>
      <span class='italic font-medium'>No flow data available for this week.</span>
    </div>
  }
</app-chart-card>

  `,
})
export class DailyFlowScoreComponent {
  scores = input<DailyFlowScore[]>([]);
  selectedDayIndex = signal(0);

  constructor() {
    effect(() => {
      const d = this.scores();
      if (d.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayIdx = d.findIndex(s => s.date === todayStr);
        this.selectedDayIndex.set(todayIdx !== -1 ? todayIdx : d.findIndex(s => s.totalWorkingMinutes > 0));
      }
    }, { allowSignalWrites: true });
  }

  data = computed(() => this.scores()[this.selectedDayIndex()] || null);
  showTable = signal(false);

  colors: Record<string, string> = {
    'MEETING': '#e2e8f0', // Slate-200
    'GAP_MICRO': '#cbd5e1', // Slate-300
    'GAP_NORMAL': '#60a5fa', // Blue-400
    'GAP_FLOW': '#2563eb'  // Blue-600 (CHART_PRIMARY)
  };

  improvement = computed(() => {
    const d = this.data();
    return d ? d.potentialScore - d.score : 0;
  });

  extraMinutes = computed(() => {
    const d = this.data();
    if (!d) return 0;
    return Math.round((this.improvement() / 100) * d.totalWorkingMinutes);
  });

  scoreBgColor(scoreVal?: number): string {
    const s = scoreVal !== undefined ? scoreVal : (this.data()?.score ?? 0);
    if (s >= 70) return SEMANTIC_COLORS.success;
    if (s >= 40) return '#eab308';
    return SEMANTIC_COLORS.danger;
  }

  scoreLabel = computed(() => {
    const score = this.data()?.score ?? 0;
    if (score >= 70) return 'High Flow Potential';
    if (score >= 40) return 'Moderate Flow Potential';
    return 'Limited Flow Potential';
  });

  getDayLabel(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' });
  }

  tableData = computed(() => {
    const d = this.data();
    if (!d) return [];

    const categories = [
      { type: 'GAP_FLOW', label: 'Ideal Flow (90m+)' },
      { type: 'GAP_NORMAL', label: 'Standard Gap (30-89m)' },
      { type: 'GAP_MICRO', label: 'Insignificant Gap (< 30m)' },
      { type: 'MEETING', label: 'Meetings' },
    ];

    return categories.map(cat => {
      const blocks = d.blocks.filter(b => b.type === cat.type);
      const duration = blocks.reduce((sum, b) => sum + b.durationMinutes, 0);
      const effective = blocks.reduce((sum, b) => sum + b.effectiveMinutes, 0);
      const cost = blocks.length * 25; // 25 min per block

      return {
        ...cat,
        duration: Math.round(duration),
        effective: Math.round(effective),
        cost: cost
      };
    }).filter(row => row.duration > 0 || row.type === 'MEETING');
  });
}
