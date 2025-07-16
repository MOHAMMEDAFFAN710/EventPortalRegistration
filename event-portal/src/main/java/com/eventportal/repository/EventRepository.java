package com.eventportal.repository;  // Note the "repository" package!

import com.eventportal.model.Event;  // Import your Event entity
import org.springframework.data.jpa.repository.JpaRepository;

// This interface handles database operations for Event objects
public interface EventRepository extends JpaRepository<Event, Long> {
    // No need to write methods—Spring Data JPA provides them automatically!
    // (e.g., save(), findAll(), deleteById())
}