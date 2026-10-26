package lk.scot.erp.entity;

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
	name = "evaluations",
	uniqueConstraints = @UniqueConstraint(
		name = "uk_evaluations_employee_cycle_year",
		columnNames = { "employee_id", "cycle_year" }
	)
)
public class Evaluation extends BaseEntity {

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "employee_id", nullable = false)
	private Employee employee;

	@Column(nullable = false)
	private int cycleYear;

	private Integer selfScore;

	private Integer supervisorScore;

	@Column(length = 4000)
	private String feedback;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private EvaluationStatus status = EvaluationStatus.DRAFT;
}
