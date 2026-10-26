package lk.scot.erp.config;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CampusTimeConfig {

	public static final ZoneId CAMPUS_ZONE = ZoneId.of("Asia/Colombo");

	@Bean
	Clock campusClock() {
		return Clock.system(CAMPUS_ZONE);
	}
}
