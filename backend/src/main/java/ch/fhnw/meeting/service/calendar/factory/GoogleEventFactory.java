package ch.fhnw.meeting.service.calendar.factory;

import ch.fhnw.meeting.dto.calendar.EventDto;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import org.springframework.stereotype.Component;

@Component
public class GoogleEventFactory {

    public EventDto create(Event event) {
        if (event == null) {
            return null;
        }

        EventDto dto = new EventDto();
        dto.setId(event.getId());
        dto.setTitle(event.getSummary());
        dto.setDescription(event.getDescription());
        dto.setLink(event.getHtmlLink());

        dto.setStart(formatDate(event.getStart()));
        dto.setEnd(formatDate(event.getEnd()));

        return dto;
    }

    private String formatDate(EventDateTime eventDateTime) {
        if (eventDateTime == null) {
            return null;
        }

        if (eventDateTime.getDateTime() != null) {
            return eventDateTime.getDateTime().toString();
        }
        if (eventDateTime.getDate() != null) {
            return eventDateTime.getDate().toString();
        }
        return null;
    }
}