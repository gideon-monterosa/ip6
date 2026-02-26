package ch.fhnw.meeting.model.feedback;

import lombok.Data;

import java.util.List;

@Data
public class MeetingFeedbackDetails implements FeedbackDetails {
    private Integer rotiScore;
    private MoodType mood;
    private Integer energyAfter;
    private Integer focusDisruption;
    private List<IssueTag> issueTags;
    private List<PositiveTag> positiveTags;
    private String comment;
}
