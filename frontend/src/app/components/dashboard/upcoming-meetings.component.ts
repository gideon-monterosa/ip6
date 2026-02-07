import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UpcomingMeeting } from '../../models/dashboard.model';

@Component({
  selector: 'app-upcoming-meetings',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="bg-white border border-gray-200 shadow-2xs rounded-xl">
      <div class="p-4 md:p-5">
        <h4 class="text-sm font-medium text-gray-500 uppercase mb-4">Upcoming Meetings</h4>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">Title</th>
                <th class="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th class="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">Attendees</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (meeting of meetings(); track meeting.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                    {{ meeting.title }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {{ meeting.date | date:'EEE, MMM d · h:mm a' }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {{ meeting.duration }} min
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    <div class="flex items-center gap-x-1">
                      <span class="inline-flex items-center justify-center size-6 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium">
                        {{ meeting.attendees.length }}
                      </span>
                      <span class="text-gray-500">{{ meeting.attendees.join(', ') }}</span>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class UpcomingMeetingsComponent {
  meetings = input.required<UpcomingMeeting[]>();
}
