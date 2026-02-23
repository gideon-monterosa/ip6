package ch.fhnw.meeting.dto.feedback;

import ch.fhnw.meeting.model.feedback.FeedbackDetails;
import lombok.Data;

@Data
public class FeedbackSubmitRequest {
    private FeedbackDetails details;
}