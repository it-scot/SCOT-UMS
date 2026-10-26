package lk.scot.erp.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import lk.scot.erp.config.AppProperties;

class WorkspaceAccessServiceTest {

	private WorkspaceAccessService workspaceAccessService;

	@BeforeEach
	void setUp() {
		AppProperties properties = new AppProperties();
		properties.getSecurity().setAllowedEmailDomain("scot.lk");
		workspaceAccessService = new WorkspaceAccessService(properties);
	}

	@Test
	void allowsScotWorkspaceEmail() {
		assertThat(workspaceAccessService.isAllowed("krishan@scot.lk", "scot.lk")).isTrue();
	}

	@Test
	void rejectsPersonalGoogleAccounts() {
		assertThat(workspaceAccessService.isAllowed("someone@gmail.com", null)).isFalse();
	}
}
