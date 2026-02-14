import { Component, inject, input, signal } from '@angular/core';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-export-button',
  template: `
    <div class='relative inline-block'>
      <button type='button'
        class='py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-300 text-muted-foreground-1 hover:bg-gray-50 transition-colors'
        (click)='toggleDropdown()'>
        <svg class='shrink-0 size-4' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'>
          <path stroke-linecap='round' stroke-linejoin='round' d='M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3' />
        </svg>
        Export
      </button>
      @if (showDropdown()) {
        <div class='absolute right-0 mt-1 z-10 min-w-[120px] bg-card border border-card-line rounded-lg shadow-lg p-1'>
          <button type='button'
            class='w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors'
            (click)='exportCSV()'>
            Export CSV
          </button>
          <button type='button'
            class='w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors'
            (click)='exportJSON()'>
            Export JSON
          </button>
        </div>
      }
    </div>
  `,
})
export class ExportButtonComponent {
  private exportService = inject(ExportService);

  data = input<Record<string, unknown>[]>([]);
  filename = input<string>('dashboard-export');

  showDropdown = signal(false);

  toggleDropdown(): void {
    this.showDropdown.update((v) => !v);
  }

  exportCSV(): void {
    this.exportService.exportToCSV(this.data(), this.filename());
    this.showDropdown.set(false);
  }

  exportJSON(): void {
    this.exportService.exportToJSON(this.data(), this.filename());
    this.showDropdown.set(false);
  }
}
