import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-dashboard-tabs',
  template: `
    <div class='flex gap-x-1 border-b border-card-line'>
      <button
        type='button'
        class='py-3 px-4 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors'
        [class.border-primary]='activeTab() === "structure"'
        [class.text-primary]='activeTab() === "structure"'
        [class.border-transparent]='activeTab() !== "structure"'
        [class.text-muted-foreground-1]='activeTab() !== "structure"'
        [class.hover:text-foreground]='activeTab() !== "structure"'
        (click)='tabChange.emit("structure")'
      >
        Meeting Structure
      </button>
      <button
        type='button'
        class='py-3 px-4 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors'
        [class.border-primary]='activeTab() === "impact"'
        [class.text-primary]='activeTab() === "impact"'
        [class.border-transparent]='activeTab() !== "impact"'
        [class.text-muted-foreground-1]='activeTab() !== "impact"'
        [class.hover:text-foreground]='activeTab() !== "impact"'
        (click)='tabChange.emit("impact")'
      >
        Meeting Impact
      </button>
    </div>
  `,
})
export class DashboardTabsComponent {
  activeTab = input.required<'structure' | 'impact'>();
  tabChange = output<'structure' | 'impact'>();
}
