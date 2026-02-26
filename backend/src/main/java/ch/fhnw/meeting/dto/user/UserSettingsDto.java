package ch.fhnw.meeting.dto.user;

import lombok.Data;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Set;

@Data
public class UserSettingsDto {
    private LocalTime workStartTime;
    private LocalTime workEndTime;
    private Set<DayOfWeek> workingDays;
    private Boolean googleCalendarEnabled;
    private Boolean googleFreeBusyEnabled;
    private Boolean microsoftCalendarEnabled;
}