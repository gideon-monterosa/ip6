package ch.fhnw.meeting.dto.calendar;

public class CalendarStatusResponse {

    private boolean googleConnected;
    private boolean microsoftConnected;
    private boolean googleFreeBusyConnected;

    public CalendarStatusResponse() {
    }

    public CalendarStatusResponse(boolean googleConnected, boolean microsoftConnected, boolean googleFreeBusyConnected) {
        this.googleConnected = googleConnected;
        this.microsoftConnected = microsoftConnected;
        this.googleFreeBusyConnected = googleFreeBusyConnected;
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

    public boolean isGoogleFreeBusyConnected() {
        return googleFreeBusyConnected;
    }

    public void setGoogleFreeBusyConnected(boolean googleFreeBusyConnected) {
        this.googleFreeBusyConnected = googleFreeBusyConnected;
    }
}