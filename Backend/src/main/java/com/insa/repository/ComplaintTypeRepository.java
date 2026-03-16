package com.insa.repository;

import com.insa.entity.ComplaintType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ComplaintTypeRepository extends JpaRepository<ComplaintType, Long> {
    Optional<ComplaintType> findByNameIgnoreCase(String name);
}
