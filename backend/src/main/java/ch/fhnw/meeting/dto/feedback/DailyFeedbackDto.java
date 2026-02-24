package ch.fhnw.meeting.dto.feedback;

import ch.fhnw.meeting.model.feedback.DailyFeedbackDetails;
import ch.fhnw.meeting.model.feedback.FeedbackStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class DailyFeedbackDto {
    private LocalDate date;
    private FeedbackStatus feedbackStatus;
    private DailyFeedbackDetails details;
    private boolean eligible;
    private LocalDateTime createdAt;
}
