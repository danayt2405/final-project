package com.insa.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.*;
import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "complaints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String trackingNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complainant_id")
    @JsonIgnoreProperties({ "complaint", "hibernateLazyInitializer", "handler" })
    // prevent recursion
    private Complainant complainant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id")
    @JsonIgnoreProperties({ "complaints" }) // prevent recursion
    private ComplaintType type;

    private String location;

    @Column(name = "responsible_entity", columnDefinition = "TEXT")
    private String responsibleEntity;

    @Column(name = "date_occurred")
    private LocalDate dateOccurred;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "damage_loss")
    private String damageLoss;

    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(name = "execution_status")
    private ExecutionStatus executionStatus;

    @Column(name = "work_department")
    private String workDepartment;

    private String position;

    @Column(columnDefinition = "TEXT")
    private String additionalDetails;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id")
    @JsonIgnoreProperties({ "complaints", "hibernateLazyInitializer", "handler" }) // prevent recursion
    private Status status;

    @Column(name = "response_text", columnDefinition = "TEXT")
    private String responseText;

    @Column(name = "response_date")
    private LocalDateTime responseDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({ "complaint", "hibernateLazyInitializer", "handler" }) // stop loop
    private List<Attachment> attachments;

    public void setAttachments(List<Attachment> attachments) {
        this.attachments = attachments;
        if (attachments != null) {
            attachments.forEach(a -> a.setComplaint(this));
        }
    }

    public enum ExecutionStatus {
        Planned,
        Executed
    }
}
