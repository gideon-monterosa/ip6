package ch.fhnw.meeting.service.calendar;

import ch.fhnw.meeting.dto.calendar.EventDto;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.Events;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final GoogleCalendarService googleCalendarService;

    public List<EventDto> getUpcomingEvents(String username) throws IOException {
        Calendar calendarClient = googleCalendarService.getCalendarClient(username);

        DateTime now = new DateTime(System.currentTimeMillis());

        Events events = calendarClient.events().list("primary")
            .setMaxResults(10)
            .setTimeMin(now)
            .setOrderBy("startTime")
            .setSingleEvents(true)
            .execute();

        List<Event> items = events.getItems();
        if (items.isEmpty()) {
            return Collections.emptyList();
        }

        return items.stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    private EventDto mapToDto(Event event) {
        String start = (event.getStart().getDateTime() != null)
            ? event.getStart().getDateTime().toString()
            : event.getStart().getDate().toString();

        String end = (event.getEnd().getDateTime() != null)
            ? event.getEnd().getDateTime().toString()
            : event.getEnd().getDate().toString();

        return EventDto.builder()
            .id(event.getId())
            .title(event.getSummary())
            .description(event.getDescription())
            .start(start)
            .end(end)
            .link(event.getHtmlLink())
            .build();
    }
}