import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-dashboard-tabs',
  template: `
    <div class='flex w-full border-b border-card-line'>
      <button
        type='button'
        class='flex-1 py-1 px-4 text-base font-bold border-b-2 -mb-px transition-colors flex items-center justify-center gap-2'
        [class.border-primary]='activeTab() === "structure"'
        [class.text-primary]='activeTab() === "structure"'
        [class.border-transparent]='activeTab() !== "structure"'
        [class.text-muted-foreground-1]='activeTab() !== "structure"'
        [class.hover:text-foreground]='activeTab() !== "structure"'
        (click)='tabChange.emit("structure")'
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        Meeting Structure
      </button>
      <button
        type='button'
        class='flex-1 py-1 px-4 text-base font-bold border-b-2 -mb-px transition-colors flex items-center justify-center gap-2'
        [class.border-primary]='activeTab() === "impact"'
        [class.text-primary]='activeTab() === "impact"'
        [class.border-transparent]='activeTab() !== "impact"'
        [class.text-muted-foreground-1]='activeTab() !== "impact"'
        [class.hover:text-foreground]='activeTab() !== "impact"'
        (click)='tabChange.emit("impact")'
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
        Meeting Impact
      </button>
    </div>
  `,
})
export class DashboardTabsComponent {
  activeTab = input.required<'structure' | 'impact'>();
  tabChange = output<'structure' | 'impact'>();
}
