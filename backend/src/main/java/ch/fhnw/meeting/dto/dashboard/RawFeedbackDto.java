package ch.fhnw.meeting.dto.dashboard;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RawFeedbackDto {
    @JsonProperty("meeting_id")
    private String meetingId;
    
    @JsonProperty("perceived_efficiency")
    private Integer perceivedEfficiency;
    
    @JsonProperty("emotional_impact")
    private String emotionalImpact;
    
    @JsonProperty("energy_after_meeting")
    private Integer energyAfterMeeting;
    
    @JsonProperty("perceived_value")
    private Boolean perceivedValue;
    
    @JsonProperty("perceived_focus_disruption")
    private Integer perceivedFocusDisruption;
    
    @JsonProperty("free_text_comment")
    private String freeTextComment;
    
    @JsonProperty("time_of_day_bucket")
    private String timeOfDayBucket;
    
    @JsonProperty("meeting_type")
    private String meetingType;
    
    @JsonProperty("feedback_timestamp")
    private String feedbackTimestamp;
    
    @JsonProperty("themes")
    private List<String> themes;
}