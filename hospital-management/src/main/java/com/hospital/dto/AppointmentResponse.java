package com.hospital.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.hospital.entity.AppointmentStatus;

public class AppointmentResponse {

    private Long id;

    // Patient details
    private Long patientId;
    private String registrationNumber;
    private String patientName;

    // Doctor details
    private Long doctorId;
    private String doctorName;
    private String specialization;

    // Appointment details
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    
    private String reason;
    private Integer tokenNumber;
    private AppointmentStatus status;
    private boolean emergency; // ADD THIS
    
    private String referredBy;

    public AppointmentResponse() {
    }
    public Integer getTokenNumber() {
        return tokenNumber;
    }public void setTokenNumber(Integer tokenNumber) {
        this.tokenNumber = tokenNumber;
    }
    public String getReferredBy() {
        return referredBy;
    }

    public void setReferredBy(String referredBy) {
        this.referredBy = referredBy;
    }
    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
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

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }
    public boolean isEmergency() {
        return emergency;
    }

    public void setEmergency(boolean emergency) {
        this.emergency = emergency;
    }
}