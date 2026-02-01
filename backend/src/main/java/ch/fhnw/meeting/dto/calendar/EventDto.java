package ch.fhnw.meeting.dto.calendar;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventDto {
    private String id;
    private String title;
    private String description;
    private String start;
    private String end;
    private String link;
}