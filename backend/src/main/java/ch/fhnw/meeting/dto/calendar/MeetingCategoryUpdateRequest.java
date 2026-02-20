package ch.fhnw.meeting.dto.calendar;

import ch.fhnw.meeting.model.calendar.MeetingType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MeetingCategoryUpdateRequest {

    @NotNull(message = "Meeting type is required")
    private MeetingType meetingType;
}