import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <div class="flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl">
      <div class="p-4 md:p-5">
        <div class="flex items-center gap-x-2">
          <p class="text-xs uppercase tracking-wide text-gray-500">{{ title() }}</p>
        </div>
        <div class="mt-1 flex items-center gap-x-2">
          <h3 class="text-xl sm:text-2xl font-medium text-gray-800">{{ value() }}</h3>
        </div>
        <div class="mt-1 flex items-center gap-x-1">
          <span
            class="inline-flex items-center gap-x-1 text-sm"
            [class.text-green-600]="isPositive()"
            [class.text-red-600]="!isPositive()"
          >
            <!-- Up arrow -->
            @if (isPositive()) {
              <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                   stroke-linejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                <polyline points="16 7 22 7 22 13"/>
              </svg>
            } @else {
              <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                   stroke-linejoin="round">
                <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/>
                <polyline points="16 17 22 17 22 11"/>
              </svg>
            }
            <span>{{ changePercent() }}%</span>
          </span>
          <span class="text-sm text-gray-500">from last week</span>
        </div>
      </div>
    </div>
  `,
})
export class StatCardComponent {
  title = input.required<string>();
  value = input.required<string>();
  change = input.required<number>();

  isPositive = computed(() => this.change() >= 0);
  changePercent = computed(() => {
    const val = Math.abs(this.change());
    return val % 1 === 0 ? val.toFixed(0) : val.toFixed(1);
  });
}
