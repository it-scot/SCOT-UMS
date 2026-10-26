package lk.scot.erp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class ScotErpApplication {

	public static void main(String[] args) {
		SpringApplication.run(ScotErpApplication.class, args);
	}

}
