package com.raisetech.taskmanagement.repository;

import com.raisetech.taskmanagement.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query("""
            SELECT t FROM Task t
            WHERE (:q IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :q, '%'))
                              OR LOWER(t.description) LIKE LOWER(CONCAT('%', :q, '%')))
              AND (:status IS NULL OR t.status = :status)
              AND (:priority IS NULL OR t.priority = :priority)
            ORDER BY t.position ASC NULLS LAST
            """)
    List<Task> searchTasks(@Param("q") String q,
                           @Param("status") String status,
                           @Param("priority") String priority);
}
