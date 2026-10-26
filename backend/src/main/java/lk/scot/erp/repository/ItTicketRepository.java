package lk.scot.erp.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import lk.scot.erp.entity.ItTicket;
import lk.scot.erp.entity.ItTicketCategory;
import lk.scot.erp.entity.ItTicketStatus;

public interface ItTicketRepository extends JpaRepository<ItTicket, UUID> {

	List<ItTicket> findByEmployee_Id(UUID employeeId);

	List<ItTicket> findByStatus(ItTicketStatus status);

	List<ItTicket> findByCategory(ItTicketCategory category);

	List<ItTicket> findByAssignedToItAdmin_Id(UUID itAdminId);

	List<ItTicket> findByStatusAndAssignedToItAdmin_Id(ItTicketStatus status, UUID itAdminId);
}
