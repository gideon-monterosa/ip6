package ch.fhnw.meeting.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FocusBlockDayDto {
    private String date;
    private Integer blocks60min;
    private Integer blocks90min;
    private Integer blocks120min;
}