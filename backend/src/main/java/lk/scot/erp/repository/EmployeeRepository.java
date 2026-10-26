package lk.scot.erp.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import lk.scot.erp.entity.Employee;
import lk.scot.erp.entity.EmployeeStatus;
import lk.scot.erp.entity.ShiftType;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

	Optional<Employee> findByEmpNumber(String empNumber);

	Optional<Employee> findByOfficialEmailIgnoreCase(String officialEmail);

	List<Employee> findByDepartmentIgnoreCase(String department);

	List<Employee> findByStatus(EmployeeStatus status);

	List<Employee> findByCurrentShift(ShiftType currentShift);

	List<Employee> findByDirectSupervisor_Id(UUID supervisorId);
}
