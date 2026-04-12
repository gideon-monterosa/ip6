package ch.fhnw.meeting.service.calendar.factory;

import ch.fhnw.meeting.dto.calendar.EventDto;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Component
public class GoogleEventFactory {

    public EventDto create(Event event) {
        if (event == null) return null;

        EventDto dto = new EventDto();
        dto.setId(event.getId());
        dto.setTitle(event.getSummary());
        dto.setDescription(event.getDescription());
        dto.setLink(event.getHtmlLink());
        dto.setStart(mapToLocalDateTime(event.getStart()));
        dto.setEnd(mapToLocalDateTime(event.getEnd()));
        dto.setLocation(event.getLocation());

        if (event.getOrganizer() != null) {
            dto.setOrganizer(event.getOrganizer().getDisplayName() != null
                    ? event.getOrganizer().getDisplayName()
                    : event.getOrganizer().getEmail());
        }

        if (event.getAttendees() != null) {
            dto.setAttendeesCount(event.getAttendees().size());
        } else {
            dto.setAttendeesCount(0);
        }

        return dto;
    }

    private LocalDateTime mapToLocalDateTime(EventDateTime eventDateTime) {
        if (eventDateTime == null) {
            return null;
        }

        ZoneId targetZone = ZoneId.of("Europe/Zurich");

        if (eventDateTime.getDateTime() != null) {
            return LocalDateTime.ofInstant(
                    Instant.ofEpochMilli(eventDateTime.getDateTime().getValue()),
                    targetZone
            );
        }

        if (eventDateTime.getDate() != null) {
            return LocalDateTime.ofInstant(
                    Instant.ofEpochMilli(eventDateTime.getDate().getValue()),
                    targetZone
            );
        }

        return null;
    }
}