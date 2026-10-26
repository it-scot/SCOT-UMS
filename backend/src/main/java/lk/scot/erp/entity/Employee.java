package lk.scot.erp.entity;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "employees")
public class Employee extends BaseEntity {

	@Column(nullable = false, unique = true)
	private String empNumber;

	@Column(nullable = false)
	private String name;

	@Column(nullable = false, unique = true)
	private String officialEmail;

	private String designation;

	private String department;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "direct_supervisor_id")
	private Employee directSupervisor;

	private LocalDate dateJoined;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private EmployeeStatus status = EmployeeStatus.ACTIVE;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ShiftType currentShift;

	private LocalTime minimumDepartureTime;

	@OneToMany(mappedBy = "directSupervisor")
	private List<Employee> directReports = new ArrayList<>();

	@PrePersist
	@PreUpdate
	private void normalizeAndValidateOfficialEmail() {
		if (officialEmail != null) {
			officialEmail = officialEmail.trim().toLowerCase();
		}
		if (officialEmail == null || !officialEmail.endsWith("@scot.lk")) {
			throw new IllegalArgumentException("Official email must be a @scot.lk address");
		}
	}
}
