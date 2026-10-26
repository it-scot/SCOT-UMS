package lk.scot.erp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@ConfigurationProperties(prefix = "app")
public class AppProperties {

	private String frontendOrigin = "http://localhost:3000";
	private final Cors cors = new Cors();
	private final Security security = new Security();
	private final Jwt jwt = new Jwt();

	@Getter
	@Setter
	public static class Cors {
		private String allowedOrigins = "http://localhost:3000";
	}

	@Getter
	@Setter
	public static class Security {
		private String allowedEmailDomain = "scot.lk";
	}

	@Getter
	@Setter
	public static class Jwt {
		private String secret = "scot-erp-dev-only-change-this-to-a-32-byte-secret!";
		private long expirationMs = 86_400_000L;
		private String issuer = "scot-erp";
	}
}
