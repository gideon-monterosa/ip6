import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { WeekMeeting } from '../models/dashboard.model';

@Component({
  selector: 'app-week-meetings',
  imports: [DatePipe],
  template: `
    <div class='bg-card border border-card-line shadow-2xs rounded-xl'>
      <div class='p-4 md:p-5'>
        <h4 class='text-sm font-medium text-muted-foreground-1 uppercase mb-4'>
          Meetings This Week
        </h4>
        @if (meetings().length === 0) {
          <div class="flex items-center justify-center py-12 text-sm text-muted-foreground-2">
            No meetings this week
          </div>
        } @else {
          <div class='overflow-x-auto'>
            <table class='min-w-full divide-y divide-card-divider'>
              <thead>
                <tr>
                  <th class='px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase'>
                    Title
                  </th>
                  <th class='px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase'>
                    Date
                  </th>
                  <th class='px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase'>
                    Duration
                  </th>
                  <th class='px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase'>
                    Attendees
                  </th>
                </tr>
              </thead>
              <tbody class='divide-y divide-card-divider'>
                @for (meeting of meetings(); track meeting.id) {
                  <tr class='hover:bg-muted'>
                    <td class='px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground'>
                      <div class="flex items-center gap-x-2">
                        {{ meeting.title }}
                        @if (meeting.recurring) {
                          <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary-100 text-primary-800">
                            Recurring
                          </span>
                        }
                      </div>
                    </td>
                    <td class='px-4 py-3 whitespace-nowrap text-sm text-muted-foreground-2'>
                      {{ meeting.startTime | date: 'EEE, MMM d · h:mm a' }}
                    </td>
                    <td class='px-4 py-3 whitespace-nowrap text-sm text-muted-foreground-2'>
                      {{ meeting.durationMinutes }} min
                    </td>
                    <td class='px-4 py-3 whitespace-nowrap text-sm text-muted-foreground-2'>
                      <span
                        class='inline-flex items-center justify-center size-6 rounded-full bg-primary-100 text-primary-800 text-xs font-medium'
                      >
                        {{ meeting.participants }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export class WeekMeetingsComponent {
  meetings = input.required<WeekMeeting[]>();
}
