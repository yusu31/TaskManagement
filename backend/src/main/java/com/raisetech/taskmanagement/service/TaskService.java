package com.raisetech.taskmanagement.service;

import com.raisetech.taskmanagement.entity.Task;
import com.raisetech.taskmanagement.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> findAll() {
        return taskRepository.findAll();
    }

    public Optional<Task> findById(Long id) {
        return taskRepository.findById(id);
    }

    public List<Task> searchTasks(String q, String status, String priority) {
        String normalizedQ = (q != null && !q.isBlank()) ? q : null;
        String normalizedStatus = (status != null && !status.isBlank()) ? status : null;
        String normalizedPriority = (priority != null && !priority.isBlank()) ? priority : null;
        return taskRepository.searchTasks(normalizedQ, normalizedStatus, normalizedPriority);
    }
}
