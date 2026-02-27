package ch.fhnw.meeting.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;

@Slf4j
@Configuration
public class FirebaseConfig {

    @Value("${firebase.config.path:}")
    private String firebaseConfigPath;

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseOptions.Builder builder = FirebaseOptions.builder();
                
                if (firebaseConfigPath != null && !firebaseConfigPath.isEmpty()) {
                    log.info("Initializing Firebase with config from: {}", firebaseConfigPath);
                    builder.setCredentials(GoogleCredentials.fromStream(new FileInputStream(firebaseConfigPath)));
                } else {
                    log.info("Initializing Firebase with application default credentials");
                    builder.setCredentials(GoogleCredentials.getApplicationDefault());
                }

                FirebaseApp.initializeApp(builder.build());
                log.info("Firebase initialized successfully");
            }
        } catch (IOException e) {
            log.error("Firebase could not be initialized: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error during Firebase initialization: {}", e.getMessage());
        }
    }
}
