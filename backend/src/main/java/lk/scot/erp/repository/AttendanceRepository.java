package lk.scot.erp.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import lk.scot.erp.entity.Attendance;
import lk.scot.erp.entity.AttendanceStatus;

public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {

	Optional<Attendance> findByEmployee_IdAndPunchDate(UUID employeeId, LocalDate punchDate);

	List<Attendance> findByEmployee_Id(UUID employeeId);

	List<Attendance> findByEmployee_IdAndPunchDateBetween(
		UUID employeeId,
		LocalDate startDate,
		LocalDate endDate
	);

	List<Attendance> findByPunchDate(LocalDate punchDate);

	List<Attendance> findByStatusAndPunchDate(AttendanceStatus status, LocalDate punchDate);
}
