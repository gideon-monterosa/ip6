package ch.fhnw.meeting;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class MeetingApplication {

	public static void main(String[] args) {
		SpringApplication.run(MeetingApplication.class, args);
	}

}
