package lk.scot.erp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "it_tickets")
public class ItTicket extends BaseEntity {

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "employee_id", nullable = false)
	private Employee employee;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ItTicketCategory category;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ItTicketPriority priority = ItTicketPriority.NORMAL;

	@Column(nullable = false)
	private String title;

	@Column(length = 4000)
	private String description;

	private String screenshotUrl;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ItTicketStatus status = ItTicketStatus.OPEN;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "assigned_to_it_admin_id")
	private Employee assignedToItAdmin;
}
