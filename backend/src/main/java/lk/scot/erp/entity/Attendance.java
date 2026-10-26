package lk.scot.erp.entity;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
	name = "attendance_records",
	uniqueConstraints = @UniqueConstraint(
		name = "uk_attendance_employee_punch_date",
		columnNames = { "employee_id", "punch_date" }
	)
)
public class Attendance extends BaseEntity {

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "employee_id", nullable = false)
	private Employee employee;

	@Column(nullable = false)
	private LocalDate punchDate;

	private LocalTime checkInTime;

	private LocalTime checkOutTime;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private AttendanceStatus status = AttendanceStatus.ABSENT;

	@Column(nullable = false)
	private boolean overtimeEligible = false;

	@Column(nullable = false)
	private boolean dinnerAllowanceClaimed = false;

	@Column(nullable = false)
	private boolean outOfOffice = false;

	private Instant outOfOfficeStartedAt;

	@Column(nullable = false)
	private int breakMinutesUsed = 0;
}
