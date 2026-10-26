package lk.scot.erp.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import lk.scot.erp.entity.Evaluation;
import lk.scot.erp.entity.EvaluationStatus;

public interface EvaluationRepository extends JpaRepository<Evaluation, UUID> {

	List<Evaluation> findByEmployee_Id(UUID employeeId);

	Optional<Evaluation> findByEmployee_IdAndCycleYear(UUID employeeId, int cycleYear);

	List<Evaluation> findByCycleYear(int cycleYear);

	List<Evaluation> findByStatus(EvaluationStatus status);

	List<Evaluation> findByCycleYearAndStatus(int cycleYear, EvaluationStatus status);
}
