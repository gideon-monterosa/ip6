package ch.fhnw.meeting.dto.dashboard;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RawMeetingDto {
    @JsonProperty("meeting_id")
    private String meetingId;
    
    @JsonProperty("start_time")
    private String startTime;
    
    @JsonProperty("end_time")
    private String endTime;
    
    @JsonProperty("duration_minutes")
    private Integer durationMinutes;
    
    @JsonProperty("recurring")
    private Boolean recurring;
    
    @JsonProperty("meeting_type")
    private String meetingType;
    
    @JsonProperty("organizer")
    private String organizer;
    
    @JsonProperty("number_of_participants")
    private Integer numberOfParticipants;
    
    @JsonProperty("day_of_week")
    private String dayOfWeek;
    
    @JsonProperty("time_of_day_bucket")
    private String timeOfDayBucket;
}