package ch.fhnw.meeting.dto.feedback;

import lombok.Data;

import java.util.Map;

@Data
public class FeedbackSubmitRequest {
    private Map<String, Object> details;
}