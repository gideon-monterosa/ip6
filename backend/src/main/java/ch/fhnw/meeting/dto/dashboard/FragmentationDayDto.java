package ch.fhnw.meeting.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FragmentationDayDto {
    private String date;
    private Double score;
    private Double meetingsContribution;
    private Double gapsContribution;
    private Double fragmentationContribution;
}