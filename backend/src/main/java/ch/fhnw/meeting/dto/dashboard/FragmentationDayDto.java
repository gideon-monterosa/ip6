package ch.fhnw.meeting.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FragmentationDayDto {
    private String date;
    private Double scorePercentage;
    private Integer totalMeetingMinutes;
    private Integer fragmentedMinutes;
    private Integer flowBlocksCount;
}