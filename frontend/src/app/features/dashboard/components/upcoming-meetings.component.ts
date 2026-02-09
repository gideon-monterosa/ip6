import { Component, input } from "@angular/core";
import { DatePipe } from "@angular/common";
import { UpcomingMeeting } from "../models/dashboard.model";

@Component({
  selector: "app-upcoming-meetings",
  imports: [DatePipe],
  template: `
    <div class="bg-card border border-card-line shadow-2xs rounded-xl">
      <div class="p-4 md:p-5">
        <h4 class="text-sm font-medium text-muted-foreground-1 uppercase mb-4">
          Upcoming Meetings
        </h4>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-card-divider">
            <thead>
              <tr>
                <th
                  class="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase"
                >
                  Title
                </th>
                <th
                  class="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase"
                >
                  Date
                </th>
                <th
                  class="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase"
                >
                  Duration
                </th>
                <th
                  class="px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase"
                >
                  Attendees
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-card-divider">
              @for (meeting of meetings(); track meeting.id) {
                <tr class="hover:bg-muted">
                  <td
                    class="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground"
                  >
                    {{ meeting.title }}
                  </td>
                  <td
                    class="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground-2"
                  >
                    {{ meeting.date | date: "EEE, MMM d · h:mm a" }}
                  </td>
                  <td
                    class="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground-2"
                  >
                    {{ meeting.duration }} min
                  </td>
                  <td
                    class="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground-2"
                  >
                    <div class="flex items-center gap-x-1">
                      <span
                        class="inline-flex items-center justify-center size-6 rounded-full bg-primary-100 text-primary-800 text-xs font-medium"
                      >
                        {{ meeting.attendees.length }}
                      </span>
                      <span class="text-muted-foreground-1">{{
                        meeting.attendees.join(", ")
                      }}</span>
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
