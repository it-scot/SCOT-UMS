package lk.scot.erp.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import lk.scot.erp.entity.HrRequest;
import lk.scot.erp.entity.HrRequestStatus;
import lk.scot.erp.entity.HrRequestType;

public interface HrRequestRepository extends JpaRepository<HrRequest, UUID> {

	List<HrRequest> findByEmployee_Id(UUID employeeId);

	List<HrRequest> findByStatus(HrRequestStatus status);

	List<HrRequest> findByRequestType(HrRequestType requestType);

	List<HrRequest> findByEmployee_IdAndStatus(UUID employeeId, HrRequestStatus status);
}
