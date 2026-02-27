package ch.fhnw.meeting.service;

import ch.fhnw.meeting.dto.user.UserSettingsDto;
import ch.fhnw.meeting.model.User;
import ch.fhnw.meeting.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserSettingsDto getUserSettings(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User nicht gefunden"));
        return mapToDto(user);
    }

    @Transactional
    public UserSettingsDto updateUserSettings(String username, UserSettingsDto dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User nicht gefunden"));

        if (dto.getWorkStartTime() != null) user.setWorkStartTime(dto.getWorkStartTime());
        if (dto.getWorkEndTime() != null) user.setWorkEndTime(dto.getWorkEndTime());
        if (dto.getWorkingDays() != null) user.setWorkingDays(dto.getWorkingDays());
        if (dto.getGoogleCalendarEnabled() != null) user.setGoogleCalendarEnabled(dto.getGoogleCalendarEnabled());
        if (dto.getGoogleFreeBusyEnabled() != null) user.setGoogleFreeBusyEnabled(dto.getGoogleFreeBusyEnabled());
        if (dto.getMicrosoftCalendarEnabled() != null) user.setMicrosoftCalendarEnabled(dto.getMicrosoftCalendarEnabled());
        if (dto.getPushNotificationsEnabled() != null) user.setPushNotificationsEnabled(dto.getPushNotificationsEnabled());
        if (dto.getFcmToken() != null) user.setFcmToken(dto.getFcmToken());

        userRepository.save(user);
        return mapToDto(user);
    }

    private UserSettingsDto mapToDto(User user) {
        UserSettingsDto dto = new UserSettingsDto();
        dto.setWorkStartTime(user.getWorkStartTime());
        dto.setWorkEndTime(user.getWorkEndTime());
        dto.setWorkingDays(user.getWorkingDays());
        dto.setGoogleCalendarEnabled(user.getGoogleCalendarEnabled());
        dto.setGoogleFreeBusyEnabled(user.getGoogleFreeBusyEnabled());
        dto.setMicrosoftCalendarEnabled(user.getMicrosoftCalendarEnabled());
        dto.setPushNotificationsEnabled(user.getPushNotificationsEnabled());
        dto.setFcmToken(user.getFcmToken());
        return dto;
    }
}