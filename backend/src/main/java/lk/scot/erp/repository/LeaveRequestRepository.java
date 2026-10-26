package lk.scot.erp.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import lk.scot.erp.entity.LeaveRequest;
import lk.scot.erp.entity.LeaveRequestStatus;
import lk.scot.erp.entity.LeaveType;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {

	List<LeaveRequest> findByEmployee_Id(UUID employeeId);

	List<LeaveRequest> findByStatus(LeaveRequestStatus status);

	List<LeaveRequest> findByEmployee_IdAndStatus(UUID employeeId, LeaveRequestStatus status);

	List<LeaveRequest> findByLeaveType(LeaveType leaveType);

	List<LeaveRequest> findByEmployee_DirectSupervisor_IdAndStatus(
		UUID supervisorId,
		LeaveRequestStatus status
	);

	List<LeaveRequest> findByEmployee_IdAndStatusIn(UUID employeeId, Collection<LeaveRequestStatus> statuses);
}
