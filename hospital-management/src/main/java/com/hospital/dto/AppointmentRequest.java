package com.hospital.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AppointmentRequest {

    // Patient ID
    @NotNull(message = "Patient is required")
    private Long patientId;

    // Doctor ID
    @NotNull(message = "Doctor is required")
    private Long doctorId;

    // Appointment Date
    @NotNull(message = "Appointment date is required")
    @FutureOrPresent(message = "Appointment date cannot be in the past")
    private LocalDate appointmentDate;

    // Appointment Time
    @NotNull(message = "Appointment time is required")
    private LocalTime appointmentTime;

    // Reason / Symptoms
    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;
 // Detailed Description
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
    private String referredBy;
    @Column(nullable = false)
    private boolean emergency = false;

public boolean isEmergency() {
    return emergency;
}

public void setEmergency(boolean emergency) {
    this.emergency = emergency;
}
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
    public String getReferredBy() {
        return referredBy;
    }

    public void setReferredBy(String referredBy) {
        this.referredBy = referredBy;
    }
    // Getters and Setters

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDate appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public LocalTime getAppointmentTime() {
        return appointmentTime;
    }

    public void setAppointmentTime(LocalTime appointmentTime) {
        this.appointmentTime = appointmentTime;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}