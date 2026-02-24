package ch.fhnw.meeting.dto.feedback;

import ch.fhnw.meeting.model.feedback.DailyFeedbackDetails;
import lombok.Data;

@Data
public class DailyFeedbackSubmitRequest {
    private DailyFeedbackDetails details;
}
