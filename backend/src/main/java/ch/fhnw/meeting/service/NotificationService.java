package ch.fhnw.meeting.service;

import ch.fhnw.meeting.model.User;
import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.google.firebase.messaging.WebpushConfig;
import com.google.firebase.messaging.WebpushFcmOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class NotificationService {

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    public void sendFeedbackReminder(User user, String eventTitle, String externalId) {
        if (!user.getPushNotificationsEnabled() || user.getFcmToken() == null || user.getFcmToken().isEmpty()) {
            log.info("Überspringe Notification für User {} (Notifications an: {}, Token vorhanden: {})", 
                user.getUsername(), user.getPushNotificationsEnabled(), user.getFcmToken() != null);
            return;
        }

        if (FirebaseApp.getApps().isEmpty()) {
            log.warn("FirebaseApp is not initialized. Notifications cannot be sent to user {}.", user.getUsername());
            return;
        }

        try {
            // Beispiel-Link: http://localhost:4200/feedback/xyz-123
            String clickUrl = String.format("%s/feedback/%s", frontendUrl, externalId);

            Message message = Message.builder()
                    .setToken(user.getFcmToken())
                    .setNotification(Notification.builder()
                            .setTitle("Meeting beendet: " + eventTitle)
                            .setBody("Wie war das Meeting? Bitte gib uns kurzes Feedback.")
                            .build())
                    .putData("eventId", externalId)
                    .putData("type", "FEEDBACK_REMINDER")
                    .putData("click_url", clickUrl)
                    .setWebpushConfig(WebpushConfig.builder()
                            .setFcmOptions(WebpushFcmOptions.withLink(clickUrl))
                            .putHeader("ttl", "300")
                            .putData("click_action", clickUrl)
                            .build())
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Successfully sent message with link: " + response);
        } catch (Exception e) {
            log.error("Error sending FCM message to user {}: {}", user.getUsername(), e.getMessage());
        }
    }
}
