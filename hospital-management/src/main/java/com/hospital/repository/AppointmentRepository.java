package com.hospital.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hospital.entity.Appointment;
import com.hospital.entity.AppointmentStatus;

public interface AppointmentRepository
        extends JpaRepository<Appointment, Long> {

    // Patient चे appointments
    List<Appointment> findByPatientId(Long patientId);

    // Doctor चे appointments
    List<Appointment> findByDoctorId(Long doctorId);

    // Specific date चे appointments
    List<Appointment> findByAppointmentDate(LocalDate appointmentDate);

    // Doctor + Date चे appointments
    List<Appointment> findByDoctorIdAndAppointmentDate(
            Long doctorId,
            LocalDate appointmentDate);

    // Status नुसार appointments
    List<Appointment> findByStatus(
            AppointmentStatus status);

    // Doctor + Date + Status
    List<Appointment>
    findByDoctorIdAndAppointmentDateAndStatus(
            Long doctorId,
            LocalDate appointmentDate,
            AppointmentStatus status);
    int countByDoctorIdAndAppointmentDateAndStatusNot(
            Long doctorId,
            LocalDate appointmentDate,
            AppointmentStatus status);
}
