package com.hospital.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.hospital.dto.AppointmentRequest;
import com.hospital.dto.AppointmentResponse;
import com.hospital.entity.AppointmentStatus;
import com.hospital.service.AppointmentService;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(
            AppointmentService appointmentService) {

        this.appointmentService = appointmentService;
    }


    // ==========================================
    // Book Appointment
    // ADMIN + RECEPTIONIST
    // ==========================================

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<AppointmentResponse> createAppointment(
            @Valid @RequestBody AppointmentRequest request) {

        AppointmentResponse response =
                appointmentService.createAppointment(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // ==========================================
    // Get All Appointments
    // ADMIN + RECEPTIONIST + DOCTOR
    // ==========================================

    @GetMapping
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public ResponseEntity<List<AppointmentResponse>>
    getAllAppointments() {

        return ResponseEntity.ok(
                appointmentService.getAllAppointments()
        );
    }


    // ==========================================
    // Get Appointments by Doctor
    // ADMIN + RECEPTIONIST + DOCTOR
    // ==========================================

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public ResponseEntity<List<AppointmentResponse>>
    getAppointmentsByDoctor(
            @PathVariable Long doctorId) {

        return ResponseEntity.ok(
                appointmentService
                        .getAppointmentsByDoctor(doctorId)
        );
    }


    // ==========================================
    // Get Appointments by Patient
    // ADMIN + RECEPTIONIST + DOCTOR
    // ==========================================

    @GetMapping("/patient/{patientId}")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public ResponseEntity<List<AppointmentResponse>>
    getAppointmentsByPatient(
            @PathVariable Long patientId) {

        return ResponseEntity.ok(
                appointmentService
                        .getAppointmentsByPatient(patientId)
        );
    }


    // ==========================================
    // Get Appointments by Date
    // ADMIN + RECEPTIONIST + DOCTOR
    // ==========================================

    @GetMapping("/date/{date}")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public ResponseEntity<List<AppointmentResponse>>
    getAppointmentsByDate(
            @PathVariable LocalDate date) {

        return ResponseEntity.ok(
                appointmentService
                        .getAppointmentsByDate(date)
        );
    }


    // ==========================================
    // Get Doctor Appointments by Date
    // ADMIN + RECEPTIONIST + DOCTOR
    // ==========================================

    @GetMapping("/doctor/{doctorId}/date/{date}")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public ResponseEntity<List<AppointmentResponse>>
    getDoctorAppointmentsByDate(
            @PathVariable Long doctorId,
            @PathVariable LocalDate date) {

        return ResponseEntity.ok(
                appointmentService
                        .getDoctorAppointmentsByDate(
                                doctorId,
                                date)
        );
    }


    // ==========================================
    // Update Appointment Status
    // ADMIN + DOCTOR
    // ==========================================

    @PatchMapping("/{appointmentId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<AppointmentResponse>
    updateStatus(
            @PathVariable Long appointmentId,
            @RequestParam AppointmentStatus status) {

        return ResponseEntity.ok(
                appointmentService.updateStatus(
                        appointmentId,
                        status)
        );
    }
}