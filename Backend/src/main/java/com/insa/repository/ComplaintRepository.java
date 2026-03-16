package com.insa.repository;

import com.insa.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByType_NameIgnoreCase(String name);

    List<Complaint> findByTypeIdIn(List<Long> ids);

    Optional<Complaint> findByTrackingNumber(String trackingNumber);

    @Query("""
        SELECT c FROM Complaint c
        LEFT JOIN FETCH c.complainant
        LEFT JOIN FETCH c.type
        LEFT JOIN FETCH c.status
        LEFT JOIN FETCH c.attachments
    """)
    List<Complaint> findAllFull();

    @Query("""
        SELECT c FROM Complaint c
        LEFT JOIN FETCH c.complainant
        LEFT JOIN FETCH c.type
        LEFT JOIN FETCH c.status
        LEFT JOIN FETCH c.attachments
        WHERE c.trackingNumber = :trackingNumber
    """)
    Optional<Complaint> findFullByTrackingNumber(String trackingNumber);
}
