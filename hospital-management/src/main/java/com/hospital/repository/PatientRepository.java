package com.hospital.repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hospital.entity.Patient;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByRegistrationNumber(String registrationNumber);

    boolean existsByRegistrationNumber(String registrationNumber);

    boolean existsByMobileNumber(String mobileNumber);
    Page<Patient> findByFullNameContainingIgnoreCaseOrMobileNumberContainingOrRegistrationNumberContainingIgnoreCase(
            String fullName,
            String mobileNumber,
            String registrationNumber,
            Pageable pageable
    );
}