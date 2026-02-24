package ch.fhnw.meeting.model.feedback;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "type" // Dieses Feld steht dann im JSON
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = MeetingFeedbackDetails.class, name = "MEETING"),
        @JsonSubTypes.Type(value = DailyFeedbackDetails.class, name = "DAILY")
})
public interface FeedbackDetails {
}