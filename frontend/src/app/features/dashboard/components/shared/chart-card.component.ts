import { Component, input } from '@angular/core';

@Component({
  selector: 'app-chart-card',
  template: `
    <div class='bg-card border border-card-line shadow-2xs rounded-xl'>
      <div class='p-4 md:p-5'>
        <div class='flex items-center justify-between mb-3'>
          <div>
            <h4 class='text-sm font-medium text-muted-foreground-1 uppercase'>
              {{ title() }}
            </h4>
            @if (subtitle()) {
              <p class='text-xs text-muted-foreground-2 mt-0.5'>{{ subtitle() }}</p>
            }
          </div>
        </div>
        @if (loading()) {
          <div class='animate-pulse space-y-3'>
            <div class='h-4 bg-gray-200 rounded w-3/4'></div>
            <div class='h-32 bg-gray-200 rounded'></div>
            <div class='h-4 bg-gray-200 rounded w-1/2'></div>
          </div>
        } @else {
          <ng-content />
        }
      </div>
    </div>
  `,
})
export class ChartCardComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  loading = input<boolean>(false);
}
