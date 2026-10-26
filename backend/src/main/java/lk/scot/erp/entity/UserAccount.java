package lk.scot.erp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "user_accounts")
public class UserAccount extends BaseEntity {

	@Column(nullable = false, unique = true)
	private String googleSub;

	@Column(nullable = false, unique = true)
	private String email;

	private String fullName;

	private String pictureUrl;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private UserRole role = UserRole.EMPLOYEE;

	@Column(nullable = false)
	private boolean active = true;
}
