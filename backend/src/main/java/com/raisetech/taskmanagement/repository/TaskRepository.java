package com.raisetech.taskmanagement.repository;

import com.raisetech.taskmanagement.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
}
