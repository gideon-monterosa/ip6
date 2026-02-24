package ch.fhnw.meeting.model.feedback;

import lombok.Data;

@Data
public class DailyFeedbackDetails implements FeedbackDetails {
    private Integer productivityScore;
    private Integer deepWorkScore;
    private Integer energyScore;
    private Integer meetingLoadScore;
}
