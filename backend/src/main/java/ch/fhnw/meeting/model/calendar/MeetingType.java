package ch.fhnw.meeting.model.calendar;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum MeetingType {
    STAND_UP("Stand-up"),
    PLANNING("Planning"),
    RETROSPECTIVE("Retrospective"),
    ONE_ON_ONE("1:1"),
    AD_HOC("Ad-hoc"),
    OTHER("Other");

    private final String value;

    MeetingType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static MeetingType fromValue(String value) {
        for (MeetingType type : MeetingType.values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unbekannter Meeting Type: " + value);
    }
}