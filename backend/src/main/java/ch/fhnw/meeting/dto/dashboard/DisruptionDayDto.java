package ch.fhnw.meeting.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DisruptionDayDto {
    private String date;
    private Double avgDisruption;
}