package com.mindigo.routine_service.repository;

import com.mindigo.routine_service.entity.RoutineActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoutineActivityRepository extends JpaRepository<RoutineActivity, Long> {

    List<RoutineActivity> findByRoutineIdAndIsActiveTrue(Long routineId);

    @Query("SELECT ra FROM RoutineActivity ra WHERE ra.routine.id = :routineId AND ra.dayOfWeek = :dayOfWeek AND ra.isActive = true ORDER BY ra.startTime")
    List<RoutineActivity> findByRoutineIdAndDayOfWeekOrderByStartTime(@Param("routineId") Long routineId, @Param("dayOfWeek") String dayOfWeek);
}
