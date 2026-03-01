package ch.fhnw.meeting.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String role = "USER";

    @Column(name = "work_start_time")
    private LocalTime workStartTime;

    @Column(name = "work_end_time")
    private LocalTime workEndTime;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_working_days", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "day_of_week")
    @Enumerated(EnumType.STRING)
    private Set<DayOfWeek> workingDays;

    @Column(name = "google_calendar_enabled", nullable = false)
    @Builder.Default
    private Boolean googleCalendarEnabled = false;

    @Column(name = "google_free_busy_enabled", nullable = false)
    @Builder.Default
    private Boolean googleFreeBusyEnabled = false;

    @Column(name = "microsoft_calendar_enabled", nullable = false)
    @Builder.Default
    private Boolean microsoftCalendarEnabled = false;

    @Column(name = "push_notifications_enabled", nullable = false)
    @Builder.Default
    private Boolean pushNotificationsEnabled = false;

    @Column(name = "fcm_token")
    private String fcmToken;

    @Column(name = "last_eod_notification_sent_at")
    private LocalDateTime lastEodNotificationSentAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}