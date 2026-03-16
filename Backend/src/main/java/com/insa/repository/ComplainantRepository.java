package com.insa.repository;

import com.insa.entity.Complainant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComplainantRepository extends JpaRepository<Complainant, Long> {
}
