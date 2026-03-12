package ch.fhnw.meeting.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FocusBlockDayDto {
    private String date;
    private Integer blocks60min;
    private Integer blocks90min;
    private Integer blocks120min;
}