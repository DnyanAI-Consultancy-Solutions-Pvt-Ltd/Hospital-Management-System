package com.hospital.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.hospital.dto.DoctorProfileRequest;
import com.hospital.dto.DoctorProfileResponse;
import com.hospital.service.DoctorProfileService;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin
public class DoctorProfileController {

    private final DoctorProfileService doctorProfileService;

    public DoctorProfileController(
            DoctorProfileService doctorProfileService) {

        this.doctorProfileService = doctorProfileService;
    }

    // Admin creates Doctor Profile
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorProfileResponse> createDoctor(
            @Valid @RequestBody DoctorProfileRequest request) {

        DoctorProfileResponse response =
                doctorProfileService.createProfile(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Admin, Doctor and Receptionist can view all doctors
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    public ResponseEntity<List<DoctorProfileResponse>> getAllDoctors() {

        return ResponseEntity.ok(
                doctorProfileService.getAllDoctors()
        );
    }

    // Available doctors - useful for appointment booking
    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    public ResponseEntity<List<DoctorProfileResponse>> getAvailableDoctors() {

        return ResponseEntity.ok(
                doctorProfileService.getAvailableDoctors()
        );
    }

    // Get one doctor
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    public ResponseEntity<DoctorProfileResponse> getDoctorById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                doctorProfileService.getDoctorById(id)
        );
    }
}