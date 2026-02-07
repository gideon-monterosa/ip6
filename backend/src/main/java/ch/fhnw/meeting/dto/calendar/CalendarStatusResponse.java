package ch.fhnw.meeting.dto.calendar;

public class CalendarStatusResponse {

    private boolean googleConnected;
    private boolean microsoftConnected;

    public CalendarStatusResponse() {
    }

    public CalendarStatusResponse(boolean googleConnected, boolean microsoftConnected) {
        this.googleConnected = googleConnected;
        this.microsoftConnected = microsoftConnected;
    }

    public boolean isGoogleConnected() {
        return googleConnected;
    }

    public void setGoogleConnected(boolean googleConnected) {
        this.googleConnected = googleConnected;
    }

    public boolean isMicrosoftConnected() {
        return microsoftConnected;
    }

    public void setMicrosoftConnected(boolean microsoftConnected) {
        this.microsoftConnected = microsoftConnected;
    }
}