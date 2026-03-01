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
            String clickUrl = String.format("%s/feedback/%s", frontendUrl, externalId);

            Message message = Message.builder()
                    .setToken(user.getFcmToken())
                    .setNotification(Notification.builder()
                            .setTitle("Meeting Ended: " + eventTitle)
                            .setBody("How was the meeting? Tap to share your feedback.")
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

    public void sendEodFeedbackReminder(User user, String date) {
        if (!user.getPushNotificationsEnabled() || user.getFcmToken() == null || user.getFcmToken().isEmpty()) {
            return;
        }

        if (FirebaseApp.getApps().isEmpty()) {
            log.warn("FirebaseApp is not initialized. Notifications cannot be sent to user {}.", user.getUsername());
            return;
        }

        try {
            String clickUrl = String.format("%s/feedback", frontendUrl);

            Message message = Message.builder()
                    .setToken(user.getFcmToken())
                    .setNotification(Notification.builder()
                            .setTitle("Almost done for today!")
                            .setBody("Take a moment to reflect on your workday and track your progress.")
                            .build())
                    .putData("type", "EOD_FEEDBACK_REMINDER")
                    .putData("date", date)
                    .putData("click_url", clickUrl)
                    .setWebpushConfig(WebpushConfig.builder()
                            .setFcmOptions(WebpushFcmOptions.withLink(clickUrl))
                            .putHeader("ttl", "3600")
                            .putData("click_action", clickUrl)
                            .build())
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Successfully sent EOD message: " + response);
        } catch (Exception e) {
            log.error("Error sending EOD FCM message to user {}: {}", user.getUsername(), e.getMessage());
        }
    }
}
