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

        user.setWorkStartTime(dto.getWorkStartTime());
        user.setWorkEndTime(dto.getWorkEndTime());
        user.setWorkingDays(dto.getWorkingDays());

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
        return dto;
    }
}